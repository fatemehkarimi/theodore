// import { BASE_URL, IS_PACKAGED_ELECTRON } from '../../../../config';
// import type { TeactNode } from '../../../../lib/teact/teact';
// import buildClassName from '../../../../util/buildClassName';
// import {
//   handleEmojiLoad,
//   LOADED_EMOJIS,
//   nativeToUnifiedExtendedWithCache,
// } from '../../../../util/emoji/emoji';

import { ReactNode } from 'react';

export function renderEmoji(
  emoji: string,
  size: 'big' | 'small',
  nodeIndex: number,
  key: string,
): ReactNode {
  return <span>hello</span>;
  // if (IS_EMOJI_SUPPORTED) {
  //   return emoji;
  // }

  // const code = nativeToUnifiedExtendedWithCache(emoji);
  // if (!code) {
  //   return <></>;
  // } else {
  //   const baseSrcUrl = IS_PACKAGED_ELECTRON ? BASE_URL : '.';
  //   const src = `${baseSrcUrl}/img-apple-${
  //     size === 'big' ? '160' : '64'
  //   }/${code}.png`;
  //   const className = buildClassName(
  //     'emoji',
  //     size === 'small' && 'emoji-small',
  //   );

  //   const isLoaded = LOADED_EMOJIS.has(src);

  //   return (
  //     <span
  //       contentEditable="false"
  //       style="display: inline-block;"
  //       data-node-index={nodeIndex}
  //       key={key}
  //     >
  //       <img
  //         src={src}
  //         className={`${className}${
  //           !isLoaded ? ' opacity-transition slow shown' : ''
  //         }`}
  //         style="user-select: none;"
  //         alt={emoji}
  //         data-path={src}
  //         draggable={false}
  //         onLoad={!isLoaded ? handleEmojiLoad : undefined}
  //       />
  //     </span>
  //   );
  // }
}
