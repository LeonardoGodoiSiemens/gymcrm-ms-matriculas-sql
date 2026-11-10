import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsISO8601, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ENROLLMENT_STATUSES, PLAN_PERIODS } from '../../domain/enrollment.entity';

export class CreateEnrollmentRequestDto {
  @ApiProperty({ example: 'Maria Souza' })
  @IsString()
  @MinLength(1)
  studentName: string;

  @ApiProperty({ example: 'maria@email.com', description: 'Usado nas notificações de vencimento/renovação' })
  @IsEmail()
  studentEmail: string;

  @ApiProperty({ example: 'Musculação + Aulas Coletivas', description: 'Nome do plano de treino/contrato' })
  @IsString()
  @MinLength(1)
  planName: string;

  @ApiProperty({ enum: PLAN_PERIODS, example: 'QUARTERLY' })
  @IsIn([...PLAN_PERIODS])
  period: string;

  @ApiProperty({ example: 129.9, minimum: 0, description: 'Mensalidade do plano' })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiPropertyOptional({ example: '2026-11-01T00:00:00.000Z', description: 'Início da vigência (padrão: agora)' })
  @IsOptional()
  @IsISO8601()
  startDate?: string;
}

export class UpdateEnrollmentRequestDto extends CreateEnrollmentRequestDto {
  @ApiProperty({ enum: ENROLLMENT_STATUSES, example: 'FROZEN', description: 'ACTIVE, FROZEN (trancada) ou CANCELLED' })
  @IsIn([...ENROLLMENT_STATUSES])
  status: string;
}

export class EnrollmentResponseDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty() studentName: string;
  @ApiProperty() studentEmail: string;
  @ApiProperty() planName: string;
  @ApiProperty({ enum: PLAN_PERIODS }) period: string;
  @ApiProperty() monthlyPrice: number;
  @ApiProperty({ description: 'monthlyPrice x meses do período' }) total: number;
  @ApiProperty({ enum: ENROLLMENT_STATUSES }) status: string;
  @ApiProperty({ example: '2026-11-01T00:00:00.000Z' }) startDate: string;
  @ApiProperty({ example: '2027-02-01T00:00:00.000Z' }) endDate: string;
  @ApiProperty({ example: '2026-10-26T12:00:00.000Z' }) createdAt: string;
}
