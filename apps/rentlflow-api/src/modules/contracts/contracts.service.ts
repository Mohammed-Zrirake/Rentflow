/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddPaymentDto } from './dto/add-payment.dto';
import { Contract } from '@rentflow/database';
import { CreateContractDto } from './dto/create-direct-contract.dto';
import * as dayjs from 'dayjs';
import { VehiclesService } from '../vehicles/vehicles.service';

import { TerminateContractDto, VehicleReturnState } from './dto/terminate-contract.dto';
import { VehicleStatus, InvoiceStatus } from '@rentflow/database'; 
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private vehiclesService: VehiclesService,
  ) {}

  async findAllByAgency(agencyId: string) {
    // La requête Prisma pour récupérer les contrats
    return this.prisma.contract.findMany({
      where: {
        agencyId: agencyId,
      },
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
        vehicle: {
          select: { make: true, model: true, licensePlate: true },
        },
        createdBy: {
          select: { name: true },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async addPayment(contractId: string, agencyId: string, dto: AddPaymentDto) {
    // Vérifier que le contrat existe et appartient à l'agence
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, agencyId },
    });

    if (!contract) {
      throw new NotFoundException('Contrat non trouvé.');
    }
    // On ne peut ajouter de paiement que sur un contrat actif
    if (contract.status !== 'ACTIVE') {
      throw new ConflictException(
        "Les paiements ne peuvent être ajoutés qu'à un contrat actif.",
      );
    }

    // Créer et lier le nouveau paiement
    return this.prisma.payment.create({
      data: {
        amount: dto.amount,
        method: dto.method,
        contractId: contractId, // Lier le paiement au contrat
      },
    });
  }
  async create(
    dto: CreateContractDto,
    agencyId: string,
    createdById: string,
  ): Promise<Contract> {
    return this.prisma.$transaction(async (tx) => {
      let newContract: Contract;

      if (dto.reservationId) {
        const reservation = await tx.reservation.findUnique({
          where: { id: dto.reservationId },
        });

        if (!reservation || reservation.agencyId !== agencyId) {
          throw new NotFoundException('Réservation non trouvée.');
        }
        if (reservation.status !== 'CONFIRMED') {
          throw new ConflictException(
            `Un contrat ne peut être créé qu'à partir d'une réservation confirmée.`,
          );
        }

        newContract = await tx.contract.create({
          data: {
            startDate: dto.startDate!,
            endDate: dto.endDate!,
            totalCost: dto.totalCost!,
            dailyRate: dto.dailyRate ?? 0,

            clientId: reservation.clientId,
            vehicleId: reservation.vehicleId,
            reservationId: reservation.id,

            pickupMileage: dto.pickupMileage,
            pickupFuelLevel: dto.pickupFuelLevel,
            pickupNotes: dto.pickupNotes,
            secondaryDriverId: dto.secondaryDriverId,

            status: 'ACTIVE',
            agencyId: agencyId,
            createdById: createdById,
          },
        });

        await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: 'COMPLETED' },
        });
        // await tx.vehicle.update({
        //   where: { id: reservation.vehicleId },
        //   data: { status: 'RENTED' },
        // });
          await this.vehiclesService.updateVehicleStatus(
            reservation.vehicleId,
            tx,
          );
      } else {
        if (
          !dto.clientId ||
          !dto.vehicleId ||
          !dto.startDate ||
          !dto.endDate ||
          !dto.totalCost
        ) {
          throw new BadRequestException(
            'Les informations client, véhicule, dates et coût sont requises.',
          );
        }

        // const vehicle = await tx.vehicle.findUnique({
        //   where: { id: dto.vehicleId },
        // });
        // if (!vehicle || vehicle.status !== 'AVAILABLE') {
        //   throw new ConflictException("Ce véhicule n'est pas disponible.");
        // }

            const newStartDate = new Date(dto.startDate);
            const newEndDate = new Date(dto.endDate);

            const conflictingEngagement = await tx.vehicle.findFirst({
              where: {
                id: dto.vehicleId,
                OR: [
                  {
                    contracts: {
                      some: {
                        status: 'ACTIVE',
                        startDate: { lt: newEndDate },
                        endDate: { gt: newStartDate },
                      },
                    },
                  },
                  {
                    reservations: {
                      some: {
                        status: { in: ['PENDING', 'CONFIRMED'] },
                        startDate: { lt: newEndDate },
                        endDate: { gt: newStartDate },
                      },
                    },
                  },
                ],
              },
            });

            if (conflictingEngagement) {
              throw new ConflictException(
                'La période sélectionnée est indisponible car elle chevauche un autre engagement.',
              );
            }

        newContract = await tx.contract.create({
          data: {
            startDate: dto.startDate,
            endDate: dto.endDate,
            totalCost: dto.totalCost,
            dailyRate: dto.dailyRate ?? 0,
            pickupMileage: dto.pickupMileage,
            pickupFuelLevel: dto.pickupFuelLevel,
            pickupNotes: dto.pickupNotes,
            status: 'ACTIVE',
            agency: { connect: { id: agencyId } },
            createdBy: { connect: { id: createdById } },
            client: { connect: { id: dto.clientId } },
            vehicle: { connect: { id: dto.vehicleId } },
            ...(dto.secondaryDriverId && {
              secondaryDriver: { connect: { id: dto.secondaryDriverId } },
            }),
          },
        });

        // await tx.vehicle.update({
        //   where: { id: dto.vehicleId },
        //   data: { status: 'RENTED' },
        // });
        await this.vehiclesService.updateVehicleStatus(dto.vehicleId, tx);
      }

      let totalPaid = 0;
      if (dto.payments && dto.payments.length > 0) {
        const payment = dto.payments[0];
        totalPaid = payment.amount;
        await tx.payment.create({
          data: {
            amount: payment.amount,
            method: payment.method,
            contractId: newContract.id,
          },
        });
      }

      await tx.invoice.create({
        data: {
          invoiceNumber: `FACT-${dayjs().format('YYYYMMDD')}-${newContract.id.slice(-4)}`,
          status:
            totalPaid >= newContract.totalCost.toNumber()
              ? InvoiceStatus.PAID
              : totalPaid > 0
                ? InvoiceStatus.PARTIALLY_PAID
                : InvoiceStatus.PENDING,
          totalAmount: newContract.totalCost,
          amountPaid: totalPaid,
          agencyId: agencyId,
          clientId: newContract.clientId,
          contractId: newContract.id,
        },
      });

      return newContract;
    });
  }
  async cancel(contractId: string, agencyId: string): Promise<Contract> {
    return this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.findFirst({
        where: { id: contractId, agencyId },
      });

      if (!contract) {
        throw new NotFoundException('Contrat non trouvé.');
      }
      if (contract.status !== 'ACTIVE') {
        throw new ConflictException(
          `Seul un contrat actif peut être annulé. Statut actuel : "${contract.status}".`,
        );
      }
      const cancelledContract = await tx.contract.update({
        where: { id: contractId },
        data: { status: 'CANCELLED' },
      });


  await tx.invoice.update({
    where: { contractId: contractId },
    data: { status: InvoiceStatus.VOID }, 
  });


      await this.vehiclesService.updateVehicleStatus(contract.vehicleId, tx);

      return cancelledContract;
    });
  }

  async findOneById(contractId: string, agencyId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: {
        id: contractId,
        agencyId: agencyId,
      },
      include: {
        client: true,
        secondaryDriver: true,
        vehicle: true,
        createdBy: { select: { name: true } },
        payments: true,
        invoice: true,
      },
    });

    if (!contract) {
      throw new NotFoundException(
        `Contrat avec l'ID "${contractId}" non trouvé.`,
      );
    }

    return contract;
  }
  async terminate(
    contractId: string,
    agencyId: string,
    dto: TerminateContractDto,
  ): Promise<Contract> {
    return this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.findFirst({
        where: { id: contractId, agencyId },
        include: {
          payments: true,
        },
      });

      if (!contract) {
        throw new NotFoundException('Contrat non trouvé.');
      }
      if (contract.status !== 'ACTIVE') {
        throw new ConflictException('Seul un contrat actif peut être terminé.');
      }
      if (dto.returnMileage < contract.pickupMileage) {
        throw new BadRequestException(
          'Le kilométrage de retour ne peut être inférieur au kilométrage de départ.',
        );
      }
     

   const startDate = dayjs(contract.startDate);
   const effectiveReturnDate = dayjs(dto.returnDate);
   const actualDurationDays = Math.max(
     1,
     effectiveReturnDate.diff(startDate, 'day'),
   );
   const finalTotalCost = actualDurationDays * Number(contract.dailyRate);
   const totalPaidSoFar = contract.payments.reduce(
     (sum, p) => sum + Number(p.amount),
     0,
   );
   const finalPaymentAmount = dto.finalPaymentAmount || 0;
   const newTotalPaid = totalPaidSoFar + finalPaymentAmount;
   if (newTotalPaid < finalTotalCost) {
     throw new BadRequestException(
       `Paiement insuffisant. Le nouveau solde est de ${(finalTotalCost - totalPaidSoFar).toFixed(2)} MAD.`,
     );
   }
   
    if (
      dto.finalPaymentAmount &&
      dto.finalPaymentAmount > 0 &&
      dto.finalPaymentMethod
    ) {
      await tx.payment.create({
        data: {
          amount: dto.finalPaymentAmount,
          method: dto.finalPaymentMethod,
          contractId: contractId,
        },
      });
    }


      const terminatedContract = await tx.contract.update({
        where: { id: contractId },
        data: {
          status: 'COMPLETED',
          returnDate: dto.returnDate,
          endDate: dto.returnDate,
          totalCost: finalTotalCost,
          returnMileage: dto.returnMileage,
          returnFuelLevel: dto.returnFuelLevel,
          returnNotes: dto.returnNotes,
        },
      });

        await tx.vehicle.update({
          where: { id: contract.vehicleId },
          data: { mileage: dto.returnMileage },
        });

         if (dto.vehicleState === VehicleReturnState.DAMAGED) {
           await tx.vehicle.update({
             where: { id: terminatedContract.vehicleId },
             data: { status: VehicleStatus.MAINTENANCE },
           });


           const now = new Date();
           const futureEngagements = await tx.reservation.findMany({
             where: {
               vehicleId: terminatedContract.vehicleId,
               status: { in: ['PENDING', 'CONFIRMED'] },
               startDate: { gte: now },
             },
             include: { client: true },
           });

           if (futureEngagements.length > 0) {
             const alertsToCreate = futureEngagements.map((engagement) => ({
               agencyId: agencyId,
               vehicleId: terminatedContract.vehicleId,
               clientId: engagement.clientId,
               type: 'CUSTOM' as const,
               message: `Conflit: Le véhicule pour la réservation de ${engagement.client.firstName} ${engagement.client.lastName} a été mis en maintenance.`,
             }));
             await tx.alert.createMany({ data: alertsToCreate });
           }
         } else {
           await this.vehiclesService.updateVehicleStatus(
             terminatedContract.vehicleId,
             tx,
           );
         }

      await tx.invoice.update({
        where: { contractId: contractId },
        data: {
          status: InvoiceStatus.PAID,
          amountPaid: newTotalPaid,
          totalAmount: finalTotalCost,
        },
      });

      return terminatedContract;
    });
  }
       async update(
    contractId: string,
    agencyId: string,
    dto: UpdateContractDto,
  ): Promise<Contract> {
    // Vérifier que le contrat existe et appartient à l'agence
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, agencyId },
    });
    if (!contract) {
      throw new NotFoundException('Contrat non trouvé.');
    }
    // On ne peut modifier qu'un contrat actif
    if (contract.status !== 'ACTIVE') {
      throw new ConflictException('Seul un contrat actif peut être modifié.');
    }

    // Mettre à jour le contrat et la facture associée dans une transaction
    return this.prisma.$transaction(async (tx) => {
        const updatedContract = await tx.contract.update({
            where: { id: contractId },
            data: dto,
        });

        // Mettre à jour le montant total sur la facture si le coût a changé
        if (dto.totalCost) {
            await tx.invoice.update({
                where: { contractId },
                data: { totalAmount: dto.totalCost }
            });
        }

        return updatedContract;
    });
       }

}



