import { Box, Group, rem, Text } from '@mantine/core';

type LogoProps = {
  isMini?: boolean;
};

export const Logo = ({ isMini = false }: LogoProps) => {
  return (
    <Group gap="xs">
      <Box w={30} h={28}>
        <svg
          width="222"
          height="194"
          viewBox="0 0 222 194"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className='w-full h-full'
        >
          <path
            d="M206 70C206 83.2548 195.255 94 182 94H40C27.4324 94 17.1229 103.66 16.0873 115.96C16.0854 115.982 16.0665 116 16.0437 116C16.0196 116 16 115.98 16 115.956V40C16 26.7452 26.7452 16 40 16H182C195.255 16 206 26.7452 206 40V70Z"
            fill="#00c9a7"
          />
          <path
            d="M182 104C195.255 104 206 114.745 206 128V154C206 167.255 195.255 178 182 178H160.096C154.857 178 149.828 175.945 146.089 172.276L110.036 136.903C97.4513 124.556 76.2065 133.35 76.0302 150.98L76 154V158C76 169.046 67.0457 178 56 178H40C26.7452 178 16 167.255 16 154V128C16 114.745 26.7452 104 40 104H182Z"
            fill="#00c9a7"
          />
        </svg>
      </Box>
      {!isMini && (
        <Text
          className="space-grotesk-semibold"
          size={rem(20)}
          ta="left"
          fw={600}
        >
          RolloutCtrl
        </Text>
      )}
    </Group>
  );
};
