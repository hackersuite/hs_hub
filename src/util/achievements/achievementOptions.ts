/**
 * An interface to store options for a single Achievement
 */
export interface AchievementOptions {
  title: string;
  description: string;
  prizeURL: string;
  maxProgress: number;
  requiresToken?: boolean;
  isManual?: boolean;
  mustCompleteStepsInOrder?: boolean;
}