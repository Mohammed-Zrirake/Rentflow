/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// rentflow-api/src/modules/reservations/reservations.controller.ts

import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService, FullReservation } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';


interface AuthenticatedRequest extends Request {
  user: {
    agencyId: string;
    id: string; 
  };
}

@Controller('reservations')
@UseGuards(AuthGuard('jwt'))
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest): Promise<FullReservation[]> {
    const agencyId = req.user.agencyId;
    return this.reservationsService.findAllByAgency(agencyId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    const { agencyId, id: userId } = req.user;
    return this.reservationsService.create(
      createReservationDto,
      agencyId,
      userId,
    );
  }


  @Patch(':id/cancel')
   async cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const { agencyId } = req.user;
    return this.reservationsService.cancel(id, agencyId);
  }

   @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const { agencyId } = req.user;
    return this.reservationsService.findOneById(id, agencyId);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    const { agencyId } = req.user;
    return this.reservationsService.update(id, agencyId, updateReservationDto);
  }
   @Patch(':id/confirm')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async confirm(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() confirmReservationDto: ConfirmReservationDto,
  ) {
    const { agencyId } = req.user;
    return this.reservationsService.confirm(id, agencyId, confirmReservationDto);
  }
}




