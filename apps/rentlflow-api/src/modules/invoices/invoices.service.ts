/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddPaymentToInvoiceDto } from './dto/add-payment-to-invoice.dto';
import { InvoiceStatus } from '@rentflow/database';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère toutes les factures pour une agence spécifique.
   */
  async findAllByAgency(agencyId: string) {
    return this.prisma.invoice.findMany({
      where: { agencyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Ajoute un paiement à une facture et met à jour le statut de la facture.
   */
  async addPayment(
    invoiceId: string,
    agencyId: string,
    dto: AddPaymentToInvoiceDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Valider la facture
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, agencyId },
      });

      if (!invoice) {
        throw new NotFoundException(
          `Facture avec l'ID "${invoiceId}" non trouvée.`,
        );
      }
      if (invoice.status === 'PAID' || invoice.status === 'VOID') {
        throw new BadRequestException(
          `Impossible d'ajouter un paiement à une facture qui est déjà payée ou annulée.`,
        );
      }

      // 2. Calculer les nouveaux montants
      const newAmountPaid = Number(invoice.amountPaid) + dto.amount;
      const totalAmount = Number(invoice.totalAmount);

      if (newAmountPaid > totalAmount) {
        throw new BadRequestException(
          `Le montant du paiement (${dto.amount}) dépasse le solde restant (${(totalAmount - Number(invoice.amountPaid)).toFixed(2)}).`,
        );
      }

      // 3. Déterminer le nouveau statut de la facture
      const newStatus =
        newAmountPaid >= totalAmount
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIALLY_PAID;

      // 4. Mettre à jour la facture
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          status: newStatus,
        },
      });

      // 5. Créer l'enregistrement du paiement
      // On doit savoir si la facture est liée à un contrat ou une réservation
      return tx.payment.create({
        data: {
          amount: dto.amount,
          method: dto.method,
          // Lier le paiement à la bonne entité
          contractId: invoice.contractId,
          reservationId: invoice.reservationId,
        },
      });
    });
  }
}
