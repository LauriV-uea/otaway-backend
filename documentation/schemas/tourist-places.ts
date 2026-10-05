/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { z } from 'zod';

import { registry } from '@/documentation/registry';

const TouristPlaceSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullable(),
	location: z.string().nullable(),
	imageUrl: z.string().nullable(),
	status: z.string(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

const CreateTouristPlaceSchema = z.object({
	name: z.string().min(1).max(150),
	description: z.string().max(5000).nullable().optional(),
	location: z.string().max(255).nullable().optional(),
	imageUrl: z.string().url().max(500).nullable().optional(),
});

const UpdateTouristPlaceSchema = CreateTouristPlaceSchema.partial();
const TouristPlacesSchema = z.object({
	data: z.array(TouristPlaceSchema),
	meta: z.object({
		page: z.number(),
		pageSize: z.number(),
		total: z.number(),
		totalPages: z.number(),
	}),
});

registry.registerComponent('schemas', 'TouristPlace', TouristPlaceSchema);
registry.registerComponent('schemas', 'CreateTouristPlace', CreateTouristPlaceSchema);
registry.registerComponent('schemas', 'UpdateTouristPlace', UpdateTouristPlaceSchema);
registry.registerComponent('schemas', 'TouristPlaces', TouristPlacesSchema);

registry.registerPath({
	method: 'get',
	path: '/tourist-places',
	tags: ['Lugares turísticos'],
	summary: 'Listar lugares turísticos activos',
	parameters: [
		{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
		{
			name: 'pageSize',
			in: 'query',
			schema: { type: 'integer', minimum: 1, maximum: 100, default: 100 },
		},
	],
	responses: {
		200: {
			description: 'Lugares turísticos activos',
			content: { 'application/json': { schema: TouristPlacesSchema } },
		},
		400: { description: 'Parámetros inválidos' },
	},
});

registry.registerPath({
	method: 'post',
	path: '/tourist-places',
	tags: ['Lugares turísticos'],
	summary: 'Crear un lugar turístico',
	security: [{ cookieAuth: [] }, { bearerAuth: [] }],
	description: 'Requiere el permiso `tourist-places.manage`.',
	requestBody: {
		required: true,
		content: { 'application/json': { schema: CreateTouristPlaceSchema } },
	},
	responses: {
		201: {
			description: 'Lugar creado',
			content: { 'application/json': { schema: z.object({ data: TouristPlaceSchema }) } },
		},
		400: { description: 'Datos inválidos' },
		401: { description: 'No autenticado' },
		403: { description: 'Permiso insuficiente' },
	},
});

registry.registerPath({
	method: 'get',
	path: '/tourist-places/{placeId}',
	tags: ['Lugares turísticos'],
	summary: 'Consultar un lugar turístico activo',
	requestParams: { path: z.object({ placeId: z.string().uuid() }) },
	responses: {
		200: {
			description: 'Lugar turístico',
			content: { 'application/json': { schema: z.object({ data: TouristPlaceSchema }) } },
		},
		404: { description: 'Lugar no encontrado' },
	},
});

registry.registerPath({
	method: 'patch',
	path: '/tourist-places/{placeId}',
	tags: ['Lugares turísticos'],
	summary: 'Actualizar un lugar turístico',
	security: [{ cookieAuth: [] }, { bearerAuth: [] }],
	description: 'Requiere el permiso `tourist-places.manage`.',
	requestParams: { path: z.object({ placeId: z.string().uuid() }) },
	requestBody: {
		required: true,
		content: { 'application/json': { schema: UpdateTouristPlaceSchema } },
	},
	responses: {
		200: {
			description: 'Lugar actualizado',
			content: { 'application/json': { schema: z.object({ data: TouristPlaceSchema }) } },
		},
		400: { description: 'Datos inválidos' },
		401: { description: 'No autenticado' },
		403: { description: 'Permiso insuficiente' },
		404: { description: 'Lugar no encontrado' },
	},
});

registry.registerPath({
	method: 'delete',
	path: '/tourist-places/{placeId}',
	tags: ['Lugares turísticos'],
	summary: 'Eliminar un lugar turístico',
	security: [{ cookieAuth: [] }, { bearerAuth: [] }],
	description: 'Requiere el permiso `tourist-places.manage`.',
	requestParams: { path: z.object({ placeId: z.string().uuid() }) },
	responses: {
		204: { description: 'Lugar eliminado' },
		401: { description: 'No autenticado' },
		403: { description: 'Permiso insuficiente' },
		404: { description: 'Lugar no encontrado' },
	},
});
