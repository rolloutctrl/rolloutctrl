import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SegmentService } from './segment.service';
import {
  CreateSegmentRequestDto,
  UpdateSegmentRequestDto,
  CreateSegmentRuleRequestDto,
  UpdateSegmentRuleRequestDto,
  CopySegmentToProjectDto,
} from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentProjectId } from 'src/common/decorators/current-project-id.decorator';
import { User } from 'src/common/generated/prisma/client';

@Controller('segments')
export class SegmentController {
  constructor(private segmentService: SegmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_CREATE)
  async createSegment(
    @CurrentUser() user: User,
    @Body() dto: CreateSegmentRequestDto,
  ) {
    return this.segmentService.createSegment(user, dto);
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_READ)
  async getSegmentsByProject(@Param('projectId') projectId: string) {
    return this.segmentService.findAllSegments(projectId);
  }

  @Get(':segmentId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_READ)
  async getSegment(
    @CurrentProjectId() projectId: string,
    @Param('segmentId') segmentId: string,
  ) {
    return this.segmentService.findSegmentById(segmentId, projectId);
  }

  @Patch(':segmentId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_UPDATE)
  async updateSegment(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('segmentId') segmentId: string,
    @Body() dto: UpdateSegmentRequestDto,
  ) {
    return this.segmentService.updateSegment(user, projectId, segmentId, dto);
  }

  @Delete(':segmentId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_DELETE)
  async deleteSegment(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('segmentId') segmentId: string,
  ) {
    await this.segmentService.deleteSegment(user, projectId, segmentId);
    return { message: 'Segment deleted successfully' };
  }

  @Post('copy-to-project')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_CREATE)
  async copySegmentToProject(@Body() dto: CopySegmentToProjectDto) {
    return this.segmentService.copySegmentToProject(dto);
  }

  @Post('rules')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_CREATE)
  async createSegmentRule(@Body() dto: CreateSegmentRuleRequestDto) {
    return this.segmentService.createSegmentRule(dto);
  }

  @Get(':segmentId/rules')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_READ)
  async getSegmentRules(@Param('segmentId') segmentId: string) {
    return this.segmentService.findAllSegmentRules(segmentId);
  }

  @Patch('rules/:ruleId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_UPDATE)
  async updateSegmentRule(
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateSegmentRuleRequestDto,
  ) {
    return this.segmentService.updateSegmentRule(ruleId, dto);
  }

  @Delete('rules/:ruleId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_DELETE)
  async deleteSegmentRule(@Param('ruleId') ruleId: string) {
    await this.segmentService.deleteSegmentRule(ruleId);
    return { message: 'Segment rule deleted successfully' };
  }
}
