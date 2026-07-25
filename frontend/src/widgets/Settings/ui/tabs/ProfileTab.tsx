import { ChangeUserPasswordForm } from '@/features/User/ChangeUserPassword';
import { DeleteUserButton } from '@/features/User/DeleteUser';
import { EditUserForm } from '@/features/User/EditUser';
import { Box, Divider, Grid, Text, Title } from '@mantine/core';

export const ProfileTab = () => {
  return (
    <>
      <Box p={0} className="flex flex-col w-full">
        <Grid columns={12} p="md">
          <Grid.Col span={4} ta="left">
            <Title order={3} fw={600} size="lg" ta="left" pb={4}>
              Profile
            </Title>
            <Text size="sm" c="dimmed">
              Update your profile information
            </Text>
          </Grid.Col>
          <Grid.Col span={5} ta="left">
            <EditUserForm />
          </Grid.Col>
        </Grid>
      </Box>
      <Divider my="md" />
      <Box p={0} className="flex flex-col w-full">
        <Grid columns={12} p="md">
          <Grid.Col span={4} ta="left">
            <Title order={3} fw={600} size="lg" ta="left" pb={4}>
              Password
            </Title>
            <Text size="sm" c="dimmed">
              Change your password
            </Text>
          </Grid.Col>
          <Grid.Col span={5} ta="left">
            <ChangeUserPasswordForm />
          </Grid.Col>
        </Grid>
      </Box>
      <Divider my="md" />
      <Grid columns={12} p="md">
        <Grid.Col span={4} ta="left">
          <Title order={3} fw={600} size="lg" ta="left" c="red" pb={4}>
            Delete account
          </Title>
          <Text size="sm" c="dimmed" className="max-w-[16.5rem]">
            This actions cannot be undone.
          </Text>
        </Grid.Col>
        <Grid.Col span={6} ta="left">
          <DeleteUserButton />
        </Grid.Col>
      </Grid>
    </>
  );
};
