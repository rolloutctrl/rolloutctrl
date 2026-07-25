import * as yup from 'yup';

import { ApiKeyType } from '@/shared/types/enums';
import type { GenerateApiKeyFormState } from '../model/types';

export const generateApiKeyFormDefaultState: GenerateApiKeyFormState = {
  name: '',
  environmentId: '',
  type: ApiKeyType.CLIENT,
  allowedOrigins: [],
} as const;

export const createFeatureFlagFormSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  environmentId: yup.string().required('Environment ID is required'),
  type: yup.string().required(),
  allowedOrigins: yup
    .array()
    .of(
      yup
        .string()
        .matches(
          /^https?:\/\/(localhost|(\*\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?$/,
          'Allowed origin must be a valid URL with http or https protocol, a domain zone (e.g. .com), optional * wildcard subdomain (e.g. https://*.example.com), or http://localhost with optional port',
        ),
    )
    .when('type', (type: (ApiKeyType | undefined)[]) => {
      if (type[0] === ApiKeyType.SERVER) {
        return yup.array().optional();
      }
      return yup.array().required('Allowed origins are required');
    }),
});