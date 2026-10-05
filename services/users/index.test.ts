import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAssignableRoles = vi.fn();
const createWithRoles = vi.fn();
const recordGetUnique = vi.fn();
const getOwnProfileData = vi.fn();
const updateOwnProfileData = vi.fn();

vi.mock('@/database/users', () => ({
	getAll: vi.fn(),
	getOwnProfile: (...args: unknown[]) => getOwnProfileData(...args),
	updateOwnProfile: (...args: unknown[]) => updateOwnProfileData(...args),
	getAssignableRoles: (...args: unknown[]) => getAssignableRoles(...args),
	createWithRoles: (...args: unknown[]) => createWithRoles(...args),
	record: () => ({ getUnique: (...args: unknown[]) => recordGetUnique(...args) }),
	updateWithRoles: vi.fn(),
	getRolesByUserId: vi.fn(),
	assignRolesToUser: vi.fn(),
	addRolesToUser: vi.fn(),
	addRoleToUser: vi.fn(),
	removeRoleFromUser: vi.fn(),
}));

vi.mock('./role-guard', () => ({
	assertCanAssignRoles: vi.fn(),
}));

import type { SessionUser } from '@/lib/session';

import { create, getOwnProfile, updateOwnProfile } from './index';

const ORGANIZATION_ID = '123e4567-e89b-42d3-a456-426614174001';
const OTHER_ORGANIZATION_ID = '123e4567-e89b-42d3-a456-426614174002';
const ROLE_ID = '123e4567-e89b-42d3-a456-426614174003';

const ACTING_USER: SessionUser = {
	id: '123e4567-e89b-42d3-a456-426614174004',
	email: 'admin@example.com',
	name: 'Admin',
	roles: [],
	permissions: [{ id: 'permission-1', code: 'users.create' }],
};

const BODY = {
	email: 'new-user@example.com',
	firstName: 'New',
	lastName: 'User',
	organizationId: ORGANIZATION_ID,
	roleIds: [ROLE_ID],
};

const CREATED_USER = {
	id: '123e4567-e89b-42d3-a456-426614174005',
	email: BODY.email,
	status: 'ACTIVE',
	profile: { firstName: BODY.firstName, lastName: BODY.lastName },
	userRoles: [],
	createdAt: new Date('2026-08-21T00:00:00.000Z'),
	updatedAt: new Date('2026-08-21T00:00:00.000Z'),
};

describe('user service role assignment', () => {
	beforeEach(() => {
		getAssignableRoles.mockReset();
		createWithRoles.mockReset();
		recordGetUnique.mockReset();
		getOwnProfileData.mockReset();
		updateOwnProfileData.mockReset();
	});

	it('creates the user and role assignments through the atomic data operation', async () => {
		getAssignableRoles.mockResolvedValue([
			{ id: ROLE_ID, organizationId: ORGANIZATION_ID, isSystem: false },
		]);
		createWithRoles.mockResolvedValue(CREATED_USER);

		await expect(create(BODY, ACTING_USER)).resolves.toMatchObject({
			email: BODY.email,
			roles: [],
		});
		expect(createWithRoles).toHaveBeenCalledOnce();
		expect(createWithRoles).toHaveBeenCalledWith(BODY);
	});

	it('rejects unknown roles with 422 before creating the user', async () => {
		getAssignableRoles.mockResolvedValue([]);

		await expect(create(BODY, ACTING_USER)).rejects.toMatchObject({
			statusCode: 422,
			code: 'BUSINESS_RULE_ERROR',
		});
		expect(createWithRoles).not.toHaveBeenCalled();
	});

	it('rejects a role from another organization with 422', async () => {
		getAssignableRoles.mockResolvedValue([
			{ id: ROLE_ID, organizationId: OTHER_ORGANIZATION_ID, isSystem: false },
		]);

		await expect(create(BODY, ACTING_USER)).rejects.toMatchObject({
			statusCode: 422,
			code: 'BUSINESS_RULE_ERROR',
		});
		expect(createWithRoles).not.toHaveBeenCalled();
	});

	it('maps real account identity and role data into the own-profile response', async () => {
		getOwnProfileData.mockResolvedValue({
			firstName: 'Sofia',
			lastName: 'Cordova',
			email: 'admin@example.com',
			username: 'administrador',
			user: {
				email: 'admin@example.com',
				username: 'administrador',
				userRoles: [{ role: { id: ROLE_ID, code: 'administrador', name: 'Administrador' } }],
			},
			phone: null,
			facebookUrl: null,
			instagramUrl: null,
			linkedinUrl: null,
			xUrl: null,
			githubUrl: null,
			tiktokUrl: null,
			websiteUrl: null,
			avatarMimeType: null,
			avatarUpdatedAt: null,
			updatedAt: new Date('2026-10-04T00:00:00.000Z'),
		});

		await expect(getOwnProfile(ACTING_USER.id)).resolves.toMatchObject({
			firstName: 'Sofia',
			lastName: 'Cordova',
			email: 'admin@example.com',
			username: 'administrador',
			roles: [{ id: ROLE_ID, code: 'administrador', name: 'Administrador' }],
		});
		expect(getOwnProfileData).toHaveBeenCalledWith(ACTING_USER.id);
	});

	it('updates only self-editable name fields with the authenticated user id', async () => {
		const profile = {
			firstName: 'Sofia',
			lastName: 'Cordova',
			email: 'admin@example.com',
			username: 'administrador',
			user: { email: 'admin@example.com', username: 'administrador', userRoles: [] },
			phone: null,
			facebookUrl: null,
			instagramUrl: null,
			linkedinUrl: null,
			xUrl: null,
			githubUrl: null,
			tiktokUrl: null,
			websiteUrl: null,
			avatarMimeType: null,
			avatarUpdatedAt: null,
			updatedAt: new Date('2026-10-04T00:00:00.000Z'),
		};
		updateOwnProfileData.mockResolvedValue(profile);

		await expect(
			updateOwnProfile(ACTING_USER.id, {
				firstName: 'Sofia',
				expectedProfileUpdatedAt: profile.updatedAt.toISOString(),
			}),
		).resolves.toMatchObject({ firstName: 'Sofia', email: 'admin@example.com' });
		expect(updateOwnProfileData).toHaveBeenCalledWith(ACTING_USER.id, {
			firstName: 'Sofia',
			expectedProfileUpdatedAt: profile.updatedAt.toISOString(),
		});
	});
});
