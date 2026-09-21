import { SettingsView } from '@/widgets/Settings';
import { Container } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Helmet } from 'react-helmet-async';

export const SettingsPage = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <>
      <Helmet>
        <title>RolloutCtrl - Settings</title>
      </Helmet>
      <Container size="xl" px={isMobile ? 0 : 'md'}>
        <SettingsView />
      </Container>
    </>
  );
};
