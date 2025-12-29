import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// 显式加载 .env 文件
config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
