import { registerAs } from '@nestjs/config';

import dotenv from 'dotenv';

dotenv.config();

export interface ICorsConfig {
  origin: string | string[];
}

const allowedOriginsString = process.env.ALLOWED_ORIGINS ?? '';

const config: ICorsConfig = {
  origin: allowedOriginsString.split(','),
};

export default registerAs('cors', () => config);
