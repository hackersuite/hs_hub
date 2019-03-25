import { AchievementOptions } from "./";

/**
 * An array of hard-coded achievements to be loaded to a in-memory store
 */
export const localAchievements: AchievementOptions[] = [
  {
    title: "Sample",
    description: "some cool description",
    prizeURL: "http://placekitten.com/200/300",
    maxProgress: 1
  },
  {
    title: "Sample manual",
    description: "some cool description",
    prizeURL: "http://placekitten.com/200/300",
    maxProgress: 1,
    isManual: true
  },
  {
    title: "Sample with token",
    description: "some cool description",
    prizeURL: "http://placekitten.com/200/300",
    maxProgress: 1,
    requiresToken: true
  },
  {
    title: "Sample multi-step",
    description: "some cool description",
    prizeURL: "http://placekitten.com/200/300",
    maxProgress: 2
  },
  {
    title: "Sample multi-step with ordered step",
    description: "some cool description",
    prizeURL: "http://placekitten.com/200/300",
    maxProgress: 2,
    mustCompleteStepsInOrder: true
  },
];