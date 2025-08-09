/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// file: apps/rentflow-api/src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service'; 
import { PasswordService } from './password.service';
import { User } from '@rentflow/database';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  async register(data: any): Promise<Omit<User, 'password'>> {
    const { email, password, name } = data;
    console.log('[AuthService] Register attempt for:', { email, name });

    try {
      console.log('[AuthService] Step 1: Checking if user exists...');
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        console.log(
          '[AuthService] User already exists. Throwing ConflictException.',
        );
        throw new ConflictException('User with this email already exists');
      }
      console.log('[AuthService] Step 1: OK. User does not exist.');
    } catch (error) {
      console.error('[AuthService] FAILED at Step 1 (findUnique user):', error);
      throw error;
    }

    let hashedPassword;
    try {
      console.log('[AuthService] Step 2: Hashing password...');
      hashedPassword = await this.passwordService.hash(password);
      console.log('[AuthService] Step 2: OK. Password hashed.');
    } catch (error) {
      console.error(
        '[AuthService] FAILED at Step 2 (hashing password):',
        error,
      );
      throw error;
    }

    let agency;
    try {
      console.log('[AuthService] Step 3: Finding or creating agency...');
      agency = await this.prisma.agency.findFirst();
      if (!agency) {
        console.log('[AuthService] No agency found, creating a new one...');
        agency = await this.prisma.agency.create({
          data: { name: `${name}'s Agency` },
        });
        console.log('[AuthService] New agency created:', agency.id);
      } else {
        console.log('[AuthService] Found existing agency:', agency.id);
      }
      console.log('[AuthService] Step 3: OK. Agency is ready.');
    } catch (error) {
      console.error(
        '[AuthService] FAILED at Step 3 (find/create agency):',
        error,
      );
      throw error;
    }

    let user;
    try {
      console.log(
        `[AuthService] Step 4: Creating user with agencyId: ${agency.id}...`,
      );
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          agencyId: agency.id,
          role: 'USER',
        },
      });
      console.log(
        '[AuthService] Step 4: OK. User created successfully:',
        user.id,
      );
    } catch (error) {
      console.error('[AuthService] FAILED at Step 4 (creating user):', error);
      throw error;
    }

    // 5. Never return the password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Validates user credentials and returns a user object if valid
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await this.passwordService.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async login(user: Omit<User, 'password'>) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      agencyId: user.agencyId,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
}
