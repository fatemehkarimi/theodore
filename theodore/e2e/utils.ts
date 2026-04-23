const undoShortcut = (): string =>
  process.platform === 'darwin' ? 'Meta+Z' : 'Control+Z';

export { undoShortcut };
