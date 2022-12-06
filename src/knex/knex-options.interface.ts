import { Knex } from 'knex';

export type KnexOptions = ConstructorParameters<typeof Knex.Client>[0];
