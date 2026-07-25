import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/create.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateUserRequestDto } from './dto/update.dto';
import { ChangePasswordRequestDto } from './dto/change-password.dto';
import { User } from 'src/common/generated/prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  getRolesWithPermissions() {
    return this.userService.getRolesWithPermissions();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_MEMBERS_MANAGE)
  createUser(@Body() createUserDto: CreateUserRequestDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  updateUser(@CurrentUser() user: User, @Body() dto: UpdateUserRequestDto) {
    return this.userService.updateUser(user, dto);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordRequestDto,
  ) {
    return this.userService.changePassword(user, dto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  deleteUser(@CurrentUser() user: User, @Req() req: Request) {
    return this.userService.deleteUser(user, req);
  }
}
