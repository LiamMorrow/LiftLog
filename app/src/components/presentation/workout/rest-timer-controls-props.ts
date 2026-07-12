export interface RestTimerControlsProps {
  paused: boolean;
  onRestart: () => void;
  onTogglePause: () => void;
  onDismiss: () => void;
}

export const restControlIconSize = 20;
