import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as sql from 'mssql';

const CREATE_SCHEMA = `
IF OBJECT_ID('dbo.Enrollments', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Enrollments (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    StudentName  NVARCHAR(120)  NOT NULL,
    StudentEmail NVARCHAR(160)  NOT NULL,
    PlanName     NVARCHAR(120)  NOT NULL,
    Period       NVARCHAR(20)   NOT NULL,
    MonthlyPrice DECIMAL(18,2)  NOT NULL,
    Total        DECIMAL(18,2)  NOT NULL,
    Status       NVARCHAR(20)   NOT NULL,
    StartDate    DATETIME2      NOT NULL,
    EndDate      DATETIME2      NOT NULL,
    CreatedAt    DATETIME2      NOT NULL
  );
END`;

@Injectable()
export class SqlConnection implements OnModuleDestroy {
  private readonly logger = new Logger(SqlConnection.name);
  private pool?: Promise<sql.ConnectionPool>;

  /** Conexão preguiçosa: cria o pool e a tabela Enrollments (se não existir) no primeiro uso. */
  getPool(): Promise<sql.ConnectionPool> {
    if (!this.pool) {
      const connectionString = process.env.SQL_CONNECTION_STRING;
      if (!connectionString) {
        return Promise.reject(new Error('SQL_CONNECTION_STRING environment variable is not set'));
      }
      this.pool = (async () => {
        const pool = await new sql.ConnectionPool(connectionString).connect();
        await pool.request().query(CREATE_SCHEMA);
        this.logger.log('Connected to Azure SQL and schema ensured');
        return pool;
      })();
      this.pool.catch(() => (this.pool = undefined)); // permite nova tentativa após falha
    }
    return this.pool;
  }

  async ping(): Promise<boolean> {
    try {
      await (await this.getPool()).request().query('SELECT 1 AS ok');
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      try { await (await this.pool).close(); } catch { /* ignore */ }
    }
  }
}
