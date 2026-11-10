import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SqlConnection } from '../infrastructure/sql/sql.connection';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly sql: SqlConnection) {}

  @Get()
  @ApiOperation({ summary: 'Liveness/readiness check (includes Azure SQL ping)' })
  async health() {
    const database = (await this.sql.ping()) ? 'up' : 'down';
    return { status: database === 'up' ? 'ok' : 'degraded', database, service: 'ms-matriculas-sql' };
  }
}
