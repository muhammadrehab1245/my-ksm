import type { ButtonStylesParams, MantineThemeOverride } from '@mantine/core';

export const mantineTheme: MantineThemeOverride = {
  colorScheme: 'light',
  fontFamily:
    'YuGothic, "Yu Gothic", -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  colors: {
    gray: ['#f5f5f4', '#efefef', '#d6d3d2', '#bab6b5', '#a7a2a0', '#7f7776', '#6a6462', '#55504e', '#3e3a39'],
    blue: ['#eef7fc', '#dceff9', '#b9e0f3', '#96d0e9', '#73c1e7', '#51b1e1', '#299fdb', '#218bc0', '#1b729d'],
  },
  defaultRadius: 5,
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        color: 'blue',
        radius: 8,
      },
      // @ts-ignore
      styles: (theme, { variant }: ButtonStylesParams) => ({
        root: {
          '&:hover': {
            backgroundColor: variant === 'outline' && theme.colors.blue[0],
          },
        },
        label: {
          fontWeight: 400,
        },
      }),
    },
  },
  globalStyles: (theme) => ({
    body: {
      color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    },
  }),
};
