import { Inject, Injectable } from '@nestjs/common';
import knex from 'knex';
import { KNEX_OPTIONS_TOKEN } from './constants';
import { KnexOptions } from './knex-options.interface';
import { IKnexService } from './knex-service.interface';

@Injectable()
export class KnexService implements IKnexService {
  private client: ReturnType<typeof knex>;

  constructor(@Inject(KNEX_OPTIONS_TOKEN) options: KnexOptions) {
    console.log('initializing knex with options', options);
    this.client = knex(options);
  }

  getKnex() {
    if (!this.client) throw new Error('Knex client is not defined');

    return this.client;
  }
}
