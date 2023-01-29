const { fontFamily, spacing, borderRadius } = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./src/**/*.tsx'],
  theme: {
    fontFamily: {
      sans: ['YuGothic', 'Yu Gothic', ...fontFamily.sans],
      body: ['YuGothic', 'Yu Gothic', ...fontFamily.sans],
    },
    gridAutoFit: {
      1: spacing[1],
      7: spacing[7],
    },
    gridAutoFill: {
      1: spacing[1],
      7: spacing[7],
    },
    extend: {
      borderRadius: {
        ...borderRadius,
        DEFAULT: '8px',
      },
      colors: {
        neutral: colors.slate,
        positive: colors.green,
        urge: colors.violet,
        warning: colors.yellow,
        info: colors.blue,
        critical: colors.red,
        primary: {
          50: '#fef8f4',
          100: '#fdf1ea',
          200: '#fbdcca',
          300: '#f8c7aa',
          400: '#f29c6b',
          500: '#ed722b',
          600: '#d56727',
          700: '#b25620',
          800: '#8e441a',
          900: '#743815',
        },
        gray: {
          100: '#f5f5f4',
          200: '#efefef',
          300: '#d6d3d2',
          400: '#bab6b5',
          500: '#a7a2a0',
          600: '#7f7776',
          700: '#6a6462',
          800: '#55504e',
          900: '#3e3a39',
        },
        blue: {
          50: '#f4fafd',
          100: '#eaf5fb',
          200: '#cae7f6',
          300: '#a9d9f1',
          400: '#69bce6',
          500: '#299fdb',
          600: '#258fc5',
          700: '#1f77a4',
          800: '#195f83',
          900: '#144e6b',
        },
      },
      container: {
        center: true,
        padding: spacing[6],
        screens: {
          sm: '100%',
          md: '640px',
          lg: '960px',
          xl: '1448px',
        },
      },
      screens: {
        dlg: { max: '1023px' },
        dmd: { max: '767px' },
      },
      maxWidth: {
        'min-content': 'min-content',
        'max-content': 'max-content',
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
        '1/4': '25%',
        '3/4': '75%',
        '1/5': '20%',
        '2/5': '40%',
        '3/5': '60%',
        '4/5': '80%',
      },
      maxHeight: {
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
        '1/4': '25%',
        '3/4': '75%',
        '1/5': '20%',
        '2/5': '40%',
        '3/5': '60%',
        '4/5': '80%',
      },
      minWidth: {
        'min-content': 'min-content',
        'max-content': 'max-content',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        '4/5': '80%',
      },
      minHeight: {
        'min-content': 'min-content',
        'max-content': 'max-content',
        '1/4': '25vh',
        '1/2': '50vh',
        '3/4': '75vh',
        '4/5': '80vh',
      },
      inset: {
        '1/2': '50%',
        '-1/2': '-50%',
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme, addVariant }) => {
      addVariant('child', '&>*');
      matchUtilities(
        { 'grid-auto-fit': (value) => ({ gridTemplateColumns: `repeat(auto-fit, minmax(${value}, 1fr))` }) },
        { values: theme('gridAutoFit') },
      );
      matchUtilities(
        { 'grid-auto-fill': (value) => ({ gridTemplateColumns: `repeat(auto-fill, minmax(${value}, 1fr))` }) },
        { values: theme('gridAutoFill') },
      );
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
};
