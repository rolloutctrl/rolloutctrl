import { Injectable } from '@nestjs/common';
import { SdkService } from './sdk.service';
import { SdkEvaluationDto } from '../dto/sdk-evaluate.dto';

@Injectable()
export class SdkServerService {
  constructor(private readonly sdkService: SdkService) {}

  async getConfig(
    apiKeyRecord: { projectId: string },
    environmentName: string,
  ) {
    return this.sdkService.getConfig(apiKeyRecord, environmentName);
  }

  async getConfigChanges(
    apiKeyRecord: { projectId: string },
    environmentName: string,
    since: number,
  ) {
    return this.sdkService.getConfigChanges(
      apiKeyRecord,
      environmentName,
      since,
    );
  }

  async trackEvaluations(
    projectId: string,
    evaluations: SdkEvaluationDto[],
  ): Promise<void> {
    return this.sdkService.trackEvaluations(projectId, evaluations);
  }
}
