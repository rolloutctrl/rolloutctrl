import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { QueryAuditLogDto } from './dto';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RoleAccessGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get('by-resource/:resourceType/:resourceId')
  @RequiredPermissions(PermissionCode.AUDIT_READ)
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
  @RequiredPermissions(PermissionCode.AUDIT_READ)
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
  @RequiredPermissions(PermissionCode.AUDIT_READ)
  findByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.auditLogService.findByUser(
      userId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get(':id')
  @RequiredPermissions(PermissionCode.AUDIT_READ)
  findById(@Param('id') id: string) {
    return this.auditLogService.findById(id);
  }

  @Get()
  @RequiredPermissions(PermissionCode.AUDIT_READ)
  findAll(@Query() query: QueryAuditLogDto) {
    return this.auditLogService.findAll(query);
  }
}
