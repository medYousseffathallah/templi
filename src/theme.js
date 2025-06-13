// Templi Theme Configuration

// Color Palette - Tinder-Inspired
export const colors = {
  // Primary colors
  primary: {
    main: '#FF5864', // Primary Accent (Coral/Salmon)
    light: '#FF7B85', // Lighter shade of coral
    dark: '#E94057', // Darker shade for hover states
  },
  // Secondary accent (used sparingly)
  secondary: {
    main: '#2CA8E2', // Light Blue for subtle UI elements
    light: '#4FB8E9', // Lighter shade
    dark: '#1A97D4', // Darker shade
  },
  // Background colors
  background: {
    default: '#F5F5F5', // Main content background (Off-White)
    paper: '#FFFFFF', // Surface/Card Backgrounds (White)
    sidebar: '#E0E0E0', // Sidebar Background (Light Gray)
  },
  // Text colors
  text: {
    primary: '#333333', // Dark grey for main body text, headings
    secondary: '#999999', // Mid-grey for descriptions, small labels, inactive states
  },
  // Status colors
  status: {
    error: '#E74C3C', // Standard red for critical feedback
    warning: '#F39C12', // Orange/Gold for warnings and premium features
    success: '#2ECC71', // Green for success messages
    info: '#2CA8E2', // Light blue for informational messages
  },
  // Action colors
  action: {
    like: '#FF5864', // Coral for like actions
    dislike: '#E74C3C', // Red for dislike actions
    favorite: '#F39C12', // Gold for favorite/star actions
  },
};

// Typography
export const typography = {
  fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", sans-serif',
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
  h1: {
    fontSize: '2.5rem', // 40px
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem', // 32px
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: '1.5rem', // 24px
    fontWeight: 700,
    lineHeight: 1.2,
  },
  body1: {
    fontSize: '1rem', // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  button: {
    fontSize: '0.875rem', // 14px
    fontWeight: 600,
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: 1.5,
  },
};

// Spacing
export const spacing = {
  unit: 8, // Base spacing unit in pixels
};

// Shadows
export const shadows = {
  card: '0px 8px 24px rgba(0, 0, 0, 0.1)',
  button: '0px 2px 8px rgba(0, 0, 0, 0.15)',
  dropdown: '0px 4px 12px rgba(0, 0, 0, 0.1)',
};

// Border Radius
export const borderRadius = {
  small: '4px',
  medium: '8px',
  large: '16px',
  circle: '50%',
};

// Transitions
export const transitions = {
  default: 'all 0.3s ease',
  fast: 'all 0.15s ease',
  slow: 'all 0.5s ease',
};

// Z-index
export const zIndex = {
  header: 100,
  sidebar: 100,
  modal: 1000,
  tooltip: 1500,
};

export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  zIndex,
};