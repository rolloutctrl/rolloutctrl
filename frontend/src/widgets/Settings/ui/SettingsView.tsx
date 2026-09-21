import { useGetCurrentUser } from '@/entities/User';
import {
  Box,
  Grid,
  Title,
  Text,
  Tabs,
  Paper,
  Group,
  Avatar,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { OrganizationsTab, ProfileTab, UsersTab } from './tabs';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { useMediaQuery } from '@mantine/hooks';

export const SettingsView = () => {
  const { settingsTab } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data: currentUser } = useGetCurrentUser();
  return (
    <Grid columns={12} gap="md">
      <Grid.Col span={12}>
        <Group gap="sm" align="center" px={isMobile ? 0 : "md"}>
          <Avatar src={currentUser?.avatar} alt={currentUser?.name} size={48} />
          <Box className="flex flex-col items-start gap-1">
            <Title order={1} fw={700} size="lg" ta="left">
              {currentUser?.name}
            </Title>
            <Text component="span" size="sm" ta="left" c="dimmed">
              Your personal account
            </Text>
          </Box>
        </Group>
      </Grid.Col>
      <Grid.Col span={12}>
        <Tabs
          value={settingsTab}
          orientation={isMobile ? "horizontal" : "vertical"}
          defaultValue="overview"
          onChange={(value) => navigate(`/settings/${value}`)}
          classNames={{
            list: '!w-full',
            tabLabel: isMobile ? 'text-center' : '!text-left',
          }}
        >
          <Grid.Col span={{ base: 12, md: 12, lg: 3 }}>
            <Tabs.List grow justify="center">
              <Tabs.Tab value="profile">Profile</Tabs.Tab>
              <RequiredProjectPermissionsWrapper
                permissions={[PermissionCode.ORG_MANAGE]}
              >
                <Tabs.Tab value="organization">Organization</Tabs.Tab>
              </RequiredProjectPermissionsWrapper>
              <RequiredProjectPermissionsWrapper
                permissions={[PermissionCode.ORG_MEMBERS_READ]}
              >
                <Tabs.Tab value="users">Users</Tabs.Tab>
              </RequiredProjectPermissionsWrapper>

              {/* <Tabs.Tab value="notifications">Notifications</Tabs.Tab> */}
            </Tabs.List>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 12, lg: 9 }} pl={isMobile ? 0 : "md"} pt={isMobile ? "md" : 0}>
            <Paper radius="md" ta="left" withBorder>
              <Tabs.Panel value="profile">
                {/* <GeneralTab /> */}
                <ProfileTab />
              </Tabs.Panel>
              <Tabs.Panel value="organization">
                <OrganizationsTab />
              </Tabs.Panel>
              <Tabs.Panel value="users">
                <UsersTab />
              </Tabs.Panel>
              {/* <Tabs.Panel value="notifications">
                Notifications
              </Tabs.Panel> */}
            </Paper>
          </Grid.Col>
        </Tabs>
      </Grid.Col>
    </Grid>
  );
};
