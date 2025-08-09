
import { Alert, Client, Vehicle } from "@prisma/client";

export {
  PrismaClient,
  Role,
  VehicleStatus,
  PaymentMethod,
  AlertType,
  ReservationStatus,
  ContractStatus,
  InvoiceStatus,
  UserStatus,
  ClientType,
  Gender,
} from "@prisma/client";


export type AlertWithDetails = Alert & {
  vehicle: Vehicle | null;
  client: Client | null;
};

export type {
  Prisma,
  Agency,
  User,
  Vehicle,
  Client,
  Reservation,
  Contract,
  Invoice,
  Payment,
  Maintenance,
  Alert,
  VehicleImage,
} from "@prisma/client";
