# 022 · Catálogo turístico persistente — Plan

## Enfoque

Reutilizar `TouristPlace` y la instancia Prisma del backend. Mantener el listado y detalle públicos de solo lectura; proteger las mutaciones con la sesión existente y el permiso `tourist-places.manage`. El frontend consume rutas same-origin `/api/*`, que Next reescribe al backend en el puerto 3001, también desde Capacitor.

## Implementación

1. `validations/tourist-places/` — schemas estrictos para filtros, creación, actualización y UUID.
2. `database/tourist-places/` y `services/tourist-places/` — consultas Prisma, reglas de listado activo y CRUD.
3. `pages/api/tourist-places/` — GET/POST de colección y GET/PATCH/DELETE individual con auth, permisos y errores estándar.
4. `documentation/schemas/tourist-places.ts` — contrato OpenAPI y exportación del módulo.
5. `prisma/migrations/` — migración SQL aditiva para `tourist_places` si la tabla no existe en PostgreSQL.
6. `frontend/src/features/tourism/api.ts` — cliente same-origin con Bearer tomado de la sesión móvil existente.
7. `/`, `/lugares`, `/lugares/[slug]` y `/admin/tourist-places` — lectura y gestión desde API, estados y validaciones.
8. Pruebas focalizadas para validación y servicio; verificar lint/typecheck/build y documentar bloqueos de ambiente.

## Decisiones

- El modelo persistente solo contiene nombre, descripción, ubicación, URL de imagen y estado; la UI no inventa categoría, eventos ni atributos adicionales.
- DELETE elimina solo el registro elegido explícitamente desde el panel; no se aplica limpieza o seed implícito.
- La autorización se comprueba en cada mutación del backend; ocultar enlaces en la UI no sustituye el control de acceso.
- No se cambia el puerto 3000 ni la URL remota de Capacitor.

## Riesgos

- Prisma respondió el listado real desde PostgreSQL, pero `migrate status` muestra diez migraciones pendientes; revisar el historial antes de desplegar SQL.
- El frontend tiene configs Next duplicadas; conservar el rewrite ya documentado y validar cuál archivo carga el build.
- Keycloak/DB no disponibles impiden verificar creación y persistencia end-to-end; no simular esa prueba.