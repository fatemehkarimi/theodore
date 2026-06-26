import { useRef } from 'react';

const useLatestValue = <T>(value: T) => {
  const ref = useRef(value);
  ref.current = value;
  //   useEffect(() => {
  //     ref.current = value;
  //   }, [value]);
  //   return ref;
};

export { useLatestValue };
