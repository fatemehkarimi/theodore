export const isMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check user agent for mobile device patterns
  const mobileUserAgentPattern =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const userAgentMatch = mobileUserAgentPattern.test(navigator.userAgent);
  return userAgentMatch;
};
