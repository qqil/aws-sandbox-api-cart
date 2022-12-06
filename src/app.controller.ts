import {
  Controller,
  Get,
  Request,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { CognitoGuard } from './auth/guards/cognito.guard';

@Controller()
export class AppController {
  @Get(['', 'ping'])
  healthCheck() {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  @UseGuards(CognitoGuard)
  @Get('api/profile')
  async getProfile(@Request() req) {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        user: req.user,
      },
    };
  }
}
