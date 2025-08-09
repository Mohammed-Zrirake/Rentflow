/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// rentflow-api/src/modules/reservations/reservations.service.ts

import {  ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { VehiclesService } from '../vehicles/vehicles.service'; 
import { PrismaService } from '../prisma/prisma.service';
import { Reservation, Prisma, ReservationStatus, InvoiceStatus, VehicleStatus } from '@rentflow/database';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';
import * as dayjs from 'dayjs';

export type FullReservation = Reservation & {
  client: { firstName: string; lastName: string };
  vehicle: { make: string; model: string };
  createdBy: { name: string | null };
  payments: { amount: Prisma.Decimal }[];
};

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private vehiclesService: VehiclesService,
  ) {}
  /**
   * Finds all reservations for a specific agency, including related data.
   * @param agencyId The ID of the agency.
   * @returns A promise that resolves to an array of reservations.
   */
  async findAllByAgency(agencyId: string): Promise<FullReservation[]> {
    return this.prisma.reservation.findMany({
      where: {
        agencyId: agencyId,
      },
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
        vehicle: {
          select: { make: true, model: true },
        },
        createdBy: {
          select: { name: true },
        },
        payments: {
          select: { amount: true },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }
  async create(
    dto: CreateReservationDto,
    agencyId: string,
    createdById: string,
  ): Promise<Reservation> {
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, agencyId },
    });
    if (!client) throw new NotFoundException('Client non trouvé.');

    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, agencyId },
    });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé.');

    if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'INACTIVE') {
      throw new ConflictException(
        `Ce véhicule est actuellement en maintenance ou inactif et ne peut pas être réservé.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Étape 1: Créer la réservation (inchangé)
      const reservation = await tx.reservation.create({
        data: {
          startDate: dto.startDate,
          endDate: dto.endDate,
          estimatedCost: dto.estimatedCost,
          notes: dto.notes,
          status: 'PENDING',
          clientId: dto.clientId,
          vehicleId: dto.vehicleId,
          agencyId: agencyId,
          createdById: createdById,
        },
      });

      // await tx.vehicle.update({
      //   where: {
      //     id: vehicle.id,
      //   },
      //   data: {
      //     status: 'RESERVED',
      //   },
      // });
      await this.vehiclesService.updateVehicleStatus(dto.vehicleId,tx);

      let totalPaid = 0;
      if (dto.payments && dto.payments.length > 0) {
        const paymentData = dto.payments.map((p) => {
          totalPaid += p.amount;
          return {
            amount: p.amount,
            method: p.method,
            reservationId: reservation.id,
          };
        });
        await tx.payment.createMany({
          data: paymentData,
        });
      }

      await tx.invoice.create({
        data: {
          invoiceNumber: `PRO-${dayjs().format('YYYYMMDD')}-${reservation.id.slice(-4)}`,
          status:
            totalPaid > 0
              ? InvoiceStatus.PARTIALLY_PAID
              : InvoiceStatus.PENDING,
          totalAmount: reservation.estimatedCost,
          amountPaid: totalPaid,
          agencyId: agencyId,
          clientId: reservation.clientId,
          reservationId: reservation.id,
        } as any,
      });

      return reservation;
    });
  }
  async cancel(reservationId: string, agencyId: string): Promise<Reservation> {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findFirst({
        where: {
          id: reservationId,
          agencyId: agencyId,
        },
      });

      if (!reservation) {
        throw new NotFoundException(
          `Réservation avec ID "${reservationId}" non trouvée.`,
        );
      }

      if (
        reservation.status === 'COMPLETED' ||
        reservation.status === 'CANCELLED'
      ) {
        throw new ForbiddenException(
          `Cette réservation ne peut plus être annulée.`,
        );
      }

      const updatedReservation = await tx.reservation.update({
        where: {
          id: reservationId,
        },
        data: {
          status: ReservationStatus.CANCELLED,
        },
      });


 await tx.invoice.update({
   where: { reservationId: reservationId },
   data: { status: InvoiceStatus.VOID },
 });

       await this.vehiclesService.updateVehicleStatus(
         reservation.vehicleId,
         tx,
       );

      return updatedReservation;
    });
  }
  /**
   * Finds a single reservation by its ID, ensuring it belongs to the agency.
   * @param id The ID of the reservation.
   * @param agencyId The ID of the agency making the request.
   * @returns The reservation with its related client, vehicle, and payments.
   */
  async findOneById(id: string, agencyId: string) {
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        id,
        agencyId,
      },
      include: {
        client: true,
        vehicle: true,
        payments: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID "${id}" non trouvée.`);
    }
    return reservation;
  }
  /**
   * Updates a reservation.
   * @param id The ID of the reservation to update.
   * @param agencyId The ID of the agency making the request.
   * @param dto The data to update.
   * @returns The updated reservation.
   */
  async update(
    id: string,
    agencyId: string,
    dto: UpdateReservationDto,
  ): Promise<Reservation> {
     return this.prisma.$transaction(async (tx) => {
       const existingReservation = await this.prisma.reservation.findFirst({
         where: {
           id,
           agencyId,
         },
         include: { payments: true },
       });

       if (!existingReservation) {
         throw new NotFoundException(
           `Réservation avec l'ID "${id}" non trouvée.`,
         );
       }

       if (
         existingReservation.status === 'COMPLETED' ||
         existingReservation.status === 'CANCELLED'
       ) {
         throw new ForbiddenException(
           `Cette réservation ne peut plus être modifiée car son statut est "${existingReservation.status}".`,
         );
       }
         if (dto.payments && dto.payments.length > 0) {
           const paymentData = dto.payments.map((p) => ({
             amount: p.amount,
             method: p.method,
             reservationId: id, 
           }));
           await tx.payment.createMany({
             data: paymentData,
           });
         }

       const updatedReservation = await tx.reservation.update({
         where: { id },
         data: {
           // On s'assure de ne pas passer de champs non autorisés
           clientId: dto.clientId,
           vehicleId: dto.vehicleId,
           startDate: dto.startDate,
           endDate: dto.endDate,
           estimatedCost: dto.estimatedCost,
           notes: dto.notes,
           status: dto.status,
         },
       });

     const allPayments = await tx.payment.findMany({ where: { reservationId: id } });
     const newTotalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
     const newTotalCost = Number(updatedReservation.estimatedCost);
     const newInvoiceStatus = 
          newTotalPaid >= newTotalCost 
              ? InvoiceStatus.PAID 
              : newTotalPaid > 0
                  ? InvoiceStatus.PARTIALLY_PAID
                  : InvoiceStatus.PENDING;

      await tx.invoice.update({
          where: { reservationId: id },
          data: {
              totalAmount: newTotalCost,
              amountPaid: newTotalPaid,
              status: newInvoiceStatus
          }
      });

      return updatedReservation;
    });
  }

  async confirm(
    reservationId: string,
    agencyId: string,
    dto: ConfirmReservationDto,
  ): Promise<Reservation> {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findFirst({
        where: { id: reservationId, agencyId },
        include: {
          payments: true,
          invoice: true,
        },
      });

      if (!reservation) {
        throw new NotFoundException('Réservation non trouvée.');
      }
      if (reservation.status !== 'PENDING') {
        throw new ConflictException(
          `Cette réservation a déjà le statut "${reservation.status}".`,
        );
      }
      // const totalCost = Number(reservation.estimatedCost);
      // const totalPaidSoFar = reservation.payments.reduce(
      //   (sum, payment) => sum + Number(payment.amount),
      //   0,
      // );
      // const newPaymentAmount = dto.downPaymentAmount || 0;
      // const newTotalPaid = totalPaidSoFar + newPaymentAmount;
      // const requiredAmount = totalCost * 0.5;

      // if (newTotalPaid < requiredAmount) {
      //   throw new BadRequestException(
      //     `Paiement insuffisant pour confirmer. Un minimum de 50% (${requiredAmount.toFixed(
      //       2,
      //     )} MAD) est requis. Montant total après ce paiement : ${newTotalPaid.toFixed(2)} MAD.`,
      //   );
      // }

      if (
        dto.downPaymentAmount &&
        dto.downPaymentAmount > 0 &&
        dto.downPaymentMethod
      ) {
        await tx.payment.create({
          data: {
            amount: dto.downPaymentAmount,
            method: dto.downPaymentMethod,
            reservationId: reservationId,
          },
        });
      }

      const allPayments = await tx.payment.findMany({
        where: { reservationId },
      });
      const newTotalPaid = allPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );
      const totalCost = Number(reservation.estimatedCost);

      if (reservation.invoice) {
        const newInvoiceStatus =
          newTotalPaid >= totalCost
            ? InvoiceStatus.PAID
            : newTotalPaid > 0
              ? InvoiceStatus.PARTIALLY_PAID
              : InvoiceStatus.PENDING; // Si 0 payé, reste en attente

        await tx.invoice.update({
          where: { id: reservation.invoice.id },
          data: {
            amountPaid: newTotalPaid,
            status: newInvoiceStatus,
          },
        });
      }

      // Étape 4 : Mettre à jour le statut de la réservation
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'CONFIRMED' },
      });

      return updatedReservation;
    });
  }
}