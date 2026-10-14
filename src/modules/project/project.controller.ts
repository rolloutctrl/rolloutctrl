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
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './services/project.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { ApiKeyService } from './services/api-key.service';
import { CreateProjectRequestDto } from './dto/create-project.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateProjectApiKeyRequestDto } from './dto/create-api-key.dto';
import { OrganizationRole } from 'src/common/generated/prisma/enums';
import { User } from 'src/common/generated/prisma/client';
import { UpdateProjectRequestDto } from './dto/update-project.dto';
import { UpdateProjectMemberAccessRequestDto } from './dto/update-member.dto';
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
import { Project } from 'src/common/generated/nestjs-dto/project.entity';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly projectService: ProjectService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_READ)
  @ApiOperation({ summary: 'Get all projects' })
  @ApiOkResponse({ type: [Project], description: 'List of projects' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getAll(@CurrentUser() user: User, @Request() req: any) {
    const organizationId: string =
      req.organizationId || req.headers['x-organization-id'];
    const organizationRole: OrganizationRole =
      req.organizationRole ?? OrganizationRole.MEMBER;
    return this.projectService.findAll(
      user.id,
      organizationId,
      organizationRole,
    );
  }

  @Get(':projectId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_READ)
  @ApiOperation({ summary: 'Get project by id' })
  @ApiOkResponse({ description: 'Project details' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getProjectById(@Param('projectId') projectId: string) {
    return this.projectService.findById(projectId);
  }

  @Get(':projectId/search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_READ)
  @ApiOperation({ summary: 'Search within a project' })
  @ApiOkResponse({ description: 'Search results' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  search(@Param('projectId') projectId: string, @Query('q') query: string) {
    return this.projectService.search(projectId, query ?? '');
  }

  @Get(':projectId/overview')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_READ)
  @ApiOperation({ summary: 'Get project overview' })
  @ApiOkResponse({ description: 'Project overview data' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getProjectOverview(@Param('projectId') projectId: string) {
    return this.projectService.getProjectOverview(projectId);
  }

  @Get(':projectId/members')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_MEMBERS_MANAGE)
  @ApiOperation({ summary: 'Get project members' })
  @ApiOkResponse({ description: 'List of project members' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getProjectMembers(@Param('projectId') projectId: string) {
    return this.projectService.getProjectMembers(projectId);
  }

  @Get(':projectId/api-keys')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_READ)
  @ApiOperation({ summary: 'Get all API keys for a project' })
  @ApiOkResponse({ description: 'List of API keys' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getAllApiKeysByProjectId(@Param('projectId') projectId: string) {
    return this.apiKeyService.findAllKeysByProjectId(projectId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_CREATE)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({ description: 'Project created successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async createProject(
    @CurrentUser() user: User,
    @Request() req: any,
    @Body() dto: CreateProjectRequestDto,
  ) {
    const organizationId: string =
      req.organizationId || req.headers['x-organization-id'];
    return await this.projectService.create(user.id, organizationId, dto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_UPDATE)
  @ApiOperation({ summary: 'Update a project' })
  @ApiOkResponse({ description: 'Project updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async updateProject(@Body() dto: UpdateProjectRequestDto) {
    return await this.projectService.update(dto);
  }

  @Patch(':projectId/member-access')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_MEMBERS_MANAGE)
  @ApiOperation({ summary: 'Update project member access' })
  @ApiOkResponse({ description: 'Member access updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async updateProjectMemberAccess(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectMemberAccessRequestDto,
  ) {
    return await this.projectService.updateProjectMemberAccess(projectId, dto);
  }

  @Post(':projectId/api-keys/')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.API_KEY_CREATE)
  @ApiOperation({ summary: 'Create a project API key' })
  @ApiCreatedResponse({ description: 'API key created successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async createProjectApiKey(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectApiKeyRequestDto,
  ) {
    return await this.apiKeyService.create(user, projectId, dto);
  }

  @Patch(':projectId/api-keys/:keyId/revoke')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.API_KEY_REVOKE)
  @ApiOperation({ summary: 'Revoke a project API key' })
  @ApiOkResponse({ description: 'API key revoked successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  revokeApiKey(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Param('keyId') keyId: string,
  ) {
    return this.apiKeyService.revokeByKeyId(user, projectId, keyId);
  }

  @Delete(':projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_DELETE)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiNoContentResponse({ description: 'Project deleted successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async deleteProject(@Param('projectId') projectId: string) {
    return await this.projectService.delete(projectId);
  }

  @Delete(':projectId/api-keys/:keyId/delete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.API_KEY_REVOKE)
  @ApiOperation({ summary: 'Delete a project API key' })
  @ApiOkResponse({ description: 'API key deleted successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  deleteApiKey(
    @Param('projectId') projectId: string,
    @Param('keyId') keyId: string,
  ) {
    return this.apiKeyService.deleteApiKeyByKeyId(projectId, keyId);
  }
}
