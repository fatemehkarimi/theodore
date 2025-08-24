import { MutableRefObject, useEffect, useRef } from 'react';

export const useInputProperty = (
  inputRef: MutableRefObject<HTMLDivElement | null>,
) => {
  // const inputStyleRef = useRef<CSSStyleDeclaration | null>(null);
  const inputWidthRef = useRef<number>(0);
  const characterWidth = useRef<number>(0);
  const estimatedChWidth = useRef<number>(0);

  // const setInputStyle = (style: CSSStyleDeclaration) => {
  //   inputStyleRef.current = style;
  // };

  const setInputWidth = (newWidth: number) => {
    inputWidthRef.current = newWidth;
  };

  useEffect(() => {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          inputRef.current != null &&
          mutation.type === 'attributes' &&
          mutation.attributeName === 'style'
        ) {
          const newInputStyle = getComputedStyle(inputRef.current);
          // setInputStyle(newInputStyle);
          const chWidth = measureEstimatedCharacterWidth(newInputStyle);
          estimatedChWidth.current = chWidth;
          console.log('here width = ', chWidth);
        }
      });
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const width = entry.borderBoxSize[0].inlineSize;
          setInputWidth(width);
        }
      }
    });

    if (inputRef.current != null) {
      mutationObserver.observe(inputRef.current, {
        attributes: true,
        attributeFilter: ['style'],
      });

      resizeObserver.observe(inputRef.current);
    }
  }, []);

  return {
    estimatedChWidth: estimatedChWidth.current,
    characterWidth: characterWidth.current,
  };
};

const measureEstimatedCharacterWidth = (style: CSSStyleDeclaration) => {
  const span = document.createElement('span');
  document.body.appendChild(span);
  // Copy relevant style properties from the CSSStyleDeclaration to the span's style
  for (let i = 0; i < style.length; i++) {
    const prop = style[i];
    // @ts-ignore
    span.style[prop] = style.getPropertyValue(prop);
  }
  span.textContent = 'W'; // W is the widest english character
  const width = Math.ceil(span.offsetWidth);
  document.body.removeChild(span);
  return width;
};
