import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateIndividualProfileDto } from './dto/create-individual.dto';
import { CreateBusinessProfileDto } from './dto/create-business.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register/admin')
  async registerAdmin(@Body('user') userData: CreateUserDto) {
    return this.usersService.registerAdmin(userData);
  }

  @Public()
  @Post('register/individual')
  async registerIndividual(
    @Body('user') userData: CreateUserDto,
    @Body('profile') profileData: CreateIndividualProfileDto,
  ) {
    return this.usersService.createIndividualProfile(userData, profileData);
  }

  @Public()
  @Post('register/business')
  async registerBusiness(
    @Body('user') userData: CreateUserDto,
    @Body('profile') profileData: CreateBusinessProfileDto,
  ) {
    return this.usersService.createBusinessProfile(userData, profileData);
  }

  @Get('me')
  async getMe(@CurrentUser('userId') id: string) {
    return this.usersService.getUserById(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('id/:id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll(@Query() dto: GetUsersFilterDto) {
    return this.usersService.findAll(dto);
  }

  @Patch(':id/toggle-status')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.toggleStatus(id);
  }
}
