import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { Enrollment, EnrollmentStatus, PlanPeriod } from '../../domain/enrollment.entity';
import { EnrollmentRepository, ListOptions } from '../../domain/enrollment.repository';
import { SqlConnection } from './sql.connection';

interface EnrollmentRow {
  Id: number;
  StudentName: string;
  StudentEmail: string;
  PlanName: string;
  Period: PlanPeriod;
  MonthlyPrice: number;
  Total: number;
  Status: EnrollmentStatus;
  StartDate: Date;
  EndDate: Date;
  CreatedAt: Date;
}

const toDomain = (r: EnrollmentRow) =>
  new Enrollment(
    r.Id, r.StudentName, r.StudentEmail, r.PlanName, r.Period, Number(r.MonthlyPrice), Number(r.Total),
    r.Status, r.StartDate, r.EndDate, r.CreatedAt,
  );

@Injectable()
export class SqlEnrollmentRepository implements EnrollmentRepository {
  constructor(private readonly connection: SqlConnection) {}

  async create(e: Enrollment): Promise<Enrollment> {
    const pool = await this.connection.getPool();
    const result = await pool
      .request()
      .input('studentName', sql.NVarChar(120), e.studentName)
      .input('studentEmail', sql.NVarChar(160), e.studentEmail)
      .input('planName', sql.NVarChar(120), e.planName)
      .input('period', sql.NVarChar(20), e.period)
      .input('monthlyPrice', sql.Decimal(18, 2), e.monthlyPrice)
      .input('total', sql.Decimal(18, 2), e.total)
      .input('status', sql.NVarChar(20), e.status)
      .input('startDate', sql.DateTime2, e.startDate)
      .input('endDate', sql.DateTime2, e.endDate)
      .input('createdAt', sql.DateTime2, e.createdAt)
      .query<EnrollmentRow>(
        `INSERT INTO dbo.Enrollments (StudentName, StudentEmail, PlanName, Period, MonthlyPrice, Total, Status, StartDate, EndDate, CreatedAt)
         OUTPUT INSERTED.*
         VALUES (@studentName, @studentEmail, @planName, @period, @monthlyPrice, @total, @status, @startDate, @endDate, @createdAt)`,
      );
    return toDomain(result.recordset[0]);
  }

  async findById(id: number): Promise<Enrollment | null> {
    const pool = await this.connection.getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query<EnrollmentRow>('SELECT * FROM dbo.Enrollments WHERE Id = @id');
    return result.recordset[0] ? toDomain(result.recordset[0]) : null;
  }

  async findAll(options: ListOptions): Promise<Enrollment[]> {
    const pool = await this.connection.getPool();
    const result = await pool
      .request()
      .input('skip', sql.Int, options.skip)
      .input('limit', sql.Int, options.limit)
      .query<EnrollmentRow>(
        `SELECT * FROM dbo.Enrollments ORDER BY CreatedAt DESC, Id DESC
         OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY`,
      );
    return result.recordset.map(toDomain);
  }

  async update(e: Enrollment): Promise<Enrollment | null> {
    const pool = await this.connection.getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, e.id)
      .input('studentName', sql.NVarChar(120), e.studentName)
      .input('studentEmail', sql.NVarChar(160), e.studentEmail)
      .input('planName', sql.NVarChar(120), e.planName)
      .input('period', sql.NVarChar(20), e.period)
      .input('monthlyPrice', sql.Decimal(18, 2), e.monthlyPrice)
      .input('total', sql.Decimal(18, 2), e.total)
      .input('status', sql.NVarChar(20), e.status)
      .input('startDate', sql.DateTime2, e.startDate)
      .input('endDate', sql.DateTime2, e.endDate)
      .query(
        `UPDATE dbo.Enrollments SET StudentName=@studentName, StudentEmail=@studentEmail, PlanName=@planName,
           Period=@period, MonthlyPrice=@monthlyPrice, Total=@total, Status=@status,
           StartDate=@startDate, EndDate=@endDate WHERE Id=@id`,
      );
    return result.rowsAffected[0] === 1 ? e : null;
  }

  async delete(id: number): Promise<boolean> {
    const pool = await this.connection.getPool();
    const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM dbo.Enrollments WHERE Id = @id');
    return result.rowsAffected[0] === 1;
  }
}
