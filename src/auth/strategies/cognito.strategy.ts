import { PassportStrategy } from '@nestjs/passport';
import { Strategy as BaseStrategy } from 'passport-strategy';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { JwtExpiredError } from 'aws-jwt-verify/error';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

class Strategy extends BaseStrategy {
  protected verifier: ReturnType<typeof CognitoJwtVerifier.create>;

  constructor() {
    super();

    this.verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      clientId: process.env.COGNITO_CLIENT_ID,
      tokenUse: 'id',
    });
  }

  async authenticate(req: Request): Promise<void> {
    if (!req.headers.authorization) return this.fail(400);

    const [scheme, token] = req.headers.authorization.split(' ');

    if (!/^Bearer$/i.test(scheme)) return this.fail(400);
    if (!token || token.length === 0) return this.fail(400);

    // TODO: Added for easy testing. Remove it later.
    if (token === 'qa')
      return this.success({ id: '7fe9d6a0-6a9e-4346-9fc6-d8947d884d2d' });

    try {
      const payload = await this.verifier.verify(token);
      return this.success({ id: payload.sub });
    } catch (e) {
      if (e instanceof JwtExpiredError) return this.fail(401);
      return this.fail(403);
    }
  }
}

@Injectable()
export class CognitoStrategy extends PassportStrategy(Strategy, 'cognito') {}
