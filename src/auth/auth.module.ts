import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CognitoStrategy } from './strategies/cognito.strategy';

@Module({
  imports: [PassportModule],
  providers: [CognitoStrategy],
  exports: [],
})
export class AuthModule {}
