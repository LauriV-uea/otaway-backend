import { describe, expect, it } from 'vitest';

import {
	createTouristPlaceSchema,
	touristPlaceParamsSchema,
	touristPlaceQuerySchema,
	updateTouristPlaceSchema,
} from './tourist-place.validation';

describe('tourist place validation', () => {
	it('accepts a place using only fields persisted by the existing model', () => {
		expect(
			createTouristPlaceSchema.safeParse({
				name: 'Cascada de Peguche',
				description: 'Una cascada de Otavalo.',
				location: 'Peguche',
				imageUrl: 'https://example.org/cascada.jpg',
			}).success,
		).toBe(true);
	});

	it('rejects blank names, invalid image URLs and unknown fields', () => {
		expect(createTouristPlaceSchema.safeParse({ name: '  ' }).success).toBe(false);
		expect(
			createTouristPlaceSchema.safeParse({ name: 'Lugar', imageUrl: 'javascript:alert(1)' })
				.success,
		).toBe(false);
		expect(
			createTouristPlaceSchema.safeParse({ name: 'Lugar', category: 'Naturaleza' }).success,
		).toBe(false);
	});

	it('requires at least one editable field for PATCH', () => {
		expect(updateTouristPlaceSchema.safeParse({}).success).toBe(false);
		expect(updateTouristPlaceSchema.safeParse({ name: 'Mirador' }).success).toBe(true);
	});

	it('applies safe pagination defaults and rejects an invalid UUID', () => {
		expect(touristPlaceQuerySchema.parse({})).toEqual({ page: 1, pageSize: 100 });
		expect(touristPlaceParamsSchema.safeParse({ placeId: 'not-a-uuid' }).success).toBe(false);
	});
});
