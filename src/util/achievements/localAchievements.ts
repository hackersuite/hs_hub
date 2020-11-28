import { AchievementOptions } from './';

/**
 * An array of hard-coded achievements to be loaded to a in-memory store
 */
export const localAchievements: AchievementOptions[] = [
	{
		title: 'Bridge between worlds',
		description: 'Attend all workshops',
		maxProgress: 1,
		prizeURL: '/img/achievements/attendAllWorkshopsSquare.png',
		isManual: true
	},
	{
		title: 'Wan Shi Tong’s Library',
		description: 'Scavenger hunt/trivia quiz questions - get all the questions right or winner of the game',
		maxProgress: 1,
		prizeURL: '/img/achievements/triviaSquare.png',
		isManual: true
	},
	{
		title: 'The Last Codebender',
		description: 'Solo hacking',
		maxProgress: 1,
		prizeURL: '/img/achievements/Hacker.png',
		isManual: true
	},
	{
		title: "Snoozles",
		description: 'Secret condition, will be revealed at the end of the hackathon',
		maxProgress: 1,
		prizeURL: '/img/achievements/sleeplogh.png',
		isManual: true
	},
	{
		title: 'Balance restored',
		description: 'Submitted a project',
		maxProgress: 1,
		prizeURL: '/img/achievements/checkMark.png',
		isManual: true
	},
	{
		title: "Team Avatar",
		description: 'Demoed a project',
		maxProgress: 1,
		prizeURL: '/img/achievements/AANG.png',
		isManual: true
	},
	{
		title: "The First Wordbender",
		description: 'Tweet about your experience during the hackathon and use one of our hashtags #guh #guh2020 #greatunihack. Message @Caitlin on Discord with a link to your tweet to claim the reward',
		maxProgress: 1,
		prizeURL: '/img/achievements/messengerHawk.png',
		isManual: true
	},
	{
		title: "Cabbage Man",
		description: 'Successfully complete the food challenge',
		maxProgress: 1,
		prizeURL: '/img/achievements/cabbageMan.png',
		isManual: true
	}
];
