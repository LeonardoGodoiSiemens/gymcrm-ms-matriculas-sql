import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEnrollmentHandler } from '../application/features/create-enrollment/create-enrollment.handler';
import { DeleteEnrollmentHandler } from '../application/features/delete-enrollment/delete-enrollment.handler';
import { GetEnrollmentHandler } from '../application/features/get-enrollment/get-enrollment.handler';
import { ListEnrollmentsHandler } from '../application/features/list-enrollments/list-enrollments.handler';
import { RenewEnrollmentHandler } from '../application/features/renew-enrollment/renew-enrollment.handler';
import { UpdateEnrollmentHandler } from '../application/features/update-enrollment/update-enrollment.handler';
import { CreateEnrollmentRequestDto, EnrollmentResponseDto, UpdateEnrollmentRequestDto } from './dto/enrollment.dto';

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly createEnrollment: CreateEnrollmentHandler,
    private readonly getEnrollment: GetEnrollmentHandler,
    private readonly listEnrollments: ListEnrollmentsHandler,
    private readonly updateEnrollment: UpdateEnrollmentHandler,
    private readonly deleteEnrollment: DeleteEnrollmentHandler,
    private readonly renewEnrollment: RenewEnrollmentHandler,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria matrícula (publica o evento EnrollmentCreated)' })
  @ApiResponse({ status: 201, type: EnrollmentResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() body: CreateEnrollmentRequestDto) {
    return this.createEnrollment.execute(body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista matrículas (paginado)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, type: [EnrollmentResponseDto] })
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.listEnrollments.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca matrícula por id' })
  @ApiResponse({ status: 200, type: EnrollmentResponseDto })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.getEnrollment.execute({ id });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza matrícula (inclui trancar/cancelar via status; total e vigência são recalculados)' })
  @ApiResponse({ status: 200, type: EnrollmentResponseDto })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateEnrollmentRequestDto) {
    return this.updateEnrollment.execute({ id, ...body });
  }

  @Post(':id/renew')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renova a matrícula (estende a vigência em um período e reativa)' })
  @ApiResponse({ status: 200, type: EnrollmentResponseDto })
  @ApiResponse({ status: 400, description: 'Matrícula cancelada não pode ser renovada' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  renew(@Param('id', ParseIntPipe) id: number) {
    return this.renewEnrollment.execute({ id });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove matrícula' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteEnrollment.execute({ id });
  }
}
