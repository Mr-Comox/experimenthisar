/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient':
          'linear-gradient(to bottom, rgba(7, 7, 7, .6), rgba(7, 7, 7, .13) 19.79%, rgba(7, 7, 7, .33) 35.86%, rgba(7, 7, 7, .92) 78.02%, #070707)',
        'custom-card-gradient':
          'linear-gradient(125deg, #242424  , #0A0A0A   )',
      },
      textShadow: {
        custom:
          '-1px 1px 0 #FF1987, 1px 1px 0 #FF1987, 1px -1px 0 #FF1987, -1px -1px 0 #FF1987',
      },
      colors: {
        // Main colors
        mainColor: '#FF1987',
        secondaryColor: '#070707',
        tertiaryColor: '#141414',
        quaternaryColor: '#9D00FF',

        // Text colors
        softWhite: '#FBFBFB ',
        softGray: '#E2E2E2',
        subtleGray: '#c0c0c0',
        mediumGray: '#EDEDED',
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [require('tailwindcss-textshadow')],
};
export default config;
