import { Cache, Cacheable } from '../../../../src/util/cache';

class MockCacheableA implements Cacheable {
	id: number;
	expiresIn = 100;
	syncedAt: number;
	testA: string;

	constructor(id: number, testA: string) {
		this.id = id;
		this.testA = testA;
		this.syncedAt = Date.now();
	}
}

class MockCacheableB implements Cacheable {
	id: number;
	expiresIn = 100;
	syncedAt: number;
	testB: number;

	constructor(id: number, testB: number) {
		this.id = id;
		this.testB = testB;
		this.syncedAt = Date.now();
	}
}

let itemsClassA: MockCacheableA[];
let itemsClassB: MockCacheableB[];
let sampleItemsCollection: Map<string, Map<number, Cacheable>>;

describe('Cache tests', (): void => {
	beforeEach((): void => {
		sampleItemsCollection = new Map<string, Map<number, Cacheable>>();
		sampleItemsCollection.set(MockCacheableA.name, new Map<number, Cacheable>());
		sampleItemsCollection.set(MockCacheableB.name, new Map<number, Cacheable>());

		const collectionA: Map<number, Cacheable> = sampleItemsCollection.get(MockCacheableA.name);
		const collectionB: Map<number, Cacheable> = sampleItemsCollection.get(MockCacheableB.name);

		itemsClassA = [
			new MockCacheableA(0, 'obj 1 class A'),
			new MockCacheableA(1, 'obj 2 class A')
		];

		itemsClassB = [
			new MockCacheableB(0, 1),
			new MockCacheableB(1, 100)
		];

		itemsClassA.forEach((obj: MockCacheableA) => {
			collectionA.set(obj.id, obj);
		});
		itemsClassB.forEach((obj: MockCacheableB) => {
			collectionB.set(obj.id, obj);
		});
	});

	test('get should return the expected item', (): void => {
		const cache: Cache = new Cache(sampleItemsCollection);

		itemsClassA.forEach((obj: MockCacheableA) => {
			expect(cache.get(MockCacheableA.name, obj.id)).toEqual(obj);
		});

		itemsClassB.forEach((obj: MockCacheableB) => {
			expect(cache.get(MockCacheableB.name, obj.id)).toEqual(obj);
		});
	});

	test('get should return undefined when the cache is empty', (): void => {
		const cache: Cache = new Cache();

		expect(cache.get(MockCacheableA.name, itemsClassA[0].id)).toEqual(undefined);
	});

	test('getAll should return the expected items', (): void => {
		const cache: Cache = new Cache(sampleItemsCollection);

		const returnedACollection: MockCacheableA[] = cache.getAll(MockCacheableA.name);
		expect(returnedACollection).toEqual(itemsClassA);

		const returnedBCollection: MockCacheableB[] = cache.getAll(MockCacheableB.name);
		expect(returnedBCollection).toEqual(itemsClassB);
	});

	test('set should add the given item to the cache', (): void => {
		const cache: Cache = new Cache(sampleItemsCollection);

		itemsClassA.push(new MockCacheableA(2, 'test'));
		cache.set(MockCacheableA.name, itemsClassA[itemsClassA.length - 1]);

		expect(cache.get(MockCacheableA.name, itemsClassA[itemsClassA.length - 1].id)).toEqual(itemsClassA[itemsClassA.length - 1]);
	});

	test('set should not affect other collections', (): void => {
		const cache: Cache = new Cache(sampleItemsCollection);

		itemsClassA.push(new MockCacheableA(2, 'test'));
		cache.set(MockCacheableA.name, itemsClassA[itemsClassA.length - 1]);

		expect(cache.getAll(MockCacheableB.name)).toEqual(itemsClassB);
	});

	test('set should create new collection in empty cache', (): void => {
		const cache: Cache = new Cache();

		itemsClassA.push(new MockCacheableA(2, 'test'));
		cache.set(MockCacheableA.name, itemsClassA[0]);

		expect(cache.get(MockCacheableA.name, itemsClassA[0].id)).toEqual(itemsClassA[0]);
	});

	test('setAll should add all elements in an array to the cache', (): void => {
		const cache: Cache = new Cache(sampleItemsCollection);

		itemsClassA.push(new MockCacheableA(2, 'test'));
		itemsClassA.push(new MockCacheableA(3, 'test'));
		cache.setAll(MockCacheableA.name, itemsClassA);

		expect(cache.getAll(MockCacheableA.name)).toEqual(itemsClassA);
	});

	test('setAll should create a new collection in an empty cache', (): void => {
		const cache: Cache = new Cache();

		cache.setAll(MockCacheableA.name, itemsClassA);

		expect(cache.getAll(MockCacheableA.name)).toEqual(itemsClassA);
	});

	test('setAll should not affect other collections in the cache', (): void => {
		sampleItemsCollection.delete(MockCacheableA.name);
		const cache: Cache = new Cache(sampleItemsCollection);

		cache.setAll(MockCacheableA.name, itemsClassA);

		expect(cache.getAll(MockCacheableB.name)).toEqual(itemsClassB);
	});

	test('delete should delete the required item from the cache', (): void => {
		const cache: Cache = new Cache(sampleItemsCollection);

		cache.delete(MockCacheableA.name, itemsClassA[0].id);

		// Removing the first element in the array
		itemsClassA = itemsClassA.slice(1);

		expect(cache.getAll(MockCacheableA.name)).toEqual(itemsClassA);
		expect(cache.getAll(MockCacheableB.name)).toEqual(itemsClassB);
	});

	test('delete should not throw error when trying to delete an item in a non-existant collection', (): void => {
		const cache: Cache = new Cache();

		expect(cache.delete(MockCacheableA.name, itemsClassA[0].id)).toEqual(undefined);
	});

	test('deleteAll should delete all items in a collection', (): void => {
		const cache: Cache = new Cache(sampleItemsCollection);

		cache.deleteAll(MockCacheableA.name);

		expect(cache.getAll(MockCacheableA.name)).toEqual([]);
	});

	test('deleteAll should only affect one collection', (): void => {
		const cache: Cache = new Cache(sampleItemsCollection);

		cache.deleteAll(MockCacheableA.name);

		expect(cache.getAll(MockCacheableB.name)).toEqual(itemsClassB);
	});

	test('get should not return expired element', (): void => {
		const cache: Cache = new Cache();
		const expiredElement: MockCacheableA = new MockCacheableA(0, 'test');

		expiredElement.expiresIn = 0;
		cache.set(MockCacheableA.name, expiredElement);

		expect(cache.get(MockCacheableA.name, expiredElement.id)).toEqual(undefined);
	});

	test('getAll should only return elements that are not expired', (): void => {
		itemsClassA[0].expiresIn = 0;
		const cache: Cache = new Cache(sampleItemsCollection);

		itemsClassA = itemsClassA.splice(1);

		expect(cache.getAll(MockCacheableA.name)).toEqual(itemsClassA);
	});

	test('element with negative expiresIn should not expire', (): void => {
		const cache: Cache = new Cache();
		const element: MockCacheableA = new MockCacheableA(0, 'test');

		element.expiresIn = -1;
		cache.set(MockCacheableA.name, element);

		expect(cache.get(MockCacheableA.name, element.id)).toEqual(element);
	});
});
