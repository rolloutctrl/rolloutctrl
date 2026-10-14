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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { OrganizationService } from './organization.service';
import {
  AddOrganizationUserRequestDto,
  UpdateOrganizationRequestDto,
} from './dto';
import { TransferOwnershipRequestDto } from './dto/transfer-ownership.dto';
import { UpdateOrganizationUserRequestDto } from './dto/update-organization-user.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
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
import { Organization } from 'src/common/generated/nestjs-dto/organization.entity';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current user organization' })
  @ApiOkResponse({ type: Organization, description: 'Organization details' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getMyOrganization(@CurrentUser() user: User) {
    return this.organizationService.getMyOrganization(user.id);
  }

  @Get('members')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MEMBERS_READ)
  @ApiOperation({ summary: 'Get organization members' })
  @ApiOkResponse({ description: 'List of organization members' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getMembers(@CurrentUser() user: User) {
    return this.organizationService.getOrganizationMembers(user.organizationId);
  }

  @Get(':organizationId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @ApiOperation({ summary: 'Get organization by id' })
  @ApiOkResponse({ description: 'Organization details' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findById(@Param('organizationId') organizationId: string) {
    return this.organizationService.findById(organizationId);
  }

  @Patch(':organizationId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MANAGE)
  @ApiOperation({ summary: 'Update organization' })
  @ApiOkResponse({ description: 'Organization updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  update(
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateOrganizationRequestDto,
  ) {
    return this.organizationService.updateOrganization(organizationId, dto);
  }

  @Post(':organizationId/members')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MEMBERS_INVITE)
  @ApiOperation({ summary: 'Add a member to the organization' })
  @ApiCreatedResponse({ description: 'Member added successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  addMember(
    @Param('organizationId') organizationId: string,
    @Body() dto: AddOrganizationUserRequestDto,
  ) {
    return this.organizationService.addUserToOrganization(organizationId, dto);
  }

  @Patch(':organizationId/members/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MEMBERS_UPDATE)
  @ApiOperation({ summary: 'Update an organization member role' })
  @ApiOkResponse({ description: 'Member role updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  updateMember(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateOrganizationUserRequestDto,
  ) {
    return this.organizationService.updateOrganizationRole(
      organizationId,
      userId,
      dto,
    );
  }

  @Delete(':organizationId/members/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MEMBERS_REMOVE)
  @ApiOperation({ summary: 'Remove a member from the organization' })
  @ApiOkResponse({ description: 'Member removed successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  removeMember(
    @CurrentUser() user: User,
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
  ) {
    return this.organizationService.removeMember(
      organizationId,
      user.id,
      userId,
    );
  }

  @Post(':organizationId/transfer-ownership')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MANAGE)
  @ApiOperation({ summary: 'Transfer organization ownership' })
  @ApiOkResponse({ description: 'Ownership transferred successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  transferOwnership(
    @CurrentUser() user: User,
    @Param('organizationId') organizationId: string,
    @Body() dto: TransferOwnershipRequestDto,
  ) {
    return this.organizationService.transferOwnership(
      organizationId,
      user.id,
      dto,
    );
  }
}
