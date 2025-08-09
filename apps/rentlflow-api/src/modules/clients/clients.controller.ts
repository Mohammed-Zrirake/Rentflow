/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// In: apps/rentflow-api/src/modules/clients/clients.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UploadedFiles, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientsService } from './clients.service';
import { Client } from '@rentflow/database';
import { FileFieldsInterceptor } from '@nestjs/platform-express'; 
import { diskStorage } from 'multer';
import { extname } from 'path';
import { imageFileFilter } from '../../common/filters/imageFilter'; 
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

interface AuthenticatedRequest extends Request {
  user: { agencyId: string };
}

@Controller('clients')
@UseGuards(AuthGuard('jwt'))
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}
  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
  ): Promise<Client[]> {
    return this.clientsService.findAllByAgency(req.user.agencyId, search);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'identityDocumentUrl', maxCount: 1 },
        { name: 'idCardUrlFront', maxCount: 1 },
        { name: 'idCardUrlBack', maxCount: 1 },
        { name: 'driverLicenseUrlFront', maxCount: 1 },
        { name: 'driverLicenseUrlBack', maxCount: 1 },
        { name: 'passportUrlFront', maxCount: 1 },
        { name: 'passportUrlBack', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './clientsData',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createClientDto: CreateClientDto,
    @UploadedFiles()
    files: {
      identityDocumentUrl: Express.Multer.File[];
      idCardUrlFront?: Express.Multer.File[];
      idCardUrlBack?: Express.Multer.File[];
      driverLicenseUrlFront?: Express.Multer.File[];
      driverLicenseUrlBack?: Express.Multer.File[];
      passportUrlFront?: Express.Multer.File[];
      passportUrlBack?: Express.Multer.File[];
    },
  ) {
    return this.clientsService.create(
      createClientDto,
      files,
      req.user.agencyId,
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<Client> {
    return this.clientsService.findOne(id, req.user.agencyId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'identityDocumentUrl', maxCount: 1 },
        { name: 'idCardUrlFront', maxCount: 1 },
        { name: 'idCardUrlBack', maxCount: 1 },
        { name: 'driverLicenseUrlFront', maxCount: 1 },
        { name: 'driverLicenseUrlBack', maxCount: 1 },
        { name: 'passportUrlFront', maxCount: 1 },
        { name: 'passportUrlBack', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './clientsData',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @UploadedFiles()
    files: {
      identityDocumentUrl?: Express.Multer.File[];
      idCardUrlFront?: Express.Multer.File[];
      idCardUrlBack?: Express.Multer.File[];
      driverLicenseUrlFront?: Express.Multer.File[];
      driverLicenseUrlBack?: Express.Multer.File[];
      passportUrlFront?: Express.Multer.File[];
      passportUrlBack?: Express.Multer.File[];
    },
  ) {
    return this.clientsService.update(
      id,
      updateClientDto,
      files,
      req.user.agencyId,
    );
  }
}



