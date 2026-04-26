import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register/individual')
  async registerIndividual(
    @Body('user') userData: any,
    @Body('profile') profileData: any,
  ) {
    return this.usersService.createIndividualProfile(userData, profileData);
  }

  @Post('register/business')
  async registerBusiness(
    @Body('user') userData: any,
    @Body('profile') profileData: any,
  ) {
    return this.usersService.createBusinessProfile(userData, profileData);
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Get('me')
  async getMe(@CurrentUser('userId') id: string) {
    return this.usersService.getUserById(id);
  }

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
