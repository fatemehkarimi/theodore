import React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

const Send: React.FC<Props & { size?: number; color?: string }> = (props) => {
  const { size, color = 'currentColor', ...rest } = props;

  return (
    <svg
      width={size ?? 22}
      height={size ?? 22}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        d="M21.7 3.3 2.9 10.9c-.9.4-.9 1.7.1 2l4.8 1.5 1.8 5.6c.3.9 1.5 1.1 2 .3l2.7-3.5 4.8 3.5c.8.6 2 .1 2.1-.9l2-14.9c.2-.9-.8-1.6-1.5-1.2ZM9.2 13.8l9.2-6.6-7 8.6-.4 2.4-1.8-4.4Z"
        fill={color}
      />
    </svg>
  );
};

export default Send;
