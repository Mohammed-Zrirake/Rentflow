import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { VehiclesModule } from '../vehicles/vehicles.module'; 


@Module({
  imports: [VehiclesModule],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
