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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Segments')
@ApiBearerAuth()
@Controller('segments')
export class SegmentController {
  constructor(private segmentService: SegmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_CREATE)
  @ApiOperation({ summary: 'Create a new segment' })
  @ApiCreatedResponse({ description: 'Segment created successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async createSegment(
    @CurrentUser() user: User,
    @Body() dto: CreateSegmentRequestDto,
  ) {
    return this.segmentService.createSegment(user, dto);
  }

  @Get('project/:projectId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_READ)
  @ApiOperation({ summary: 'Get all segments for a project' })
  @ApiOkResponse({ description: 'List of segments' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getSegmentsByProject(@Param('projectId') projectId: string) {
    return this.segmentService.findAllSegments(projectId);
  }

  @Get(':segmentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_READ)
  @ApiOperation({ summary: 'Get a segment by id' })
  @ApiOkResponse({ description: 'Segment details' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getSegment(
    @CurrentProjectId() projectId: string,
    @Param('segmentId') segmentId: string,
  ) {
    return this.segmentService.findSegmentById(segmentId, projectId);
  }

  @Patch(':segmentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_UPDATE)
  @ApiOperation({ summary: 'Update a segment' })
  @ApiOkResponse({ description: 'Segment updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async updateSegment(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('segmentId') segmentId: string,
    @Body() dto: UpdateSegmentRequestDto,
  ) {
    return this.segmentService.updateSegment(user, projectId, segmentId, dto);
  }

  @Delete(':segmentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_DELETE)
  @ApiOperation({ summary: 'Delete a segment' })
  @ApiOkResponse({ description: 'Segment deleted successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async deleteSegment(
    @CurrentUser() user: User,
    @CurrentProjectId() projectId: string,
    @Param('segmentId') segmentId: string,
  ) {
    await this.segmentService.deleteSegment(user, projectId, segmentId);
    return { message: 'Segment deleted successfully' };
  }

  @Post('copy-to-project')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_CREATE)
  @ApiOperation({ summary: 'Copy a segment to another project' })
  @ApiCreatedResponse({ description: 'Segment copied successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async copySegmentToProject(@Body() dto: CopySegmentToProjectDto) {
    return this.segmentService.copySegmentToProject(dto);
  }

  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_CREATE)
  @ApiOperation({ summary: 'Create a segment rule' })
  @ApiCreatedResponse({ description: 'Segment rule created successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async createSegmentRule(@Body() dto: CreateSegmentRuleRequestDto) {
    return this.segmentService.createSegmentRule(dto);
  }

  @Get(':segmentId/rules')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_READ)
  @ApiOperation({ summary: 'Get all rules for a segment' })
  @ApiOkResponse({ description: 'List of segment rules' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getSegmentRules(@Param('segmentId') segmentId: string) {
    return this.segmentService.findAllSegmentRules(segmentId);
  }

  @Patch('rules/:ruleId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_UPDATE)
  @ApiOperation({ summary: 'Update a segment rule' })
  @ApiOkResponse({ description: 'Segment rule updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async updateSegmentRule(
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateSegmentRuleRequestDto,
  ) {
    return this.segmentService.updateSegmentRule(ruleId, dto);
  }

  @Delete('rules/:ruleId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.SEGMENT_DELETE)
  @ApiOperation({ summary: 'Delete a segment rule' })
  @ApiOkResponse({ description: 'Segment rule deleted successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async deleteSegmentRule(@Param('ruleId') ruleId: string) {
    await this.segmentService.deleteSegmentRule(ruleId);
    return { message: 'Segment rule deleted successfully' };
  }
}
