import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDocumentDto } from './dto/create-user-document.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerifyDocumentDto } from './dto/verify-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('types')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createType(@Body() dto: CreateDocumentTypeDto) {
    return this.documentsService.createType(dto);
  }

  @Get('types')
  async getAllTypes() {
    return this.documentsService.findAllTypes();
  }

  @Patch('types/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateType(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateDocumentTypeDto>,
  ) {
    return this.documentsService.updateType(id, dto);
  }

  @Delete('types/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async deleteType(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.deleteType(id);
  }

  @Post('upload')
  async uploadUserDocument(
    @Body() dto: CreateUserDocumentDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.documentsService.uploadUserDocument(dto, userId);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async verifyDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyDocumentDto,
  ) {
    return this.documentsService.verifyDocument(id, dto);
  }

  @Get('my')
  async getMyDocuments(@CurrentUser('userId') userId: string) {
    return this.documentsService.findUserDocuments(userId);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getPendingDocuments() {
    return this.documentsService.findAllPending();
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserDocuments(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.documentsService.findUserDocuments(userId);
  }

  @Get(':id')
  async getDocumentById(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.findOneDocument(id);
  }
}
