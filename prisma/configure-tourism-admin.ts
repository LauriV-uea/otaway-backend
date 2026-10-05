import { prisma } from '@/database/client';

const ADMIN_EMAIL = 'administrador@otaway.local';
const PERMISSION_CODE = 'tourist-places.manage';
const ADMIN_ROLE_CODE = 'administrador';
const ADMIN_ROLE_NAME = 'Administrador';

const main = async (): Promise<void> => {
	const user = await prisma.user.findUnique({
		where: { email: ADMIN_EMAIL },
		select: { id: true },
	});

	if (!user) {
		throw new Error(
			'La cuenta administradora aún no está sincronizada en OtaWay. Inicia sesión una vez con Keycloak y vuelve a ejecutar este comando.',
		);
	}

	const result = await prisma.$transaction(async transaction => {
		const existingPermission = await transaction.permission.findUnique({
			where: { code: PERMISSION_CODE },
		});

		const permission = existingPermission
			? existingPermission.module === 'tourist-places' && existingPermission.action === 'manage'
				? existingPermission
				: (() => {
						throw new Error(
							`El permiso ${PERMISSION_CODE} ya existe con módulo/acción incompatibles.`,
						);
					})()
			: await transaction.permission.create({
					data: {
						module: 'tourist-places',
						action: 'manage',
						code: PERMISSION_CODE,
						description: 'Consultar y administrar lugares turísticos',
					},
				});

		const adminRoles = await transaction.role.findMany({
			where: {
				organizationId: null,
				code: ADMIN_ROLE_CODE,
				deletedAt: null,
			},
		});

		if (adminRoles.length > 1) {
			throw new Error('Hay más de un rol Administrador global; no se asignó ningún permiso.');
		}

		const existingRole = adminRoles[0];
		if (
			existingRole &&
			(existingRole.normalizedName !== 'administrador' || existingRole.name !== ADMIN_ROLE_NAME)
		) {
			throw new Error('El código administrador pertenece a un rol incompatible; no se modificó.');
		}

		const role =
			existingRole ??
			(await transaction.role.create({
				data: {
					organizationId: null,
					code: ADMIN_ROLE_CODE,
					name: ADMIN_ROLE_NAME,
					normalizedName: 'administrador',
					description: 'Administración de la plataforma OtaWay',
					isSystem: true,
				},
			}));

		await transaction.rolePermission.upsert({
			where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
			create: { roleId: role.id, permissionId: permission.id, granted: true },
			update: { granted: true },
		});

		const userRole = await transaction.userRole.findFirst({
			where: {
				userId: user.id,
				roleId: role.id,
				organizationId: null,
				venueId: null,
			},
		});

		if (!userRole) {
			await transaction.userRole.create({
				data: {
					userId: user.id,
					roleId: role.id,
					organizationId: null,
					venueId: null,
				},
			});
		}

		return { permissionCreated: !existingPermission, roleCreated: !existingRole };
	});

	console.log(
		JSON.stringify({
			status: 'configured',
			adminAccount: ADMIN_EMAIL,
			permission: PERMISSION_CODE,
			...result,
		}),
	);
};

main()
	.catch((error: unknown) => {
		console.error(
			'No se pudo configurar el acceso turístico:',
			error instanceof Error ? error.message : error,
		);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
