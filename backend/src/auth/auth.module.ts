import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

export const jwtConstants = {
	secret: process.env.JWT_SECRET,
};

@Module({
  imports: [
	  PrismaModule,
	  PassportModule,
	  JwtModule.register({
		  secret: jwtConstants.secret,
		  signOptions: { expiresIn: '30m' }, // 30 minutes
	  }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
