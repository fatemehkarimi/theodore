import { SuggestionHintProps } from 'theodore-js';

const FancyTab: React.FC<SuggestionHintProps> = () => {
  return (
    <svg
      width={40}
      height={20}
      viewBox="0 0 40 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={0.75}
        y={0.75}
        width={38.5}
        height={18.5}
        rx={5}
        fill="white"
        stroke="#CBD5E1"
        strokeWidth={1.5}
      />

      <text
        x={20}
        y={13.2}
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontSize={9}
        fontWeight={700}
        letterSpacing={0.4}
        fill="#1E293B"
      >
        Tab
      </text>
    </svg>
  );
};

export { FancyTab };
