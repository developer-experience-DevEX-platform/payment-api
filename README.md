# payment-api

handles payment api request

Owner: group:default/developer-experience

Docs in Backstage: [docs/index.md](docs/index.md)

Copy `.env.example` to `.env` for local values.

Install: `npm install`

Run in development: `npm run dev`

Local Postgres: `docker compose up postgres`

Run the app image and Postgres: `docker compose up --build`

Same checks as CI: `npm run verify`

Unit tests: `npm test`

Integration tests: `npm run test:integration`

Integration tests start their own dependencies with Testcontainers, so Docker
must be running locally. The same command runs in CI. Do not change
`.github/workflows/ci.yml` to add a dependency.

The scaffold ships one Postgres sample in `test/integration/postgres.test.ts`.
That file is a pattern, not the full set of dependencies this service will
need. Replace it with tests of this service's own components, or keep it and
add more files next to it.

### Adding S3, SQS, or other AWS APIs

Use LocalStack. Jest already runs every file under `test/integration/`.

```bash
npm install --save-dev @testcontainers/localstack @aws-sdk/client-s3 @aws-sdk/client-sqs
```

```ts
import { LocalstackContainer } from '@testcontainers/localstack';
import {
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  CreateQueueCommand,
  ReceiveMessageCommand,
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';

const localstack = await new LocalstackContainer(
  'localstack/localstack:4.0',
).start();

const endpoint = localstack.getConnectionUri();
const credentials = { accessKeyId: 'test', secretAccessKey: 'test' };
const region = 'eu-west-1';

const s3 = new S3Client({
  endpoint,
  region,
  credentials,
  forcePathStyle: true,
});
const sqs = new SQSClient({ endpoint, region, credentials });
```

Create a bucket, put an object, get it back. Create a queue, send a message,
receive it. Point the service at `AWS_ENDPOINT_URL` from the container;
production leaves that unset so the AWS SDK talks to real AWS.

- Only Postgres: keep the sample. Change the table and queries to match the schema.
- S3 and SQS, no database: replace `postgres.test.ts` with a LocalStack test.
- Postgres, S3, and SQS: keep both files. Testcontainers starts both containers.

Drop `@testcontainers/postgresql` if the database sample is gone.

Smoke, performance, and regression tests against a deployed environment belong
in CD, not here.
