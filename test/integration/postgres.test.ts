import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import pg from 'pg';

describe('Postgres container', () => {
  let container: StartedPostgreSqlContainer;
  let client: pg.Client;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    client = new pg.Client({ connectionString: container.getConnectionUri() });
    await client.connect();
  });

  afterAll(async () => {
    await client.end();
    await container.stop();
  });

  test('accepts a write and a read', async () => {
    await client.query(
      'CREATE TABLE notes (id serial PRIMARY KEY, body text NOT NULL)',
    );
    await client.query('INSERT INTO notes (body) VALUES ($1)', ['hello']);

    const result = await client.query<{ body: string }>(
      'SELECT body FROM notes',
    );

    expect(result.rows).toEqual([{ body: 'hello' }]);
  });
});
