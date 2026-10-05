import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { AuthenticationError } from '@/errors';
import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { routerOptions } from '@/lib/api/router-config';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { touristPlaceService } from '@/services/tourist-places';
import { createTouristPlaceSchema, touristPlaceQuerySchema } from '@/validations/tourist-places';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.get(async (req, res): Promise<void> => {
		const parsed = touristPlaceQuerySchema.safeParse(req.query);
		throwValidationError(parsed);

		const result = await touristPlaceService.getAll(parsed.data);
		res.status(200).json({ data: result.places, meta: result.meta });
	})
	.post(auth, access('tourist-places.manage'), async (req, res): Promise<void> => {
		if (!req.user) throw new AuthenticationError();
		const parsed = createTouristPlaceSchema.safeParse(req.body);
		throwValidationError(parsed);

		const place = await touristPlaceService.create(parsed.data);
		res.status(201).json({ data: place });
	});

export default handler.handler(routerOptions);
