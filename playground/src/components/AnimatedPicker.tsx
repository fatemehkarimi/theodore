import appleEmojisData from '@emoji-mart/data/sets/15/apple.json';
import Picker from '@emoji-mart/react';
import clsx from 'clsx';
import type React from 'react';
import styles from '../App.module.scss';
import { useDelayedValue } from '../hooks/useDelayedValue';
import { useShowTransition } from '../hooks/useShowtransition';

export type PickerEmoji = {
  id: string;
  keywords: string[];
  shortcodes: string;
  name: string;
  native: string;
  unified: string;
};

/* eslint-disable no-unused-vars */
type AnimatedPickerProps = {
  isVisible: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onSelectEmoji?: (emoji: PickerEmoji) => void;
};
/* eslint-enable no-unused-vars */

const AnimatedPicker: React.FC<AnimatedPickerProps> = ({
  isVisible,
  onEnter,
  onLeave,
  onSelectEmoji,
}) => {
  const { shouldRender, transitionClassNames } = useShowTransition(
    {
      open: styles.DesktopAnimationActive,
      notOpen: styles.DesktopAnimationNotActive,
    },
    isVisible,
    200,
  );

  const asyncTransitionClassNames = useDelayedValue<string>(
    transitionClassNames,
    0,
    '',
  );

  if (!shouldRender) return null;

  return (
    <div
      className={clsx(styles.picker, asyncTransitionClassNames)}
      onMouseEnter={isVisible ? onEnter : undefined}
      onMouseLeave={isVisible ? onLeave : undefined}
    >
      <Picker
        data={appleEmojisData}
        set="apple"
        theme="light"
        onEmojiSelect={onSelectEmoji}
        perLine={8}
        emojiSize={28}
      />
    </div>
  );
};

export { AnimatedPicker };
