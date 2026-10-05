import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();

const touristPlaceFields = {
	name: z.string().trim().min(1).max(150),
	description: optionalText(5000),
	location: optionalText(255),
	imageUrl: z
		.union([
			z
				.string()
				.url()
				.max(500)
				.refine(value => value.startsWith('https://')),
			z.literal(''),
			z.null(),
		])
		.optional(),
};

export const createTouristPlaceSchema = z.object(touristPlaceFields).strict();

export const updateTouristPlaceSchema = z
	.object({
		name: touristPlaceFields.name.optional(),
		description: touristPlaceFields.description,
		location: touristPlaceFields.location,
		imageUrl: touristPlaceFields.imageUrl,
	})
	.strict()
	.refine(value => Object.values(value).some(field => field !== undefined), {
		message: 'Debes enviar al menos un campo editable.',
	});

export const touristPlaceQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),
		pageSize: z.coerce.number().int().min(1).max(100).default(100),
	})
	.strict();

export const touristPlaceParamsSchema = z
	.object({
		placeId: z.string().uuid('El identificador del lugar no es válido.'),
	})
	.strict();

export type CreateTouristPlaceBody = z.infer<typeof createTouristPlaceSchema>;
export type UpdateTouristPlaceBody = z.infer<typeof updateTouristPlaceSchema>;
export type TouristPlaceQuery = z.infer<typeof touristPlaceQuerySchema>;
export type TouristPlaceParams = z.infer<typeof touristPlaceParamsSchema>;
