import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  JwtStrategy,
  JwtWithout2FAStrategy,
  WsJwtStrategy,
} from './jwt.strategy';

export const jwtConstants = {
  publicKey: process.env.JWT_PUBLIC_KEY,
  privateKey: process.env.JWT_PRIVATE_KEY,
};

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      privateKey: jwtConstants.privateKey,
      signOptions: {
        expiresIn: '3h',
        algorithm: 'RS256',
      },
      verifyOptions: {
        algorithms: ['RS256'],
      },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, WsJwtStrategy, JwtWithout2FAStrategy],
  exports: [AuthService],
})
export class AuthModule {}
