import { useState } from 'react';
import {
  Accordion,
  Badge,
  Button,
  Group,
  Code,
  Stack,
  Text,
} from '@mantine/core';
import type { FeatureFlag } from '@/entities/FeatureFlag';
import type { FeatureFlagEnvironment } from '@/entities/FeatureFlagEnvironment';
import { StrategyList } from './StrategyList';
import { IconCloud, IconPlus } from '@tabler/icons-react';
import { sortFlagEnvProductionLast } from '@/entities/FeatureFlagEnvironment';
import { ToggleFlagEnable } from '@/features/FeatureFlag/ToggleFlagEnable';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { validateStrategies } from '../lib/validateStrategies';
import type { Strategy } from '@/entities/Strategy';
import { Link, useSearchParams } from 'react-router-dom';
import { InfoTooltip } from '@/shared/ui';

type StrategyAccordionItemProps = {
  environment: FeatureFlagEnvironment;
  featureFlag: FeatureFlag;
};

const StrategyAccordionItem = ({
  environment,
  featureFlag,
}: StrategyAccordionItemProps) => {
  const [strategies, setStrategies] = useState<Strategy[]>(() =>
    [...environment.strategies].sort((a, b) => b.priority - a.priority),
  );

  const activeStrategies = strategies.filter((s) => s.enabled !== false);
  const validationIssues = validateStrategies(
    environment.enabled,
    activeStrategies,
  );
  const errorCount = validationIssues.filter(
    (i) => i.severity === 'error',
  ).length;
  const warningCount = validationIssues.filter(
    (i) => i.severity === 'warning',
  ).length;

  return (
    <Accordion.Item value={environment.id} className="!bg-white dark:!bg-dark">
      <Accordion.Control component="div">
        <Stack>
          <Group justify="space-between" pr="md">
            <div className="flex flex-row items-center gap-x-2">
              <IconCloud size={20} color="#0EA5A4" />
              <Text fw={500} className="capitalize">
                {environment.environment.name}
              </Text>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.FLAG_TOGGLE}
              >
                <Group gap="xs">
                  <div onClick={(e) => e.stopPropagation()}>
                    <ToggleFlagEnable
                      projectId={featureFlag.projectId}
                      featureFlagEnvironment={environment}
                      withThumbIndicator={false}
                      disabled={featureFlag.archived}
                    />
                  </div>
                  <InfoTooltip>
                    <Text size="sm">
                      Enable or disable the flag for this environment. When
                      disabled, all strategies are ignored and the flag always
                      returns <Code>false</Code>.
                    </Text>
                  </InfoTooltip>
                </Group>
              </RequiredProjectPermissionsWrapper>
            </div>

            <Group gap="xs">
              {strategies.length === 0 ? (
                <Badge size="sm" variant="light" color="blue">
                  No strategies
                </Badge>
              ) : (
                <>
                  {errorCount > 0 && (
                    <Badge size="xs" variant="filled" color="red">
                      {errorCount} error{errorCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {warningCount > 0 && errorCount === 0 && (
                    <Badge size="xs" variant="filled" color="yellow">
                      {warningCount} warning{warningCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                  <Badge size="sm" variant="light" color="gray">
                    {strategies.length} strategies
                  </Badge>
                </>
              )}
            </Group>
          </Group>
        </Stack>
      </Accordion.Control>
      <Accordion.Panel>
        <StrategyList
          featureFlagEnvironment={environment}
          onStrategiesChange={setStrategies}
          addStrategyButtonSlot={
            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.FLAG_STRATEGY_CREATE}
            >
              <Button
                component={Link}
                to={`/project/${featureFlag.project.slug}/feature-flags/${featureFlag.key}/add-strategy?env=${environment.id}`}
                variant="light"
                leftSection={<IconPlus size={16} />}
                disabled={featureFlag.archived}
              >
                Add Strategy
              </Button>
            </RequiredProjectPermissionsWrapper>
          }
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};

type StrategyAccordionProps = {
  featureFlag: FeatureFlag;
};

export const StrategyAccordion = ({ featureFlag }: StrategyAccordionProps) => {
  const [searchParams] = useSearchParams();
  const envParam = searchParams.get('env');

  return (
    <Accordion
      variant="separated"
      radius="md"
      defaultValue={envParam ?? undefined}
    >
      {sortFlagEnvProductionLast(featureFlag.environments).map(
        (environment) => (
          <StrategyAccordionItem
            key={environment.id}
            environment={environment}
            featureFlag={featureFlag}
          />
        ),
      )}
    </Accordion>
  );
};
