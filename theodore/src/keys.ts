export const HOME = 'Home';
export const END = 'End';
export const ARROW_UP = 'ArrowUp';
export const ARROW_RIGHT = 'ArrowRight';
export const ARROW_DOWN = 'ArrowDown';
export const ARROW_LEFT = 'ArrowLeft';
export const ENTER = 'Enter';
export const DELETE = 'Delete';
export const BACKSPACE = 'Backspace';

export const NavigationKeys = [ARROW_UP, ARROW_RIGHT, ARROW_DOWN, ARROW_LEFT];

export const isOnlyNavigationKey = (event: React.KeyboardEvent) => {
  if (event.ctrlKey || event.shiftKey || event.altKey) return false;
  return NavigationKeys.includes(event.key);
};
