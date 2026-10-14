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
import { EnvironmentService } from './environment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAccessGuard } from 'src/common/guards/role-access.guard';
import { RequiredPermissions } from 'src/common/decorators/required-permissions.decorator';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
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

@ApiTags('Environments')
@ApiBearerAuth()
@Controller('environments')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @Get('project/:projectId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ENV_READ)
  @ApiOperation({ summary: 'Get all environments for a project' })
  @ApiOkResponse({ description: 'List of environments' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findAll(@Param('projectId') projectId: string) {
    return this.environmentService.findAll(projectId);
  }

  @Get(':environmentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ENV_READ)
  @ApiOperation({ summary: 'Get an environment by id' })
  @ApiOkResponse({ description: 'Environment details' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findOne(
    @Param('environmentId') environmentId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.environmentService.findOne(projectId, environmentId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ENV_CREATE)
  @ApiOperation({ summary: 'Create a new environment' })
  @ApiCreatedResponse({ description: 'Environment created successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  create(@Body() dto: CreateEnvironmentDto) {
    return this.environmentService.create(dto);
  }

  @Patch(':environmentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ENV_UPDATE)
  @ApiOperation({ summary: 'Update an environment' })
  @ApiOkResponse({ description: 'Environment updated successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  update(
    @Param('environmentId') environmentId: string,
    @Body() dto: UpdateEnvironmentDto,
  ) {
    return this.environmentService.update(environmentId, dto);
  }

  @Delete(':environmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RoleAccessGuard)
  @RequiredPermissions(PermissionCode.ENV_DELETE)
  @ApiOperation({ summary: 'Delete an environment' })
  @ApiNoContentResponse({ description: 'Environment deleted successfully' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  remove(
    @Param('environmentId') environmentId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.environmentService.remove(projectId, environmentId);
  }
}
