import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreditScoreService } from './credit-score.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateCreditScoreCategoryDto,
  UpdateCreditScoreCategoryDto,
} from './dto/create-category.dto';
import { EvaluateCreditDto } from './dto/evaluate-credit.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('credit-score')
export class CreditScoreController {
  constructor(private readonly creditScoreService: CreditScoreService) {}

  // Unos kategorije boniteta
  @Post('category')
  @UseGuards(RolesGuard)
  @Roles('admin')
  createCategory(@Body() dto: CreateCreditScoreCategoryDto) {
    return this.creditScoreService.createCategory(dto);
  }

  // Prikaz svih kategorija boniteta
  @Get('category')
  getCategories() {
    return this.creditScoreService.findAllCategories();
  }

  // Prikaz kategorije na osnovu ID-a
  @Get('category/:id')
  getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.creditScoreService.findOneCategory(id);
  }

  // Update kategorije
  @Patch('update-category/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCreditScoreCategoryDto,
  ) {
    return this.creditScoreService.updateCategory(id, dto);
  }

  // (De)aktivacija kategorije
  @Patch('toggle-category/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  toggleCategory(@Param('id', ParseIntPipe) id: number) {
    return this.creditScoreService.toggleCategoryActivation(id);
  }

  // Brisanje kategorije
  @Delete('delete-category/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.creditScoreService.removeCategory(id);
  }

  // Prikaz svih snapshot-ova nekog korisnika
  @Get('snapshots/user/:userId')
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.creditScoreService.findByUserId(userId);
  }

  // Prikaz svih snapshot-ova ulogovanog korisnika
  @Get('my-snapshots')
  async findMy(@CurrentUser('userId') id: string) {
    return await this.creditScoreService.findByUserId(id);
  }

  // Prikaz snapshot-a na osnovu ID-a
  @Get('snapshots/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditScoreService.findOneSnapshot(id);
  }

  // Brisanje snapshot-a
  @Delete('snapshots/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditScoreService.removeSnapshot(id);
  }

  // Racunanje i unos snapshot-a
  @Post('evaluate')
  @UseGuards(RolesGuard)
  @Roles('individual', 'business')
  async evaluate(
    @CurrentUser('userId') id: string,
    @Body() dto: EvaluateCreditDto,
  ) {
    return await this.creditScoreService.evaluateCreditWorthiness(id, dto);
  }

  // Oznaka (de)aktivacije ugovora
  @Patch('activate/:snapshotId')
  @UseGuards(RolesGuard)
  @Roles('individual', 'business')
  async activateEngagement(
    @Param('snapshotId', new ParseUUIDPipe()) snapshotId: string,
  ) {
    return await this.creditScoreService.toggleSnapshotEngagement(
      snapshotId,
      true,
    );
  }
}
