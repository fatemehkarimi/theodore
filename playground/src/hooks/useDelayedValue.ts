import { useEffect, useRef, useState } from 'react';

interface ShouldNotDelayPredicate<T> {
  (value: T): boolean;
}

const useDelayedValue = <T>(
  state: T,
  time: number,
  initialValue: T,
  shouldNotDelayPredicate?: ShouldNotDelayPredicate<T>,
) => {
  const [delayedState, setDelayedState] = useState<T>(initialValue);
  const id = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const cleanUp = () => {
      clearTimeout(id.current);
    };

    clearTimeout(id.current);
    if (shouldNotDelayPredicate?.(state)) {
      setDelayedState(state);
      return cleanUp();
    }

    id.current = setTimeout(() => {
      setDelayedState(state);
      id.current = undefined;
    }, time);

    return cleanUp;
  }, [state]);

  return delayedState;
};

export { useDelayedValue };
