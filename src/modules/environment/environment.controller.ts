import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';

@Controller('environments')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ENV_READ)
  findAll(@Param('projectId') projectId: string) {
    return this.environmentService.findAll(projectId);
  }

  @Get(':environmentId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ENV_READ)
  findOne(
    @Param('environmentId') environmentId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.environmentService.findOne(projectId, environmentId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ENV_CREATE)
  create(@Body() dto: CreateEnvironmentDto) {
    return this.environmentService.create(dto);
  }

  @Patch(':environmentId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ENV_UPDATE)
  update(
    @Param('environmentId') environmentId: string,
    @Body() dto: UpdateEnvironmentDto,
  ) {
    return this.environmentService.update(environmentId, dto);
  }

  @Delete(':environmentId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ENV_DELETE)
  remove(
    @Param('environmentId') environmentId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.environmentService.remove(projectId, environmentId);
  }
}
