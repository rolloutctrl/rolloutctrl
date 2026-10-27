import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiKeyType } from 'src/common/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectApiKeyRequestDto {
  @ApiProperty({
    example: 'My API Key',
    minLength: 2,
    maxLength: 150,
    description: 'API key name',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 150)
  name: string;

  @ApiProperty({ example: 'env_123', description: 'Environment ID' })
  @IsNotEmpty()
  @IsString()
  environmentId: string;

  @ApiProperty({ enum: Object.values(ApiKeyType), description: 'API key type' })
  @IsEnum(ApiKeyType)
  type: ApiKeyType;

  @ApiProperty({
    type: [String],
    description: 'Allowed origins (required for CLIENT type)',
    example: ['https://example.com'],
  })
  @ValidateIf((o) => o.type === ApiKeyType.CLIENT)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(
    /^https?:\/\/(localhost|(\*\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?$/,
    {
      each: true,
      message:
        'Each allowed origin must be a valid URL with http or https protocol, a domain zone (e.g. .com), optional * wildcard subdomain (e.g. https://*.example.com), or http://localhost with optional port',
    },
  )
  allowedOrigins: string[];
}
