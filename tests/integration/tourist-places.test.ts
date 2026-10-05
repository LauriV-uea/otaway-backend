import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextHandler } from 'next-connect';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	process.env['DATABASE_URL'] = 'postgresql://user:password@localhost:5432/otaway?schema=public';
	process.env['APP_BASE_URL'] = 'http://localhost:3000';
	process.env['OAUTH_PROVIDER_NAME'] = 'test-provider';
	process.env['OAUTH_AUTHORIZATION_URL'] = 'https://provider.example.com/authorize';
	process.env['OAUTH_TOKEN_URL'] = 'https://provider.example.com/token';
	process.env['OAUTH_ISSUER'] = 'https://provider.example.com/';
	process.env['OAUTH_CLIENT_ID'] = 'test-client';
	process.env['OAUTH_CLIENT_SECRET'] = 'test-secret';
	process.env['OAUTH_REDIRECT_URI'] = 'http://localhost:3000/api/auth/callback';
	process.env['OAUTH_MOBILE_CLIENT_ID'] = 'test-mobile-client';
	process.env['SESSION_SECRET'] = '0123456789abcdef0123456789abcdef';
	process.env['BYPASS_ACCESS_CONTROL'] = 'false';
	return {
		getAll: vi.fn(),
		getById: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	};
});

vi.mock('@/services/tourist-places', () => ({
	touristPlaceService: mocks,
}));

vi.mock('@/middleware/auth', async () => {
	const { AuthenticationError } = await import('@/errors/auth');
	return {
		auth: async (req: NextApiRequest, _res: NextApiResponse, next: NextHandler): Promise<void> => {
			if (!req.headers.authorization) throw new AuthenticationError();
			await next();
		},
	};
});

import type { NextApiHandler } from 'next';
import { createMockResponse } from '@/tests/helpers/mock-next-response';

const PLACE_ID = '550e8400-e29b-41d4-a716-446655440000';
const place = {
	id: PLACE_ID,
	name: 'Cascada de Peguche',
	description: 'Una cascada de Otavalo.',
	location: 'Peguche',
	imageUrl: null,
	status: 'ACTIVE',
	createdAt: new Date('2026-01-01T00:00:00.000Z'),
	updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const createRequest = (
	method: string,
	url: string,
	options: { query?: Record<string, string>; body?: unknown; token?: 'admin' | 'reader' } = {},
): never => {
	const token = options.token;
	return {
		method,
		url,
		query: options.query ?? {},
		body: options.body,
		headers: token ? { authorization: `Bearer ${token}` } : {},
		cookies: {},
		user: token
			? {
					id: 'user-1',
					email: 'user@example.com',
					name: 'Test User',
					roles: [],
					permissions:
						token === 'admin' ? [{ id: 'permission-1', code: 'tourist-places.manage' }] : [],
				}
			: undefined,
	} as never;
};

describe('Tourist places API', () => {
	let collectionHandler: NextApiHandler;
	let itemHandler: NextApiHandler;

	beforeAll(async () => {
		collectionHandler = (await import('../../pages/api/tourist-places/index')).default;
		itemHandler = (await import('../../pages/api/tourist-places/[placeId]')).default;
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getAll.mockResolvedValue({
			places: [place],
			meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
		});
		mocks.getById.mockResolvedValue(place);
		mocks.create.mockResolvedValue(place);
		mocks.update.mockResolvedValue({ ...place, name: 'Lugar actualizado' });
		mocks.delete.mockResolvedValue(undefined);
	});

	it('returns public collection and detail responses', async () => {
		const listResponse = createMockResponse();
		await collectionHandler(createRequest('GET', '/api/tourist-places'), listResponse);
		expect(listResponse.statusCode).toBe(200);
		expect(listResponse.body).toMatchObject({ data: [place], meta: { total: 1 } });

		const detailResponse = createMockResponse();
		await itemHandler(
			createRequest('GET', `/api/tourist-places/${PLACE_ID}`, { query: { placeId: PLACE_ID } }),
			detailResponse,
		);
		expect(detailResponse.statusCode).toBe(200);
		expect(detailResponse.body).toMatchObject({ data: place });
	});

	it('rejects unauthenticated and unauthorized writes', async () => {
		const unauthenticatedResponse = createMockResponse();
		await collectionHandler(
			createRequest('POST', '/api/tourist-places', { body: { name: 'Lugar' } }),
			unauthenticatedResponse,
		);
		expect(unauthenticatedResponse.statusCode).toBe(401);

		const forbiddenResponse = createMockResponse();
		await collectionHandler(
			createRequest('POST', '/api/tourist-places', {
				body: { name: 'Lugar' },
				token: 'reader',
			}),
			forbiddenResponse,
		);
		expect(forbiddenResponse.statusCode).toBe(403);
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it('creates, updates and deletes only with the management permission', async () => {
		const createResponse = createMockResponse();
		await collectionHandler(
			createRequest('POST', '/api/tourist-places', {
				body: { name: 'Lugar nuevo' },
				token: 'admin',
			}),
			createResponse,
		);
		expect(createResponse.statusCode).toBe(201);
		expect(mocks.create).toHaveBeenCalledWith({ name: 'Lugar nuevo' });

		const updateResponse = createMockResponse();
		await itemHandler(
			createRequest('PATCH', `/api/tourist-places/${PLACE_ID}`, {
				query: { placeId: PLACE_ID },
				body: { name: 'Lugar actualizado' },
				token: 'admin',
			}),
			updateResponse,
		);
		expect(updateResponse.statusCode).toBe(200);
		expect(mocks.update).toHaveBeenCalledWith(PLACE_ID, { name: 'Lugar actualizado' });

		const deleteResponse = createMockResponse();
		await itemHandler(
			createRequest('DELETE', `/api/tourist-places/${PLACE_ID}`, {
				query: { placeId: PLACE_ID },
				token: 'admin',
			}),
			deleteResponse,
		);
		expect(deleteResponse.statusCode).toBe(204);
		expect(mocks.delete).toHaveBeenCalledWith(PLACE_ID);
	});

	it('returns 400 for invalid input before calling the service', async () => {
		const response = createMockResponse();
		await collectionHandler(
			createRequest('POST', '/api/tourist-places', {
				body: { name: '  ' },
				token: 'admin',
			}),
			response,
		);
		expect(response.statusCode).toBe(400);
		expect(mocks.create).not.toHaveBeenCalled();
	});
});
