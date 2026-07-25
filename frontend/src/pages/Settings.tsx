import { SettingsView } from '@/widgets/Settings';
import { Container } from '@mantine/core';
import { Helmet } from 'react-helmet-async';

export const SettingsPage = () => {
  return (
    <>
      <Helmet>
        <title>RolloutCtrl - Settings</title>
      </Helmet>
      <Container size="xl">
        <SettingsView />
      </Container>
    </>
  );
};
