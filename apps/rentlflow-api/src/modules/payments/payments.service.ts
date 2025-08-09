import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@rentflow/database';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère tous les paiements pour une agence spécifique.
   * Inclut les informations nécessaires sur la réservation ou le contrat associé.
   * @param agencyId L'ID de l'agence.
   * @returns Une liste de paiements avec leurs relations.
   */
  async findAllByAgency(agencyId: string, invoiceId?: string) {
    const whereClause: Prisma.PaymentWhereInput = {};

    if (invoiceId) {
      whereClause.OR = [
        { reservation: { invoice: { id: invoiceId, agencyId: agencyId } } },
        { contract: { invoice: { id: invoiceId, agencyId: agencyId } } },
      ];
    } else {
      whereClause.OR = [
        { reservation: { agencyId: agencyId } },
        { contract: { agencyId: agencyId } },
      ];
    }

    return this.prisma.payment.findMany({
      where: whereClause, // 
      include: {
        reservation: { select: { id: true } },
        contract: { select: { id: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
