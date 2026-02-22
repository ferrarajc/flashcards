import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  phone: 600,
  tablet: 1024,
};

export function useBreakpoint() {
  const { width } = useWindowDimensions();

  const isPhone = width < BREAKPOINTS.phone;
  const isTablet = width >= BREAKPOINTS.phone && width < BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.tablet;

  return { width, isPhone, isTablet, isDesktop };
}
