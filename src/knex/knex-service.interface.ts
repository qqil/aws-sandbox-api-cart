import knex from 'knex';

export interface IKnexService {
  getKnex(): ReturnType<typeof knex>;
}
