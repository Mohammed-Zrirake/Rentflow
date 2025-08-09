import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvoicesService } from './invoices.service';
import { AddPaymentToInvoiceDto } from './dto/add-payment-to-invoice.dto';

interface AuthenticatedRequest extends Request {
  user: { agencyId: string };
}

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    const { agencyId } = req.user;
    return this.invoicesService.findAllByAgency(agencyId);
  }

  @Post(':id/payments')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async addPayment(
    @Param('id') invoiceId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddPaymentToInvoiceDto,
  ) {
    const { agencyId } = req.user;
    return this.invoicesService.addPayment(invoiceId, agencyId, dto);
  }
}
