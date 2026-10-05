# 022 · Catálogo turístico persistente — Tareas

- [x] Crear validaciones estrictas para entrada, consulta y parámetros.
- [x] Implementar acceso Prisma y servicio CRUD para `TouristPlace`.
- [x] Añadir endpoints públicos de lectura y mutaciones con permiso administrativo.
- [x] Documentar endpoints y schemas OpenAPI en el código.
- [x] Confirmar que la tabla responde en PostgreSQL y preparar migración aditiva idempotente.
- [x] Conectar Home, listado, detalle, favoritos y panel CRUD a la API real.
- [x] Añadir estados de carga, errores, éxito, validaciones y actualización de interfaz.
- [x] Ejecutar pruebas focalizadas y lint del módulo; typecheck de frontend.
- [ ] Probar POST/PATCH/DELETE y relectura con una sesión administradora real; resolver el build backend bloqueado por Zod/OpenAPI preexistente.

## Documentación Swagger (obligatorio)

- [x] Crear `documentation/schemas/tourist-places.ts` y registrar schemas.
- [x] Registrar GET/POST de colección y GET/PATCH/DELETE individual.
- [x] Exportar desde `documentation/schemas/index.ts`.
- [x] Verificar `GET /api/docs/spec` en runtime.

## Cierre

- [ ] Validar criterios de aceptación y persistencia HTTP-a-PostgreSQL.
- [ ] Actualizar `spec/constitution/roadmap.md` cuando se complete la prueba persistente.