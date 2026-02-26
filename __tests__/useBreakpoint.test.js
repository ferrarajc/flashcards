import { renderHook } from '@testing-library/react-native';
import { useBreakpoint, BREAKPOINTS } from '../hooks/useBreakpoint';

// Mock useWindowDimensions so we can control the reported width in each test
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.useWindowDimensions = jest.fn();
  return rn;
});

import { useWindowDimensions } from 'react-native';

describe('BREAKPOINTS constants', () => {
  it('phone breakpoint is 600', () => {
    expect(BREAKPOINTS.phone).toBe(600);
  });

  it('tablet breakpoint is 1024', () => {
    expect(BREAKPOINTS.tablet).toBe(1024);
  });
});

describe('useBreakpoint', () => {
  describe('phone (width < 600)', () => {
    beforeEach(() => {
      useWindowDimensions.mockReturnValue({ width: 390, height: 844 });
    });

    it('sets isPhone true', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isPhone).toBe(true);
    });

    it('sets isTablet false', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isTablet).toBe(false);
    });

    it('sets isDesktop false', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isDesktop).toBe(false);
    });

    it('returns the width', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.width).toBe(390);
    });
  });

  describe('tablet (600 ≤ width < 1024)', () => {
    beforeEach(() => {
      useWindowDimensions.mockReturnValue({ width: 800, height: 1024 });
    });

    it('sets isTablet true', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isTablet).toBe(true);
    });

    it('sets isPhone false', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isPhone).toBe(false);
    });

    it('sets isDesktop false', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isDesktop).toBe(false);
    });
  });

  describe('desktop (width ≥ 1024)', () => {
    beforeEach(() => {
      useWindowDimensions.mockReturnValue({ width: 1280, height: 800 });
    });

    it('sets isDesktop true', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isDesktop).toBe(true);
    });

    it('sets isPhone false', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isPhone).toBe(false);
    });

    it('sets isTablet false', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isTablet).toBe(false);
    });
  });

  describe('boundary values', () => {
    it('width exactly 600 is tablet, not phone', () => {
      useWindowDimensions.mockReturnValue({ width: 600, height: 900 });
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isPhone).toBe(false);
      expect(result.current.isTablet).toBe(true);
    });

    it('width exactly 1024 is desktop, not tablet', () => {
      useWindowDimensions.mockReturnValue({ width: 1024, height: 768 });
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });

    it('width 599 is phone', () => {
      useWindowDimensions.mockReturnValue({ width: 599, height: 900 });
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isPhone).toBe(true);
    });
  });
});
