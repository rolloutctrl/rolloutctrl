import type { ApiKeyType } from "@/shared/types/enums"

export type GenerateApiKeyFormState = {
  type: ApiKeyType;
  name: string;
  environmentId: string;
  allowedOrigins: string[];
}