import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly projectService: ProjectService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_READ)
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
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_READ)
  getProjectById(@Param('projectId') projectId: string) {
    return this.projectService.findById(projectId);
  }

  @Get(':projectId/search')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_READ)
  search(@Param('projectId') projectId: string, @Query('q') query: string) {
    return this.projectService.search(projectId, query ?? '');
  }

  @Get(':projectId/overview')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_READ)
  getProjectOverview(@Param('projectId') projectId: string) {
    return this.projectService.getProjectOverview(projectId);
  }

  @Get(':projectId/members')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_MEMBERS_MANAGE)
  getProjectMembers(@Param('projectId') projectId: string) {
    return this.projectService.getProjectMembers(projectId);
  }

  @Get(':projectId/api-keys')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_READ)
  getAllApiKeysByProjectId(@Param('projectId') projectId: string) {
    return this.apiKeyService.findAllKeysByProjectId(projectId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_CREATE)
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
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_UPDATE)
  async updateProject(@Body() dto: UpdateProjectRequestDto) {
    return await this.projectService.update(dto);
  }

  @Patch(':projectId/member-access')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_MEMBERS_MANAGE)
  async updateProjectMemberAccess(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectMemberAccessRequestDto,
  ) {
    return await this.projectService.updateProjectMemberAccess(projectId, dto);
  }

  @Post(':projectId/api-keys/')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.API_KEY_CREATE)
  async createProjectApiKey(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectApiKeyRequestDto,
  ) {
    return await this.apiKeyService.create(user, projectId, dto);
  }

  @Patch(':projectId/api-keys/:keyId/revoke')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.API_KEY_REVOKE)
  revokeApiKey(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Param('keyId') keyId: string,
  ) {
    return this.apiKeyService.revokeByKeyId(user, projectId, keyId);
  }

  @Delete(':projectId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.PROJECT_DELETE)
  async deleteProject(@Param('projectId') projectId: string) {
    return await this.projectService.delete(projectId);
  }

  @Delete(':projectId/api-keys/:keyId/delete')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.API_KEY_REVOKE)
  deleteApiKey(
    @Param('projectId') projectId: string,
    @Param('keyId') keyId: string,
  ) {
    return this.apiKeyService.deleteApiKeyByKeyId(projectId, keyId);
  }
}
