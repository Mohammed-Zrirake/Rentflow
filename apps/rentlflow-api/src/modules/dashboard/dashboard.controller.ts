import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

interface AuthenticatedRequest extends Request {
  user: { agencyId: string };
}

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('calendar-data')
  async getCalendarData(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.getCalendarData(req.user.agencyId);
  }

    @Get('stats')
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.getStats(req.user.agencyId);
  }
}

