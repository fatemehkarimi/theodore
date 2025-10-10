import clsx from 'clsx';
import { useEffect, useRef, useState, useCallback } from 'react';

const CLOSE_DURATION = 350;

export const useShowTransition = (
  tClassNames: {
    shown?: string;
    notShown?: string;
    open?: string;
    notOpen?: string;
  },
  isOpen = false,
  closeDuration: number = CLOSE_DURATION,
) => {
  const [isClosed, setIsClosed] = useState<boolean>(!isOpen);
  const [hasOpenClassName, setHasOpenClassName] = useState<boolean>(isOpen);
  const closeTimerRef = useRef<NodeJS.Timeout | undefined>();

  const closeHandler = useCallback(() => {
    closeTimerRef.current = undefined;
    setIsClosed(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsClosed(false);
      setHasOpenClassName(true);
    } else setHasOpenClassName(false);
  }, [isOpen]);

  if (isOpen) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  } else if (!isClosed && !closeTimerRef.current)
    closeTimerRef.current = setTimeout(closeHandler, closeDuration);

  const isClosing = Boolean(closeTimerRef.current);
  const shouldRender = isOpen || isClosing;

  const transitionClassNames = clsx({
    ...(tClassNames.shown && { [tClassNames.shown]: shouldRender }),
    ...(tClassNames.notShown && { [tClassNames.notShown]: !shouldRender }),
    ...(tClassNames.open && { [tClassNames.open]: hasOpenClassName }),
    ...(tClassNames.notOpen && { [tClassNames.notOpen]: !hasOpenClassName }),
  });

  return {
    shouldRender,
    transitionClassNames,
  };
};
