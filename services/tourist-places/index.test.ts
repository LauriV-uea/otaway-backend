import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getActivePlaces: vi.fn(),
	getActivePlaceById: vi.fn(),
	create: vi.fn(),
	updateById: vi.fn(),
	deleteById: vi.fn(),
}));

vi.mock('@/database/tourist-places/tourist-place.db', () => ({
	touristPlaceDb: mocks,
}));

import { NotFoundError } from '@/errors';
import { touristPlaceService } from './index';

describe('touristPlaceService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getActivePlaces.mockResolvedValue({ places: [], total: 0 });
		mocks.getActivePlaceById.mockResolvedValue({ id: 'place-id' });
		mocks.create.mockResolvedValue({ id: 'place-id' });
		mocks.updateById.mockResolvedValue({ id: 'place-id' });
		mocks.deleteById.mockResolvedValue(true);
	});

	it('returns paginated data from the database layer', async () => {
		const result = await touristPlaceService.getAll({ page: 1, pageSize: 20 });

		expect(result).toEqual({
			places: [],
			meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
		});
	});

	it('normalizes optional empty fields before creating a record', async () => {
		await touristPlaceService.create({
			name: '  Plaza  ',
			description: '  ',
			location: null,
			imageUrl: '',
		});

		expect(mocks.create).toHaveBeenCalledWith({
			name: '  Plaza  ',
			description: null,
			location: null,
			imageUrl: null,
		});
	});

	it('does not update or delete an inactive or missing record', async () => {
		mocks.getActivePlaceById.mockResolvedValue(null);

		await expect(
			touristPlaceService.update('place-id', { name: 'Nuevo nombre' }),
		).rejects.toBeInstanceOf(NotFoundError);
		await expect(touristPlaceService.delete('place-id')).rejects.toBeInstanceOf(NotFoundError);
		expect(mocks.updateById).not.toHaveBeenCalled();
		expect(mocks.deleteById).not.toHaveBeenCalled();
	});
});
