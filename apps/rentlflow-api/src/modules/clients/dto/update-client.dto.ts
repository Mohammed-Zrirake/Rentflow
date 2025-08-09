/* eslint-disable @typescript-eslint/no-unsafe-call */
// In: apps/rentflow-api/src/modules/clients/dto/update-client.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';

// PartialType makes all properties of CreateClientDto optional
export class UpdateClientDto extends PartialType(CreateClientDto) {}
