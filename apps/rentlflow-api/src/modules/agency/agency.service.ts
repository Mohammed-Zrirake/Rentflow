import { Injectable, NotFoundException, Logger } from '@nestjs/common'; 
import { PrismaService } from '../prisma/prisma.service';
import { Agency, Prisma } from '@rentflow/database';
import { RawAgencySettingsDto } from './dto/update-agency-settings.dto';
import { unlink } from 'fs/promises'; 
import { join } from 'path'; 

@Injectable()
export class AgencyService {
  private readonly logger = new Logger(AgencyService.name);
  constructor(private prisma: PrismaService) {}
  private mapDtoToPrisma(dto: RawAgencySettingsDto): Prisma.AgencyUpdateInput {
    return {
      name: dto.nom,
      address: dto.address,
      city: dto.ville,
      postalCode: dto.code_postal,
      phone: dto.telephone,
      contactEmail: dto.email,
      rc: dto.rc,
      patente: dto.patente,
      ice: dto.ice,
      iff: dto.if,
      cnss: dto.cnss,
      insuranceReminderDays: dto.rappel_assurance,
      techInspectionReminderDays: dto.rappel_controle,
      trafficLicenseReminderDays: dto.rappel_circulation,
      reservationReminderDays: dto.rappel_reservation,
      clientArrivalReminderDays: dto.rappel_arrivee_client,
      oilChangeReminderKm: dto.rappel_vidange,
    };
  }
  async getSettings(agencyId: string): Promise<Agency> {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException(`Agency with ID "${agencyId}" not found.`);
    }
    return agency;
  }
  async findOneById(
    agencyId: string,
  ): Promise<{ name: string; logoUrl: string | null }> {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      select: {
        // On ne retourne que ce qui est nécessaire
        name: true,
        logoUrl: true,
      },
    });

    if (!agency) {
      throw new NotFoundException(
        `Agence avec l'ID "${agencyId}" non trouvée.`,
      );
    }
    return agency;
  }
  async updateSettings(
    agencyId: string,
    data: RawAgencySettingsDto,
    logoUrl?: string,
    stampUrl?: string,
  ): Promise<Agency> {
    const existingAgency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });
    if (!existingAgency) {
      throw new NotFoundException(`Agency with ID "${agencyId}" not found.`);
    }
    const prismaData = this.mapDtoToPrisma(data);
    if (logoUrl) {
      if (existingAgency.logoUrl) {
        await this.deleteFile(existingAgency.logoUrl);
      }
      prismaData.logoUrl = logoUrl;
    }

    if (stampUrl) {
      if (existingAgency.stampUrl) {
        await this.deleteFile(existingAgency.stampUrl);
      }
      prismaData.stampUrl = stampUrl;
    }
    return this.prisma.agency.update({
      where: { id: agencyId },
      data: prismaData,
    });
  }
  private async deleteFile(filePath: string) {
    const absolutePath = join(process.cwd(), filePath);

    try {
      await unlink(absolutePath);
      this.logger.log(`Successfully deleted file: ${absolutePath}`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`File not found, could not delete: ${absolutePath}`);
      } else {
        this.logger.error(
          `Failed to delete file: ${absolutePath}`,
          error && typeof error === 'object' && 'stack' in error
            ? error.stack
            : undefined,
        );
      }
    }
  }
}
