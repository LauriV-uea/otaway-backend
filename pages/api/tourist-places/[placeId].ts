import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { AuthenticationError } from '@/errors';
import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { routerOptions } from '@/lib/api/router-config';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { touristPlaceService } from '@/services/tourist-places';
import { touristPlaceParamsSchema, updateTouristPlaceSchema } from '@/validations/tourist-places';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.get(async (req, res): Promise<void> => {
		const parsed = touristPlaceParamsSchema.safeParse(req.query);
		throwValidationError(parsed);

		const place = await touristPlaceService.getById(parsed.data.placeId);
		res.status(200).json({ data: place });
	})
	.patch(auth, access('tourist-places.manage'), async (req, res): Promise<void> => {
		if (!req.user) throw new AuthenticationError();
		const params = touristPlaceParamsSchema.safeParse(req.query);
		throwValidationError(params);
		const body = updateTouristPlaceSchema.safeParse(req.body);
		throwValidationError(body);

		const place = await touristPlaceService.update(params.data.placeId, body.data);
		res.status(200).json({ data: place });
	})
	.delete(auth, access('tourist-places.manage'), async (req, res): Promise<void> => {
		if (!req.user) throw new AuthenticationError();
		const parsed = touristPlaceParamsSchema.safeParse(req.query);
		throwValidationError(parsed);

		await touristPlaceService.delete(parsed.data.placeId);
		res.status(204).end();
	});

export default handler.handler(routerOptions);
