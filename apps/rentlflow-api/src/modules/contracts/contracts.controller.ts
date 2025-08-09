/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Patch,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContractsService } from './contracts.service';
import { AddPaymentDto } from './dto/add-payment.dto';
import { CreateContractDto } from './dto/create-direct-contract.dto';
import { TerminateContractDto } from './dto/terminate-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

interface AuthenticatedRequest extends Request {
  user: {
    agencyId: string;
    id: string;
  };
}

@Controller('contracts')
@UseGuards(AuthGuard('jwt'))
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    const { agencyId } = req.user;
    return this.contractsService.findAllByAgency(agencyId);
  }
  @Post(':id/payments')
  async addPayment(
    @Param('id') contractId: string,
    @Req() req: AuthenticatedRequest,
    @Body() addPaymentDto: AddPaymentDto,
  ) {
    const { agencyId } = req.user;
    return this.contractsService.addPayment(
      contractId,
      agencyId,
      addPaymentDto,
    );
  }

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createContractDto: CreateContractDto,
  ) {
    const { agencyId, id: userId } = req.user;
    return this.contractsService.create(createContractDto, agencyId, userId);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id') contractId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const { agencyId } = req.user;
    return this.contractsService.cancel(contractId, agencyId);
  }
   @Get(':id')
  async findOne(@Param('id') contractId: string, @Req() req: AuthenticatedRequest) {
    const { agencyId } = req.user;
    return this.contractsService.findOneById(contractId, agencyId);
  }

  @Patch(':id/terminate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  terminate(
    @Param('id') contractId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: TerminateContractDto,
  ) {
    const { agencyId } = req.user;
    return this.contractsService.terminate(contractId, agencyId, dto);
  }


  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('id') contractId: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    const { agencyId } = req.user;
    return this.contractsService.update(contractId, agencyId, updateContractDto);
  }
}



