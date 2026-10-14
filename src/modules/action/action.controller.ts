import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Actions')
@ApiBearerAuth()
@Controller('actions')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_CREATE)
  @ApiOperation({ summary: 'Create a new action' })
  @ApiCreatedResponse({ description: 'Action created successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async createAction(
    @CurrentUser() user: User,
    @Body() dto: CreateActionRequestDto,
  ) {
    return this.actionService.createAction(user, dto);
  }

  @Get('project/:projectId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_READ)
  @ApiOperation({ summary: 'Get all actions for a project' })
  @ApiOkResponse({ description: 'Paginated list of actions' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_READ)
  @ApiOperation({ summary: 'Get a single action by id' })
  @ApiOkResponse({ description: 'Action details' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getAction(
    @Param('actionId') actionId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.actionService.findActionById(actionId, projectId);
  }

  @Patch(':actionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_UPDATE)
  @ApiOperation({ summary: 'Update an action' })
  @ApiOkResponse({ description: 'Action updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async updateAction(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('actionId') actionId: string,
    @Body() dto: UpdateActionRequestDto,
  ) {
    return this.actionService.updateAction(user, projectId, actionId, dto);
  }

  @Patch(':actionId/reorder')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_UPDATE)
  @ApiOperation({ summary: 'Reorder action strategies' })
  @ApiOkResponse({ description: 'Strategies reordered successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async reorderActionStrategies(
    @Param('actionId') actionId: string,
    @Body() dto: ReorderRulesRequestDto,
  ) {
    return this.actionService.reorderActionStrategies(actionId, dto);
  }

  @Delete(':actionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ACTION_DELETE)
  @ApiOperation({ summary: 'Delete an action' })
  @ApiNoContentResponse({ description: 'Action deleted successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async deleteAction(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('actionId') actionId: string,
  ) {
    return await this.actionService.deleteAction(user, projectId, actionId);
  }
}
