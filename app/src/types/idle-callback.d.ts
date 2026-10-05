/** React Native installs these globally (`Libraries/Core/setUpTimers.js`), but does not declare them. */
interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): number;
}

declare function requestIdleCallback(
  callback: (deadline: IdleDeadline) => void,
  options?: { timeout?: number },
): number;

declare function cancelIdleCallback(handle: number): void;
