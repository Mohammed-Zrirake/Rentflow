import { Controller, Get, Req, UseGuards,Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';

interface AuthenticatedRequest extends Request {
  user: {
    agencyId: string;
    id: string;
  };
}

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('invoiceId') invoiceId?: string,
  ) {
    const { agencyId } = req.user;
    return this.paymentsService.findAllByAgency(agencyId, invoiceId); // Le passer au service
  }
}
