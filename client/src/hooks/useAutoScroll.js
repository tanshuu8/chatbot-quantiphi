import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook to automatically scroll container to bottom when messages or stream change,
 * but respect user's manual scroll position if they scroll up to read history.
 */
export function useAutoScroll(dependencies = []) {
  const containerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // If within 100px from the bottom, keep auto-scrolling
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom('smooth');
    }
  }, [...dependencies, shouldAutoScroll, scrollToBottom]);

  return { containerRef, handleScroll, scrollToBottom, shouldAutoScroll };
}
