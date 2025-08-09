/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// In: apps/rentflow-api/src/modules/vehicles/vehicles.service.ts
import { Injectable, InternalServerErrorException, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {  Vehicle, VehicleImage, VehicleStatus } from '@rentflow/database';
import { CreateVehicleDto } from './dto/create-vehicule.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto'; 
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Prisma } from '@rentflow/database';



export type VehicleWithImages = Vehicle & { images: VehicleImage[] };
export type VehicleWithAvailability = Vehicle & {
  images: VehicleImage[];
  engagements: Engagement[];
};

type TransactionalPrismaClient = Prisma.TransactionClient;

interface Engagement {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class VehiclesService implements OnModuleInit {
  private readonly logger = new Logger(VehiclesService.name);
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('--- Initializing Vehicle Statuses on Startup ---');
    await this.synchronizeAllVehicleStatuses();
  }

  async synchronizeAllVehicleStatuses() {
    const vehicles = await this.prisma.vehicle.findMany({
      select: { id: true },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const vehicle of vehicles) {
        await this.updateVehicleStatus(vehicle.id, tx);
      }
    });

    this.logger.log(
      `Synchronization complete. ${vehicles.length} vehicle statuses checked.`,
    );
  }
  async updateVehicleStatus(
    vehicleId: string,
    tx: TransactionalPrismaClient,
  ): Promise<void> {
    const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) return;


    if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'INACTIVE') {
      return;
    }

    const now = new Date();
    // 1. Chercher un contrat actif AUJOURD'HUI
    const activeContract = await tx.contract.findFirst({
      where: {
        vehicleId,
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (activeContract) {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: VehicleStatus.RENTED },
      });
      return;
    }

    // 2. Chercher une réservation active AUJOURD'HUI
    const activeReservation = await tx.reservation.findFirst({
      where: {
        vehicleId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (activeReservation) {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: VehicleStatus.RESERVED },
      });
      return;
    }

    await tx.vehicle.update({
      where: { id: vehicleId, status: { notIn: ['MAINTENANCE', 'INACTIVE'] } },
      data: { status: VehicleStatus.AVAILABLE },
    });
  }
  async findAllByAgency(agencyId: string): Promise<VehicleWithImages[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { agencyId },
      include: {
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        contracts: { where: { status: 'ACTIVE' } },
        reservations: { where: { status: { in: ['PENDING', 'CONFIRMED'] } } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return vehicles.map((vehicle) => {
      const contractEngagements: Engagement[] = vehicle.contracts.map((c) => ({
        startDate: c.startDate,
        endDate: c.endDate,
      }));

      const reservationEngagements: Engagement[] = vehicle.reservations.map(
        (r) => ({
          startDate: r.startDate,
          endDate: r.endDate,
        }),
      );

      const allEngagements = [
        ...contractEngagements,
        ...reservationEngagements,
      ];

      const { contracts, reservations, ...restOfVehicle } = vehicle;

      return {
        ...restOfVehicle,
        engagements: allEngagements,
      };
    });
  }
  async findAllByAgencyAndStatus(
    agencyId: string,
    status: VehicleStatus,
  ): Promise<VehicleWithImages[]> {
    return this.prisma.vehicle.findMany({
      where: {
        agencyId: agencyId,
        status: status,
      },
      include: {
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async create(
    dto: CreateVehicleDto,
    files: Array<Express.Multer.File>,
    agencyId: string,
  ): Promise<Vehicle> {
    try {
      const newVehicle = await this.prisma.$transaction(async (tx) => {
        const vehicle = await tx.vehicle.create({
          data: {
            ...dto,
            agencyId: agencyId,
          },
        });

        if (files && files.length > 0) {
          const imageRecords = files.map((file) => ({
            url: `/uploads/${file.filename}`,
            vehicleId: vehicle.id,
          }));

          await tx.vehicleImage.createMany({
            data: imageRecords,
          });
        }

        return vehicle;
      });

      const vehicleWithImages = await this.prisma.vehicle.findUnique({
        where: { id: newVehicle.id },
        include: { images: true },
      });

      if (!vehicleWithImages) {
        throw new InternalServerErrorException(
          'Vehicle not found after creation.',
        );
      }

      return vehicleWithImages;
    } catch (error) {
      this.logger.error('Failed to create vehicle', error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la création du véhicule.',
      );
    }
  }

  async findOne(
    vehicleId: string,
    agencyId: string,
  ): Promise<VehicleWithImages> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, agencyId },
      include: { images: true },
    });
    if (!vehicle) {
      throw new NotFoundException(
        `Véhicule avec ID "${vehicleId}" non trouvé.`,
      );
    }
    return vehicle;
  }

  async update(
    vehicleId: string,
    dto: UpdateVehicleDto,
    files: Array<Express.Multer.File>,
    agencyId: string,
  ): Promise<VehicleWithImages> {
    await this.findOne(vehicleId, agencyId);
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.imagesToDelete && dto.imagesToDelete.length > 0) {
          const images = await tx.vehicleImage.findMany({
            where: { id: { in: dto.imagesToDelete }, vehicleId: vehicleId },
          });
          await tx.vehicleImage.deleteMany({
            where: { id: { in: dto.imagesToDelete }, vehicleId: vehicleId },
          });
          for (const image of images) {
            await this.deleteFile(image.url);
          }
        }
        if (files && files.length > 0) {
          const newImageRecords = files.map((file) => ({
            url: `/uploads/${file.filename}`,
            vehicleId: vehicleId,
          }));
          await tx.vehicleImage.createMany({ data: newImageRecords });
        }
        const { imagesToDelete, ...vehicleData } = dto;

        await tx.vehicle.update({
          where: { id: vehicleId },
          data: vehicleData,
        });
        const finalVehicleWithImages = await tx.vehicle.findUnique({
          where: { id: vehicleId },
          include: {
            images: true,
          },
        });
        if (!finalVehicleWithImages) {
          throw new InternalServerErrorException(
            'Impossible de récupérer le véhicule après la mise à jour.',
          );
        }

        return finalVehicleWithImages;
      });
    } catch (error) {
      this.logger.error(`Failed to update vehicle ${vehicleId}`, error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour du véhicule.',
      );
    }
  }

  private async deleteFile(filePath: string) {
    try {
      // Étape 1: On construit un chemin qui part de la racine du PROJET API
      // Le point '.' représente le répertoire racine de l'application NestJS
      // (qui est 'apps/rentflow-api' dans votre cas).
      const absolutePath = join(process.cwd(), filePath);

      this.logger.log(
        `Tentative de suppression du fichier à : ${absolutePath}`,
      );

      await unlink(absolutePath);
      this.logger.log(`Fichier supprimé avec succès : ${absolutePath}`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.logger.warn(
          `Fichier non trouvé, impossible de supprimer : ${error.path}`,
        );
      } else {
        this.logger.error(`Échec de la suppression du fichier`, error.stack);
      }
    }
  }
}






