import { prisma } from '@/database/client';
import { createFromRegistration } from '@/database/users';
import { ConflictError } from '@/errors/conflict-error';
import {
  createKeycloakUser,
  deleteKeycloakUser,
  KeycloakUserConflictError,
} from '@/lib/oauth/admin';
import { logger } from '@/lib/logger';
import type { RegisterBody } from '@/validations/auth/register.validation';

export type RegisterResult = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export const register = async (
  body: RegisterBody
): Promise<RegisterResult> => {

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw new ConflictError(
      'Ya existe una cuenta con ese correo electrónico.'
    );
  }

  let keycloakId: string;

  try {
    const created = await createKeycloakUser({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
    });

    keycloakId = created.keycloakId;

  } catch (error) {

    if (error instanceof KeycloakUserConflictError) {
      throw new ConflictError(error.message);
    }

    throw error;
  }

  try {

    const user = await createFromRegistration(
      keycloakId,
      {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
      }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.profile?.firstName ?? body.firstName,
        lastName: user.profile?.lastName ?? body.lastName,
      },
    };

  } catch (error) {

    try {
      await deleteKeycloakUser(keycloakId);
    } catch (cleanupError) {

      logger.error(
        { keycloakId, cleanupError },
        'No se pudo revertir la creación del usuario en Keycloak.'
      );
    }

    throw error;
  }
};