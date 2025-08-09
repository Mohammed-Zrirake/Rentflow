/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ServeStaticModule } from '@nestjs/serve-static'; 
import { join } from 'path'; 
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AgencyModule } from './modules/agency/agency.module';
import { UsersModule } from './modules/users/users.module'; 
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ReservationsModule } from './modules/reservation/reservations.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InvoicesModule } from './modules/invoices/invoices.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/clientsData',
      rootPath: join(__dirname, '..', 'clientsData'),
    }),
    PrismaModule,
    AuthModule,
    AgencyModule,
    UsersModule,
    VehiclesModule,
    ClientsModule,
    ReservationsModule,
    ContractsModule,
    DashboardModule,
    PaymentsModule,
    InvoicesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
