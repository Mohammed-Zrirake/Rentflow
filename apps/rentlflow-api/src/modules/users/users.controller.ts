/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Get,
  Req,
  Put,
  Param,
  UseGuards,
  ForbiddenException,
  UsePipes, 
  ValidationPipe,
  Post,
  Body, 
} from '@nestjs/common';
import { ApiUser } from './dto/api-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { User } from '@rentflow/database'; 
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// This interface is fine as is
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    agencyId: string;
  };
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
  ): Promise<Omit<User, 'password'>[]> {
    const agencyId = req.user.agencyId;
    return this.usersService.findAllByAgency(agencyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiUser> {
    return this.usersService.findOne(id, req.user.agencyId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiUser> {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        "Vous n'avez pas la permission d'effectuer cette action.",
      );
    }
    const agencyId = req.user.agencyId;
    return this.usersService.create(createUserDto, agencyId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiUser> {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        "Vous n'avez pas la permission d'effectuer cette action.",
      );
    }
    return this.usersService.update(id, updateUserDto, req.user.agencyId);
  }
}
