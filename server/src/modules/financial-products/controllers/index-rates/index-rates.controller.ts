import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { IndexRatesService } from '../../services/index-rates/index-rates.service';
import {
  CreateIndexRateDto,
  UpdateIndexRateDto,
} from '../../dto/create-index-rate.dto';
@Controller('index-rates')
export class IndexRatesController {
  constructor(private readonly indexRatesService: IndexRatesService) {}

  @Post()
  create(@Body() createDto: CreateIndexRateDto) {
    return this.indexRatesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.indexRatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.indexRatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateIndexRateDto,
  ) {
    return this.indexRatesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.indexRatesService.remove(id);
  }
}
