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

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getMyOrganization(@CurrentUser() user: User) {
    return this.organizationService.getMyOrganization(user.id);
  }

  @Get('members')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MEMBERS_READ)
  getMembers(@CurrentUser() user: User) {
    return this.organizationService.getOrganizationMembers(user.organizationId);
  }

  @Get(':organizationId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  findById(@Param('organizationId') organizationId: string) {
    return this.organizationService.findById(organizationId);
  }

  @Patch(':organizationId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MANAGE)
  update(
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateOrganizationRequestDto,
  ) {
    return this.organizationService.updateOrganization(organizationId, dto);
  }

  @Post(':organizationId/members')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MEMBERS_INVITE)
  addMember(
    @Param('organizationId') organizationId: string,
    @Body() dto: AddOrganizationUserRequestDto,
  ) {
    return this.organizationService.addUserToOrganization(organizationId, dto);
  }

  @Patch(':organizationId/members/:userId')
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MEMBERS_UPDATE)
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
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MEMBERS_REMOVE)
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
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ORG_MANAGE)
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
