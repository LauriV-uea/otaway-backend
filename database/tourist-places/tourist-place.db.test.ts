import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	findMany: vi.fn(),
	count: vi.fn(),
	findFirst: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deleteMany: vi.fn(),
}));

vi.mock('@/database/client', () => ({
	prisma: {
		touristPlace: {
			findMany: mocks.findMany,
			count: mocks.count,
			findFirst: mocks.findFirst,
			create: mocks.create,
			update: mocks.update,
			deleteMany: mocks.deleteMany,
		},
	},
}));

import { touristPlaceDb } from './tourist-place.db';

describe('touristPlaceDb', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
		mocks.count.mockResolvedValue(0);
		mocks.deleteMany.mockResolvedValue({ count: 0 });
	});

	it('paginates active places in a stable name order', async () => {
		await touristPlaceDb.getActivePlaces(2, 10);

		expect(mocks.findMany).toHaveBeenCalledWith({
			where: { status: 'ACTIVE' },
			skip: 10,
			take: 10,
			orderBy: [{ name: 'asc' }, { id: 'asc' }],
		});
		expect(mocks.count).toHaveBeenCalledWith({ where: { status: 'ACTIVE' } });
	});

	it('only returns active records for public detail reads', async () => {
		await touristPlaceDb.getActivePlaceById('place-id');

		expect(mocks.findFirst).toHaveBeenCalledWith({
			where: { id: 'place-id', status: 'ACTIVE' },
		});
	});

	it('reports whether an active record was deleted', async () => {
		mocks.deleteMany.mockResolvedValue({ count: 1 });

		await expect(touristPlaceDb.deleteById('place-id')).resolves.toBe(true);
		expect(mocks.deleteMany).toHaveBeenCalledWith({
			where: { id: 'place-id', status: 'ACTIVE' },
		});
	});
});
