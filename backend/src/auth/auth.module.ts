import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy, JwtWithout2FAStrategy } from './jwt.strategy';

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
        expiresIn: '30m',
        algorithm: 'RS256',
      },
      verifyOptions: {
        algorithms: ['RS256'],
      },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtWithout2FAStrategy],
})
export class AuthModule {}
