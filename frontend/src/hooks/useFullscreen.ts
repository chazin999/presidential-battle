import { useCallback, useEffect, useState } from 'react';

/** Controla o modo tela cheia usado durante a transmissão da LIVE. */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const enter = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const exit = useCallback(() => {
    document.exitFullscreen?.().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) exit();
    else enter();
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
