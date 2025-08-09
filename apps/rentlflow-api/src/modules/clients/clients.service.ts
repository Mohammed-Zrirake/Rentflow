/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// In: apps/rentflow-api/src/modules/clients/clients.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@rentflow/database';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { promises as fs } from 'fs'; 
import { join } from 'path';

@Injectable()
export class ClientsService {

  constructor(private prisma: PrismaService) {}
  async findAllByAgency(agencyId: string, search?: string): Promise<Client[]> {
    const whereClause: any = {
      agencyId: agencyId,
    };
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }
    return this.prisma.client.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async create(
    dto: CreateClientDto,
    files: {
      identityDocumentUrl?: Express.Multer.File[];
      idCardUrlFront?: Express.Multer.File[];
      idCardUrlBack?: Express.Multer.File[];
      driverLicenseUrlFront?: Express.Multer.File[];
      driverLicenseUrlBack?: Express.Multer.File[];
      passportUrlFront?: Express.Multer.File[];
      passportUrlBack?: Express.Multer.File[];
    },
    agencyId: string,
  ): Promise<Client> {
      const orConditions = [{ driverLicense: dto.driverLicense }];
      if (dto.email) {
        orConditions.push({ email: dto.email });
      }
      
    const existingByLicense = await this.prisma.client.findUnique({
      where: {
        agencyId_driverLicense: {
          // Doit correspondre au nom de la contrainte dans schema.prisma
          agencyId,
          driverLicense: dto.driverLicense,
        },
      },
    });

     if (existingByLicense) {
      throw new ConflictException("Un client avec ce numéro de permis de conduire existe déjà.");
    
    
    }
     if (dto.email) {
       const existingByEmail = await this.prisma.client.findUnique({
         where: {
           agencyId_email: {
             // Doit correspondre au nom de la contrainte dans schema.prisma
             agencyId,
             email: dto.email,
           },
         },
       });
       if (existingByEmail) {
         throw new ConflictException(
           'Un client avec cette adresse email existe déjà.',
         );
       }
     }

    const clientData = {
      ...dto,
      agencyId: agencyId,
      identityDocumentUrl: files?.identityDocumentUrl?.[0]
        ? `/clientsData/${files.identityDocumentUrl[0].filename}`
        : undefined,
      idCardUrlFront: files?.idCardUrlFront?.[0]
        ? `/clientsData/${files.idCardUrlFront[0].filename}`
        : undefined,
      idCardUrlBack: files?.idCardUrlBack?.[0]
        ? `/clientsData/${files.idCardUrlBack[0].filename}`
        : undefined,
      driverLicenseUrlFront: files?.driverLicenseUrlFront?.[0]
        ? `/clientsData/${files.driverLicenseUrlFront[0].filename}`
        : undefined,
      driverLicenseUrlBack: files?.driverLicenseUrlBack?.[0]
        ? `/clientsData/${files.driverLicenseUrlBack[0].filename}`
        : undefined,
      passportUrlFront: files?.passportUrlFront?.[0]
        ? `/clientsData/${files.passportUrlFront[0].filename}`
        : undefined,
      passportUrlBack: files?.passportUrlBack?.[0]
        ? `/clientsData/${files.passportUrlBack[0].filename}`
        : undefined,
    };

    return this.prisma.client.create({ data: clientData });
  }

  async findOne(id: string, agencyId: string): Promise<Client> {
    const client = await this.prisma.client.findFirst({
      where: { id:id, agencyId:agencyId },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID "${id}" not found.`);
    }
    return client;
  }
    async update(
    id: string,
    dto: UpdateClientDto,
    files: {
      identityDocumentUrl?: Express.Multer.File[];
      idCardUrlFront?: Express.Multer.File[];
      idCardUrlBack?: Express.Multer.File[];
      driverLicenseUrlFront?: Express.Multer.File[];
      driverLicenseUrlBack?: Express.Multer.File[];
      passportUrlFront?: Express.Multer.File[];
      passportUrlBack?: Express.Multer.File[];
    },
    agencyId: string,
  ): Promise<Client> {
    const existingClient = await this.findOne(id, agencyId);

    if (dto.email || dto.driverLicense) {
        const conflict = await this.prisma.client.findFirst({
            where: {
                agencyId,
                id: { not: id },
                OR: [
                    { email: dto.email },
                    { driverLicense: dto.driverLicense }
                ]
            }
        });
        if (conflict) {
            throw new ConflictException('Email or driver license already in use by another client.');
        }
    }
    const fileUpdateData: { [key: string]: string | undefined } = {};
    const fileFields = [
      'identityDocumentUrl', 'idCardUrlFront', 'idCardUrlBack', 
      'driverLicenseUrlFront', 'driverLicenseUrlBack', 
      'passportUrlFront', 'passportUrlBack'
    ];

    for (const field of fileFields) {
      if (files[field]?.[0]) {
 
        if (existingClient[field]) {
          try {
            const oldFilePath = join(process.cwd(), existingClient[field]);
            await fs.unlink(oldFilePath);
          } catch (error) {
            console.error(`Failed to delete old file: ${existingClient[field]}`, error);
          }
        }
        fileUpdateData[field] = `/clientsData/${files[field][0].filename}`;
      }
    }

    const dataToUpdate = {
      ...dto,
      ...fileUpdateData,
    };

    return this.prisma.client.update({
      where: { id: existingClient.id },
      data: dataToUpdate,
    });
  }
}


