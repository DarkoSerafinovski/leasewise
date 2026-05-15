import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  ParseFloatPipe,
  BadRequestException,
} from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateFullInstrumentDto } from './dto/create-full-instrument.dto';
import { CreateCorrelationDto } from './dto/create-correlation.dto';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post('full')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createFull(@Body() dto: CreateFullInstrumentDto) {
    return this.investmentsService.createFullInstrument(dto);
  }

  @Get()
  async getAll() {
    return this.investmentsService.findAllInstruments();
  }

  @Get('instrument/:id')
  async getOneById(@Param('id', ParseUUIDPipe) id: string) {
    return this.investmentsService.getInstrumentDetails(id);
  }

  @Get('ticker/:ticker')
  async getOneByTicker(@Param('ticker') ticker: string) {
    return this.investmentsService.getInstrumentByTicker(ticker);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: Partial<CreateFullInstrumentDto>,
  ) {
    return await this.investmentsService.updateInstrument(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.investmentsService.deleteInstrument(id);
  }

  @Post('correlations')
  async createCorr(@Body() dto: CreateCorrelationDto) {
    return await this.investmentsService.createCorrelation(dto);
  }

  @Get('correlations')
  async getCorrs() {
    return await this.investmentsService.findAllCorrelations();
  }

  @Patch('correlations/:id')
  async updateCorr(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('correlation_coefficient', ParseFloatPipe) coefficient: number,
  ) {
    if (coefficient < -1 || coefficient > 1) {
      throw new BadRequestException(
        'Koeficijent korelacije mora biti između -1 i 1',
      );
    }
    return await this.investmentsService.updateCorrelation(id, coefficient);
  }

  @Delete('correlations/:id')
  async removeCorr(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.investmentsService.deleteCorrelation(id);
  }
}
