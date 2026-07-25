import { Button } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';

type BackButtonProps = {
  label?: string;
  to?: string;
};

export const BackButton = ({ label = 'Back', to }: BackButtonProps) => {
  const navigate = useNavigate();
  const handleClick = () => navigate(-1);

  if (to) {
    return (
      <Button
        component={Link}
        variant="transparent"
        to={to}
        color="gray.7"
        size="sm"
        className="hover:!text-rollout transition-colors"
        leftSection={<IconChevronLeft size={14}  />}
        aria-label={label}
        style={{ paddingLeft: 0 }}
      >
        {label}
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant="transparent"
      color="gray.7"
      size="sm"
      className="hover:!text-rollout transition-colors"
      leftSection={<IconChevronLeft size={14}  />}
      aria-label={label}
      onClick={handleClick}
      style={{ paddingLeft: 0 }}
    >
      {label}
    </Button>
  );
};
