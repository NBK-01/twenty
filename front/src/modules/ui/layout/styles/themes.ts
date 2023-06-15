import { css } from '@emotion/react';

import DarkNoise from './dark-noise.jpg';
import LightNoise from './light-noise.jpg';

const commonTheme = {
  fontSizeExtraSmall: '0.85rem',
  fontSizeSmall: '0.92rem',
  fontSizeMedium: '1rem',
  fontSizeLarge: '1.08rem',

  iconSizeSmall: '0.92rem',
  iconSizeMedium: '1.08rem',
  iconSizeLarge: '1.23rem',

  fontWeightMedium: 500,
  fontWeightSemibold: 600,
  fontWeightBold: 700,
  fontFamily: 'Inter, sans-serif',
  lineHeight: '150%',

  spacing: (multiplicator: number) => `${multiplicator * 4}px`,

  table: {
    horizontalCellMargin: '8px',
    checkboxColumnWidth: '32px',
  },

  borderRadius: '4px',

  rightDrawerWidth: '300px',

  lastLayerZIndex: 2147483647,
};

const lightThemeSpecific = {
  noisyBackground: `url(${LightNoise.toString()});`,

  primaryBackground: '#fff',
  secondaryBackground: '#fcfcfc',
  tertiaryBackground: '#f5f5f5',
  quaternaryBackground: '#ebebeb',

  pinkBackground: '#ffe5f4',
  greenBackground: '#e6fff2',
  purpleBackground: '#e0e0ff',
  yellowBackground: '#fff2e7',

  primaryBackgroundTransparent: 'rgba(255, 255, 255, 0.8)',
  secondaryBackgroundTransparent: 'rgba(252, 252, 252, 0.8)',
  strongBackgroundTransparent: 'rgba(0, 0, 0, 0.16)',
  mediumBackgroundTransparent: 'rgba(0, 0, 0, 0.08)',
  lightBackgroundTransparent: 'rgba(0, 0, 0, 0.04)',
  lighterBackgroundTransparent: 'rgba(0, 0, 0, 0.02)',

  primaryBorder: 'rgba(0, 0, 0, 0.08)',
  lightBorder: 'rgba(245, 245, 245, 1)',
  mediumBorder: '#ebebeb',

  clickableElementBackgroundTransition: 'background 0.1s ease',

  text100: '#000',
  text80: '#333333',
  text60: '#666',
  text40: '#999999',
  text30: '#b3b3b3',
  text20: '#cccccc',
  text0: '#fff',

  blue: '#1961ed',
  pink: '#cc0078',
  green: '#1e7e50',
  purple: '#1111b7',
  yellow: '#cc660a',
  red: '#ff2e3f',

  blueHighTransparency: 'rgba(25, 97, 237, 0.03)',
  blueLowTransparency: 'rgba(25, 97, 237, 0.32)',

  boxShadow: '0px 2px 4px 0px #0F0F0F0A',

  modalBoxShadow: '0px 3px 12px rgba(0, 0, 0, 0.09)',
};

const darkThemeSpecific: typeof lightThemeSpecific = {
  noisyBackground: `url(${DarkNoise.toString()});`,
  primaryBackground: '#141414',
  secondaryBackground: '#171717',
  tertiaryBackground: '#1B1B1B',
  quaternaryBackground: '#1D1D1D',

  pinkBackground: '#cc0078',
  greenBackground: '#1e7e50',
  purpleBackground: '#1111b7',
  yellowBackground: '#cc660a',

  primaryBackgroundTransparent: 'rgba(20, 20, 20, 0.8)',
  secondaryBackgroundTransparent: 'rgba(23, 23, 23, 0.8)',
  strongBackgroundTransparent: 'rgba(255, 255, 255, 0.09)',
  mediumBackgroundTransparent: 'rgba(255, 255, 255, 0.06)',
  lightBackgroundTransparent: 'rgba(255, 255, 255, 0.03)',
  lighterBackgroundTransparent: 'rgba(255, 255, 255, 0.02)',

  clickableElementBackgroundTransition: 'background 0.1s ease',

  primaryBorder: 'rgba(255, 255, 255, 0.08)',
  lightBorder: '#222222',
  mediumBorder: '#141414',

  text100: '#ffffff',
  text80: '#cccccc',
  text60: '#999',
  text40: '#666',
  text30: '#4c4c4c',
  text20: '#333333',
  text0: '#000',

  blue: '#6895ec',
  pink: '#ffe5f4',
  green: '#e6fff2',
  purple: '#e0e0ff',
  yellow: '#fff2e7',
  red: '#ff2e3f',

  blueHighTransparency: 'rgba(104, 149, 236, 0.03)',
  blueLowTransparency: 'rgba(104, 149, 236, 0.32)',
  boxShadow: '0px 2px 4px 0px #0F0F0F0A', // TODO change color for dark theme
  modalBoxShadow: '0px 3px 12px rgba(0, 0, 0, 0.09)', // TODO change color for dark theme
};

export const overlayBackground = (props: any) =>
  css`
    backdrop-filter: blur(8px);
    background: ${props.theme.secondaryBackgroundTransparent};
    box-shadow: ${props.theme.modalBoxShadow};
  `;

export const textInputStyle = (props: any) =>
  css`
    background-color: transparent;
    border: none;
    color: ${props.theme.text80};
    outline: none;

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${props.theme.text30};
      font-family: ${props.theme.fontFamily};
      font-weight: ${props.theme.fontWeightMedium};
    }
  `;

export const hoverBackground = (props: any) =>
  css`
    transition: background 0.1s ease;
    &:hover {
      background: ${props.theme.lightBackgroundTransparent};
    }
  `;

export const lightTheme = { ...commonTheme, ...lightThemeSpecific };
export const darkTheme = { ...commonTheme, ...darkThemeSpecific };

export const MOBILE_VIEWPORT = 768;

export type ThemeType = typeof lightTheme;