/**
 * Throttle function
 *
 * @param func
 * @param wait
 * @param options
 */
export function throttle(func: (...args: any[]) => void, wait: number, options: { trailing: boolean } = { trailing: true }) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;
  let lastCallTime: number | null = null;

  const invokeFunc = () => {
    if (lastArgs !== null) {
      func(...lastArgs);
      lastArgs = null;
      lastCallTime = Date.now();
    }
  };

  const throttled = function (this: any, ...args: any[]) {
    const now = Date.now();
    if (lastCallTime === null) {
      lastCallTime = now;
    }

    const remainingTime = wait - (now - lastCallTime);

    lastArgs = args;

    if (remainingTime <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      invokeFunc();
    } else if (!timeout && options.trailing) {
      timeout = setTimeout(invokeFunc, remainingTime);
    }
  };

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastArgs = null;
    lastCallTime = null;
  };

  return throttled;
}
