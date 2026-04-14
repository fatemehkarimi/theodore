const HOME = 'Home';
const END = 'End';
const ARROW_UP = 'ArrowUp';
const ARROW_RIGHT = 'ArrowRight';
const ARROW_DOWN = 'ArrowDown';
const ARROW_LEFT = 'ArrowLeft';
const ENTER = 'Enter';
const DELETE = 'Delete';
const BACKSPACE = 'Backspace';
const TAB = 'Tab';
const SPACE = ' ';

const NavigationKeys = [ARROW_UP, ARROW_RIGHT, ARROW_DOWN, ARROW_LEFT];

const isOnlyNavigationKey = (event: React.KeyboardEvent) => {
  if (event.ctrlKey || event.shiftKey || event.altKey) return false;
  return NavigationKeys.includes(event.key);
};

export {
  HOME,
  END,
  ARROW_UP,
  ARROW_RIGHT,
  ARROW_DOWN,
  ARROW_LEFT,
  ENTER,
  DELETE,
  BACKSPACE,
  TAB,
  SPACE,
  NavigationKeys,
  isOnlyNavigationKey,
};
