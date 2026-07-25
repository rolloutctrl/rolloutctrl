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
import { ActionService } from './action.service';
import { CreateActionRequestDto, UpdateActionRequestDto } from './dto';
import { ReorderRulesRequestDto } from '../strategy/dto/reorder-rules.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentProjectId } from 'src/common/decorators/current-project-id.decorator';
import { User } from 'src/common/generated/prisma/client';

@Controller('actions')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_CREATE)
  async createAction(
    @CurrentUser() user: User,
    @Body() dto: CreateActionRequestDto,
  ) {
    return this.actionService.createAction(user, dto);
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_READ)
  async getAllActions(
    @Param('projectId') projectId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.actionService.findAllActions(
      projectId,
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':actionId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_READ)
  async getAction(
    @Param('actionId') actionId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.actionService.findActionById(actionId, projectId);
  }

  @Patch(':actionId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_UPDATE)
  async updateAction(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('actionId') actionId: string,
    @Body() dto: UpdateActionRequestDto,
  ) {
    return this.actionService.updateAction(user, projectId, actionId, dto);
  }

  @Patch(':actionId/reorder')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_UPDATE)
  async reorderActionStrategies(
    @Param('actionId') actionId: string,
    @Body() dto: ReorderRulesRequestDto,
  ) {
    return this.actionService.reorderActionStrategies(actionId, dto);
  }

  @Delete(':actionId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_DELETE)
  async deleteAction(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('actionId') actionId: string,
  ) {
    return await this.actionService.deleteAction(user, projectId, actionId);
  }
}
