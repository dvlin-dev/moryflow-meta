import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';

interface HealthStatus {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  version: string;
  timestamp: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check(): Promise<HealthStatus> {
    const isDbHealthy = await this.prisma.healthCheck();

    return {
      status: isDbHealthy ? 'ok' : 'error',
      database: isDbHealthy ? 'connected' : 'disconnected',
      version: process.env.npm_package_version ?? '0.1.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async ready(): Promise<{ ready: boolean }> {
    const isDbHealthy = await this.prisma.healthCheck();
    return { ready: isDbHealthy };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  live(): { alive: boolean } {
    return { alive: true };
  }
}
