import { registerAs } from '@nestjs/config';
import { env } from 'process';

import dotenv from 'dotenv';

dotenv.config();
if (env.SECRETS) {
  const secrets = JSON.parse(env.SECRETS);
  for (const key in secrets) {
    env[key] = secrets[key];
  }
}

const config = {
  host: `${process.env.REDIS_HOST}`,
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
};

export default registerAs('redis', () => config);
