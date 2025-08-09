
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role, User } from '@rentflow/database';
import { PasswordService } from '../auth/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async findOne(
    userId: string,
    agencyId: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        agencyId: agencyId, // SECURITY: Ensures user belongs to the admin's agency
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        agencyId: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec ID "${userId}" non trouvé.`,
      );
    }
    return user;
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    agencyId: string,
  ): Promise<Omit<User, 'password'>> {
    // First, ensure the user exists and belongs to the correct agency
    await this.findOne(userId, agencyId);

    const dataToUpdate: Prisma.UserUpdateInput = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      status: updateUserDto.status,
    };

    // Only hash and update the password if a new one was provided
    if (updateUserDto.password) {
      dataToUpdate.password = await this.passwordService.hash(
        updateUserDto.password,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  /**
   * Finds all users belonging to a specific agency.
   * It explicitly excludes the password field from the result for security.
   * @param agencyId The ID of the agency.
   * @returns A promise that resolves to an array of users without their passwords.
   */
  async findAllByAgency(agencyId: string): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      where: {
        agencyId: agencyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        agencyId: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async create(
    createUserDto: CreateUserDto,
    agencyId: string,
  ): Promise<Omit<User, 'password'>> {
    // 1. Check if a user with this email already exists in the same agency
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
        agencyId: agencyId,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Un utilisateur avec cet email existe déjà dans cette agence.',
      );
    }

    // 2. Hash the user's password before saving
    const hashedPassword = await this.passwordService.hash(
      createUserDto.password,
    );

    // 3. Create the new user in the database
    const newUser = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        status: createUserDto.status,
        agencyId: agencyId,
        role: Role.USER,
      },
    });

    const { password, ...result } = newUser;
    return result;
  }
}

