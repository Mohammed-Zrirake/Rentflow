/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// In: apps/rentflow-api/src/modules/vehicles/vehicles.controller.ts
import { Body,
    Controller,
    Get,
    Post,
    Req, 
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
    Param,
    Put,
  } from '@nestjs/common';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { AuthGuard } from '@nestjs/passport';
import { VehiclesService, VehicleWithImages } from './vehicles.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateVehicleDto } from './dto/create-vehicule.dto';
import { extname } from 'path/win32';
import { diskStorage } from 'multer';
import { imageFileFilter } from 'src/common/filters/imageFilter';
import { VehicleStatus } from '@rentflow/database'; 



interface AuthenticatedRequest extends Request {
  user: { agencyId: string };
}



@Controller('vehicles')
@UseGuards(AuthGuard('jwt'))
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
  ): Promise<VehicleWithImages[]> {
    return this.vehiclesService.findAllByAgency(req.user.agencyId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createVehicleDto: CreateVehicleDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.vehiclesService.create(
      createVehicleDto,
      files,
      req.user.agencyId,
    );
  }

  @Get('status/:status')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAllByStatus(
    @Req() req: AuthenticatedRequest,
    @Param('status') status: VehicleStatus, 
  ): Promise<VehicleWithImages[]> {
    return this.vehiclesService.findAllByAgencyAndStatus(
      req.user.agencyId,
      status, 
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.vehiclesService.findOne(id, req.user.agencyId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.vehiclesService.update(
      id,
      updateVehicleDto,
      files,
      req.user.agencyId,
    );
  }



}



