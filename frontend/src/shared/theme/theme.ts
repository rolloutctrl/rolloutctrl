import {
  createTheme,
  darken,
  defaultVariantColorsResolver,
  lighten,
  parseThemeColor,
  rgba,
  type MantineColorScheme,
  type MantineColorsTuple,
  type VariantColorsResolver,
} from '@mantine/core';

const rollout: MantineColorsTuple = [
  '#d9faf3',
  '#bdf5e8',
  '#94edd8',
  '#67e3c6',
  '#3bd7b6',
  '#00c9a7',
  '#00b794',
  '#00a281',
  '#008d6f',
  '#00795e',
];

const cyanAccent: MantineColorsTuple = [
  '#e6fbff',
  '#c8f4fc',
  '#97e8f8',
  '#5dd9f1',
  '#22c7e7',
  '#06B6D4',
  '#0897b0',
  '#0d7a8d',
  '#105f6d',
  '#114d59',
];

const variantColorResolver: VariantColorsResolver = (input) => {
  const defaultResolvedColors = defaultVariantColorsResolver(input);
  const parsedColor = parseThemeColor({
    color: input.color || input.theme.primaryColor,
    theme: input.theme,
  });

  const themeColor =
    typeof window !== 'undefined'
      ? (window.localStorage?.getItem(
          'mantine-color-scheme-value',
        ) as MantineColorScheme)
      : null;

  if (
    parsedColor.isThemeColor &&
    parsedColor.color === 'lime' &&
    input.variant === 'filled'
  ) {
    return {
      ...defaultResolvedColors,
      color: 'var(--mantine-color-black)',
      hoverColor: 'var(--mantine-color-black)',
    };
  }

  if (
    themeColor === 'dark' &&
    input.variant === 'light' &&
    parsedColor.color !== 'rollout' &&
    parsedColor.color !== 'red'
  ) {
    return {
      ...defaultResolvedColors,
      color: lighten(parsedColor.value, 0.3),
      background: rgba(parsedColor.value, 0.1),
      hover: rgba(parsedColor.value, 0.15),
    };
  }

  if (
    themeColor === 'dark' &&
    input.variant === 'light' &&
    parsedColor.color === 'rollout'
  ) {
    return {
      ...defaultResolvedColors,
      color: lighten(parsedColor.value, 0.3),
      background: rgba(parsedColor.value, 0.1),
      hover: rgba(parsedColor.value, 0.15),
    };
  }

  if (
    themeColor === 'dark' &&
    input.variant === 'outline' &&
    parsedColor.color === 'rollout'
  ) {
    return {
      ...defaultResolvedColors,
      color: lighten(parsedColor.value, 0.3),
      hover: rgba(parsedColor.value, 0.15),
      border: `1px solid ${parsedColor.value}`,
    };
  }

  if (
    themeColor === 'dark' &&
    input.variant === 'light' &&
    parsedColor.color === 'red'
  ) {
    return {
      ...defaultResolvedColors,
      color: darken(parsedColor.value, 0.1),
      background: rgba(parsedColor.value, 0.1),
      hover: rgba(parsedColor.value, 0.15),
      border: `1px solid ${parsedColor.value}`,
    };
  }

  if (input.variant === 'danger') {
    return {
      background: 'var(--mantine-color-red-9)',
      hover: 'var(--mantine-color-red-8)',
      color: 'var(--mantine-color-white)',
      border: 'none',
    };
  }

  return defaultResolvedColors;
};

export const theme = createTheme({
  primaryColor: 'rollout',

  colors: {
    dark: [
      '#d5d5d5',
      '#acacac',
      '#828282',
      '#575757',
      '#37383F', // Borders and paper
      '#2D2E35', // switch
      '#2D2E35', // Mantine's surface default
      '#22242A', // Mantine's background default
      '#080808',
      '#000000',
    ],
    rollout,
    cyanAccent,
  },

  black: '#111827',
  white: '#ffffff',

  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',

  defaultRadius: 'sm',

  primaryShade: 5,

  headings: { fontFamily: 'Space Grotesk, sans-serif' },

  components: {

    Drawer: {
      defaultProps: {
        overlayProps: {
          backgroundOpacity: 0.35,
          blur: 5,
        },
      },
      styles: (theme: { other: { primaryGradient: string } }) => ({
        header: {
          backgroundColor: theme.other.primaryGradient,
        },
        title: {
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: 600,
        },
        body: {
          paddingTop: 0,
        },
      }),
    },

    Modal: {
      defaultProps: {
        overlayProps: {
          backgroundOpacity: 0.35,
          blur: 5,
        },
      },
      styles: (theme: { other: { primaryGradient: string } }) => ({
        header: {
          backgroundColor: theme.other.primaryGradient,
        },
        title: {
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.125rem',
          fontWeight: 600,
        },
        body: {
          paddingTop: 0,
        },
      }),
    },

    Tabs: {
      styles: {
        tabLabel: {
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1rem',
          fontWeight: 500,
        },
      },
    },

    TextInput: {
      styles: {
        label: {
          fontSize: '0.875rem',
        },
      },
    },

    Radio: {
      styles: {
        label: {
          fontSize: '0.875rem',
        },
      },
    },

    MultiSelect: {
      styles: {
        label: {
          fontSize: '0.875rem',
        },
      },
    },

    RadioGroup: {
      styles: {
        label: {
          fontSize: '0.875rem',
        },
      },
    },

    PasswordInput: {
      styles: {
        label: {
          fontSize: '0.875rem',
        },
      },
    },

    DateTimePicker: {
      styles: {
        label: {
          fontSize: '0.875rem',
        },
      },
    },

    JsonInput: {
      styles: {
        label: {
          fontSize: '0.875rem',
        },
      },
    },

    Select: {
      styles: {
        label: {
          fontSize: '0.875rem',
        },
      },
    },

    NumberInput: {
      styles: {
        label: {
          fontSize: '0.875rem',
        },
      },
    },

    Textarea: {
      styles: {
        label: {
          fontSize: '0.875rem',
        },
      },
    },

    Button: {
      defaultProps: {
        radius: 'sm',
      },
    },
  },

  other: {
    surface: '#ffffff',
    border: '#e5e7eb',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#F43F5E',
    primaryGradient: 'linear-gradient(170deg, #ffffff 0%, #f3f4f6 100%)',
  },

  variantColorResolver,
});
