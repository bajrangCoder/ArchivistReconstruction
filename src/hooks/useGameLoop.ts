import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing the game animation loop.
 * Provides a stable animation frame management with proper cleanup.
 */
export const useGameLoop = (callback: () => void, isRunning: boolean = true) => {
  const requestRef = useRef<number>(0);
  const callbackRef = useRef<() => void>(callback);

  // Keep callback ref up to date without causing effect re-runs
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!isRunning) return;

    const loop = () => {
      callbackRef.current();
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning]);
};
