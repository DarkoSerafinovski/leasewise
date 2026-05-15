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
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateInvestmentPortfolioDto } from './dto/create-investment-portfolio.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('individual', 'business')
  async create(
    @Body() dto: CreateInvestmentPortfolioDto,
    @CurrentUser('userId') id: string,
  ) {
    return await this.portfoliosService.create(id, dto);
  }

  @Get('my')
  async findAll(@CurrentUser('userId') userId: string) {
    return await this.portfoliosService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.portfoliosService.findOne(id);
  }

  @Patch(':id/activate')
  async activate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return await this.portfoliosService.toggleActive(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: Partial<CreateInvestmentPortfolioDto>,
  ) {
    return await this.portfoliosService.update(id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return await this.portfoliosService.remove(id, userId);
  }
}
