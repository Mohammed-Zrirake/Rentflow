
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma : PrismaService) {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // This payload comes directly from the JWT signed in `auth.service.ts`
  async validate(payload: {
    id: string;
    sub: string;
    email: string;
    role: string;
    agencyId: string;
  }) {
 const { sub: id } = payload;
  if (!id) {
    throw new UnauthorizedException('Token invalide.');
  }
  
 const user = await this.prisma.user.findUnique({
   where: { id },
 });
 
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé.');
    }
      if (user.status === 'INACTIVE') {
        throw new UnauthorizedException('Votre compte a été désactivé.');
      }
    // The object returned here is what becomes `req.user` in protected routes.
    return {
      id: user.id,
      email: payload.email,
      role: payload.role,
      agencyId: payload.agencyId,
    };
  }
}
