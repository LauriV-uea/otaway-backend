import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/database/client';

export const touristPlaceDb = {
	async getActivePlaces(page: number, pageSize: number) {
		const where = { status: 'ACTIVE' };
		const [places, total] = await Promise.all([
			prisma.touristPlace.findMany({
				where,
				skip: (page - 1) * pageSize,
				take: pageSize,
				orderBy: [{ name: 'asc' }, { id: 'asc' }],
			}),
			prisma.touristPlace.count({ where }),
		]);

		return { places, total };
	},

	getActivePlaceById: (id: string) =>
		prisma.touristPlace.findFirst({ where: { id, status: 'ACTIVE' } }),

	create: (data: Prisma.TouristPlaceCreateInput) => prisma.touristPlace.create({ data }),

	updateById: (id: string, data: Prisma.TouristPlaceUpdateInput) =>
		prisma.touristPlace.update({ where: { id }, data }),

	async deleteById(id: string): Promise<boolean> {
		const result = await prisma.touristPlace.deleteMany({
			where: { id, status: 'ACTIVE' },
		});
		return result.count > 0;
	},
};
