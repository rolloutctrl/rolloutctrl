import { useAuthContext } from '@/app/providers/AuthProvider';
import { LoginForm } from '@/features/Auth/LoginForm';
import { ToggleThemeButton } from '@/features/Theme/ToggleTheme';
import { Logo } from '@/shared/ui';
import { welcomeSubtitleGenerator } from '@/shared/utils/welcomeSubtitileGenerator';
import {
  Box,
  Center,
  Paper,
  Stack,
  Text,
  Title,
  // useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export const LoginPage = () => {
  const { isAuthenticated, isLoading, navigateAfterAuth } = useAuthContext();
  // const { colorScheme } = useMantineColorScheme();

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigateAfterAuth();
    }
  }, [isAuthenticated, isLoading, navigateAfterAuth]);
  return (
    <>
      <Helmet>
        <title>RolloutCtrl - Login</title>
      </Helmet>
      <Box
        className="min-h-[calc(100vh-32px)] bg-gray-100 dark:bg-supa-dark w-full relative"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Box
          pb="md"
          className="absolute top-0 left-0 right-0 flex items-center justify-between"
        >
          <Logo />
          <ToggleThemeButton />
        </Box>

        <Center style={{ flex: 1 }}>
          <Stack
            gap="lg"
            style={{
              width: '100%',
              maxWidth: 720,
              alignItems: 'center',
              // paddingTop: isMobile ? '6rem' : 0,
              // paddingBottom: isMobile ? '4rem' : 0,
              paddingTop: isMobile ? '6rem' : '6.125rem',
              paddingBottom: isMobile ? '4rem' : '6.125rem',
            }}
          >
            <Stack gap={4}>
              <Title ta="center" order={1} size="h2">
                Welcome back!
              </Title>

              <Text c="dimmed" size="sm" ta="center" mt={2}>
                {welcomeSubtitleGenerator()}
              </Text>
            </Stack>

            <Paper
              withBorder
              shadow="none"
              p={22}
              // mt={30}
              radius="md"
              ta="left"
              className="w-full max-w-[400px]"
            >
              <LoginForm />
            </Paper>
          </Stack>
        </Center>
      </Box>
    </>
  );
};
