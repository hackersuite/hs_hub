import { AchievementOptions } from "./";

/**
 * An array of hard-coded achievements to be loaded to a in-memory store
 */
export const localAchievements: AchievementOptions[] = [
  {
    title: "George the curious",
    description: "Went to all the workshops",
    prizeURL: "/img/achievements/push.png",
    maxProgress: 3,
    requiresToken: true
  },
  {
    title: "Big Mouth",
    description: "Most active communicating with other people via Slack",
    prizeURL: "/img/achievements/bart.png",
    maxProgress: 1,
    isManual: true
  },
  {
    title: "Looney Toons",
    description: "Project with the most cartoon puns",
    prizeURL: "/img/achievements/looneytoones.png",
    maxProgress: 1,
    isManual: true
  },
  {
    title: "Elmer Fudd",
    description: "Completed the treasure hunt",
    prizeURL: "/img/achievements/perry.png",
    maxProgress: 10,
    requiresToken: true
  },
  {
    title: "Courage the cowardly dog",
    description: "Demoed a hack",
    prizeURL: "/img/achievements/any.png",
    maxProgress: 1,
    isManual: true
  },
  {
    title: "The Flintstones",
    description: "The most retro looking hack",
    prizeURL: "/img/achievements/pinkpanther.png",
    maxProgress: 1,
    isManual: true
  },
  {
    title: "Samurai Jack",
    description: "Hacked solo",
    prizeURL: "/img/achievements/tmnt.png",
    maxProgress: 1,
    isManual: true
  },
  {
    title: "Johnny Bravo",
    description: "Appeared most at the photo booth",
    prizeURL: "/img/achievements/comic3.png",
    maxProgress: 1,
    isManual: true
  },
  {
    title: "Yoda",
    description: "Spent the most time in the Zen room",
    prizeURL: "/img/achievements/stitch.png",
    maxProgress: 1,
    isManual: true
  },
  {
    title: "Dexter’s Laboratory",
    description: "Used a hardware piece in an imaginative way",
    prizeURL: "/img/achievements/dexter.png",
    maxProgress: 1,
    isManual: true
  },
  {
    title: "Adventure time",
    description: "Travelled from furthest away for the hackathon",
    prizeURL: "/img/achievements/buzz.png",
    maxProgress: 1,
    isManual: true
  },
  {
    title: "Scooby doo",
    description: "Took part in midnight mafia and won",
    prizeURL: "/img/achievements/stitchBlue.png",
    maxProgress: 1,
    isManual: true
  }
];