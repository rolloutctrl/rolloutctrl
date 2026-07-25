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

export class CreateProjectApiKeyRequestDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 150)
  name: string;

  @IsNotEmpty()
  @IsString()
  environmentId: string;

  @IsEnum(ApiKeyType)
  type: ApiKeyType;

  @ValidateIf((o) => o.type !== ApiKeyType.SERVER)
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
