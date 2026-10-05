import type { Prisma } from '@/generated/prisma/client';
import { NotFoundError } from '@/errors';
import { normalizePagination } from '@/helper/pagination';
import { touristPlaceDb } from '@/database/tourist-places/tourist-place.db';
import type {
	CreateTouristPlaceBody,
	TouristPlaceQuery,
	UpdateTouristPlaceBody,
} from '@/validations/tourist-places/tourist-place.validation';

const normalizeNullableText = (value: string | null): string | null => value?.trim() || null;

export const touristPlaceService = {
	async getAll(query: TouristPlaceQuery) {
		const pagination = normalizePagination(query);
		const result = await touristPlaceDb.getActivePlaces(query.page, query.pageSize);

		return {
			places: result.places,
			meta: pagination.meta(result.total),
		};
	},

	async getById(id: string) {
		const place = await touristPlaceDb.getActivePlaceById(id);
		if (!place) throw new NotFoundError('El lugar turístico solicitado no existe.');
		return place;
	},

	create(body: CreateTouristPlaceBody) {
		const data: Prisma.TouristPlaceCreateInput = {
			name: body.name,
			description: normalizeNullableText(body.description ?? null),
			location: normalizeNullableText(body.location ?? null),
			imageUrl: normalizeNullableText(body.imageUrl ?? null),
		};

		return touristPlaceDb.create(data);
	},

	async update(id: string, body: UpdateTouristPlaceBody) {
		await this.getById(id);
		const data: Prisma.TouristPlaceUpdateInput = {};

		if (body.name !== undefined) data.name = body.name;
		if (body.description !== undefined) {
			data.description = normalizeNullableText(body.description);
		}
		if (body.location !== undefined) {
			data.location = normalizeNullableText(body.location);
		}
		if (body.imageUrl !== undefined) {
			data.imageUrl = normalizeNullableText(body.imageUrl);
		}

		return touristPlaceDb.updateById(id, data);
	},

	async delete(id: string): Promise<void> {
		await this.getById(id);
		const deleted = await touristPlaceDb.deleteById(id);
		if (!deleted) throw new NotFoundError('El lugar turístico solicitado no existe.');
	},
};
