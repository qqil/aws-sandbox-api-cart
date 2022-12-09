import { DynamicModule, Global, Module } from '@nestjs/common';
import { KNEX_OPTIONS_TOKEN } from './constants';
import { KnexOptions } from './knex-options.interface';
import { KnexService } from './knex.service';

@Global()
@Module({
  providers: [KnexService],
  exports: [KnexService],
})
export class KnexModule {
  static forRoot(options: KnexOptions): DynamicModule {
    return {
      module: KnexModule,
      providers: [
        {
          provide: KNEX_OPTIONS_TOKEN,
          useValue: options,
        },
      ],
    };
  }
}
