import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleStatus } from '@rentflow/database';

// Définir les types de sortie pour le frontend
export interface Booking {
  id: string;
  clientName: string;
  startDate: Date;
  endDate: Date;
  type: 'CONTRACT' | 'RESERVATION'; // Pour différencier les couleurs
}
export interface VehicleWithBookings {
  id: string;
  name: string;
  imageUrl: string | null;
  bookings: Booking[];
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getCalendarData(agencyId: string): Promise<VehicleWithBookings[]> {
    const activeVehicles = await this.prisma.vehicle.findMany({
      where: {
        agencyId,
        status: { notIn: [ VehicleStatus.INACTIVE] },
      },
      include: {
        images: { take: 1, orderBy: { createdAt: 'asc' } },
        contracts: {
          where: { status: 'ACTIVE' },
          include: { client: { select: { firstName: true, lastName: true } } },
        },
        reservations: {
          where: { status: { in: ['PENDING', 'CONFIRMED'] } },
          include: { client: { select: { firstName: true, lastName: true } } },
        },
      },
    });
    const formattedData = activeVehicles.map((vehicle) => {
      const contractBookings: Booking[] = vehicle.contracts.map((c) => ({
        id: c.id,
        clientName: `${c.client.firstName} ${c.client.lastName}`,
        startDate: c.startDate,
        endDate: c.endDate,
        type: 'CONTRACT',
      }));
      const reservationBookings: Booking[] = vehicle.reservations.map((r) => ({
        id: r.id,
        clientName: `${r.client.firstName} ${r.client.lastName}`,
        startDate: r.startDate,
        endDate: r.endDate,
        type: 'RESERVATION',
      }));
      return {
        id: vehicle.id,
        name: `${vehicle.make} ${vehicle.model}`,
        imageUrl: vehicle.images[0]?.url || null,
        bookings: [...contractBookings, ...reservationBookings],
      };
    });

    return formattedData;
  }
    async getStats(agencyId: string) {
    const vehiclesAvailable = await this.prisma.vehicle.count({
      where: { agencyId, status: 'AVAILABLE' },
    });

    const activeContracts = await this.prisma.contract.count({
      where: { agencyId, status: 'ACTIVE' },
    });

    const pendingReservations = await this.prisma.reservation.count({
      where: { agencyId, status: 'PENDING' },
    });

    return {
      vehiclesAvailable,
      activeContracts,
      pendingReservations,
    };
  }
}

