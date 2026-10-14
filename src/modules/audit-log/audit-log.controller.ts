import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { QueryAuditLogDto } from './dto';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RoleAccessGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get('by-resource/:resourceType/:resourceId')
  @HttpCode(HttpStatus.OK)
  @RequiredPermissions(PermissionCode.AUDIT_READ)
  @ApiOperation({ summary: 'Get audit logs by resource' })
  @ApiOkResponse({ description: 'List of audit logs for the resource' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findByResource(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.auditLogService.findByResource(
      resourceType as any,
      resourceId,
      projectId,
    );
  }

  @Get('by-project/:projectId')
  @HttpCode(HttpStatus.OK)
  @RequiredPermissions(PermissionCode.AUDIT_READ)
  @ApiOperation({ summary: 'Get audit logs by project' })
  @ApiOkResponse({ description: 'List of audit logs for the project' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findByProject(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogService.findByProject(
      projectId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('by-user/:userId')
  @HttpCode(HttpStatus.OK)
  @RequiredPermissions(PermissionCode.AUDIT_READ)
  @ApiOperation({ summary: 'Get audit logs by user' })
  @ApiOkResponse({ description: 'List of audit logs for the user' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.auditLogService.findByUser(
      userId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequiredPermissions(PermissionCode.AUDIT_READ)
  @ApiOperation({ summary: 'Get an audit log by id' })
  @ApiOkResponse({ description: 'Audit log details' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findById(@Param('id') id: string) {
    return this.auditLogService.findById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequiredPermissions(PermissionCode.AUDIT_READ)
  @ApiOperation({ summary: 'Get all audit logs with filters' })
  @ApiOkResponse({ description: 'Paginated list of audit logs' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findAll(@Query() query: QueryAuditLogDto) {
    return this.auditLogService.findAll(query);
  }
}
