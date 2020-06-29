import { AchievementsService } from '../../../src/services/achievements';
import { Achievement, LocalAchievementsRepository, AchievementsRepository } from '../../../src/util/achievements';
import { mock, instance, when, verify, reset } from 'ts-mockito';

let mockAchievementsRepository: AchievementsRepository;
let achievementsService: AchievementsService;

beforeAll((): void => {
	mockAchievementsRepository = mock(LocalAchievementsRepository);
	achievementsService = new AchievementsService(instance(mockAchievementsRepository));
});

afterEach((): void => {
	reset(mockAchievementsRepository);
});

/**
 * Achievements tests
 */
describe('AchievementsService tests', (): void => {
	/**
   * Test that all achievements are returned correctly
   */
	describe('Test getAchievements', (): void => {
		test('Should ensure that an empty array is returned when there are no achievements', async (): Promise<void> => {
			when(mockAchievementsRepository.getAll()).thenResolve([]);

			expect(await achievementsService.getAchievements()).toEqual([]);

			verify(mockAchievementsRepository.getAll()).once();
		});
		test('Should ensure that the service returns all achievements from the repository', async (): Promise<void> => {
			const testAchievements: Achievement[] = [
				new Achievement(0, { title: 'test', description: 'teeest', maxProgress: 0, prizeURL: 'tessst.com' }),
				new Achievement(1, { title: 'test2', description: 'teeest', maxProgress: 0, prizeURL: 'tessst.com' })
			];
			when(mockAchievementsRepository.getAll()).thenResolve(testAchievements);

			expect(await achievementsService.getAchievements()).toBe(testAchievements);

			verify(mockAchievementsRepository.getAll()).once();
		});
	});

	/**
   * Test that the correct achievement is returned when a specific id is given
   */
	describe('Test getAchievementWithId', (): void => {
		test('Should ensure that the correct achievement is returned', async (): Promise<void> => {
			const testAchievement = new Achievement(0, { title: 'test', description: 'teeeeest', maxProgress: 0, prizeURL: 'test.com' });

			when(mockAchievementsRepository.findOne(testAchievement.getId())).thenResolve(testAchievement);

			expect(await achievementsService.getAchievementWithId(testAchievement.getId())).toBe(testAchievement);

			verify(mockAchievementsRepository.findOne(testAchievement.getId())).once();
		});

		test("Should ensure that an error is thrown when achievement with given id doesn't exist", async (): Promise<void> => {
			when(mockAchievementsRepository.findOne(0)).thenResolve(undefined);

			try {
				expect(await achievementsService.getAchievementWithId(0)).toThrow();
			} catch (error) {
				expect(error).toBeDefined();
			}

			verify(mockAchievementsRepository.findOne(0)).once();
		});
	});
});
