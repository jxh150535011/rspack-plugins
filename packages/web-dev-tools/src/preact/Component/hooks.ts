import { useState, useRef, useLayoutEffect } from 'preact/hooks';

export const useSize = () => {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      setSize({
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      });
    }
  }, [ref]);

  return {
    ref,
    size,
  }
}