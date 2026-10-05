# 022 · Catálogo turístico persistente

**Estado:** en curso

## Qué hace

Permite consultar lugares turísticos activos de Otavalo y que una persona administradora autenticada cree, edite y elimine lugares persistidos en PostgreSQL.

## Por qué

El frontend mostraba un catálogo local sin conexión con el backend, aunque el schema ya contiene `TouristPlace`. Esta feature conecta la demostración principal con datos reales sin introducir otra entidad.

## Criterios de aceptación

- [x] El listado público y el detalle consultan lugares activos desde PostgreSQL mediante Prisma.
- [x] Una persona no autenticada no puede crear, editar ni eliminar lugares; una persona autenticada sin permiso recibe 403.
- [ ] Una persona con `tourist-places.manage` puede crear, editar y eliminar registros y releerlos desde PostgreSQL.
- [x] El frontend presenta estados de carga, vacío, éxito y error, valida el formulario y actualiza la lista tras mutaciones exitosas.
- [x] No se introduce una segunda fuente local para los lugares turísticos.
- [x] La migración preparada es aditiva y no elimina datos ni altera tablas existentes.
- [x] Los endpoints aparecen en OpenAPI runtime y las pruebas del módulo pasan.

### Documentación (obligatorio)

- [ ] Todos los endpoints del módulo están registrados en `documentation/schemas/tourist-places.ts`.
- [ ] Los schemas de entrada y salida están registrados con `registry.registerComponent()`.
- [ ] El módulo está exportado desde `documentation/schemas/index.ts`.
- [ ] Los endpoints y schemas están visibles en `GET /api/docs`.

## Fuera de alcance

- Gestión de gastronomía y eventos: no existe un modelo turístico persistente correspondiente.
- Carga de imágenes: se conserva una URL HTTPS opcional, sin almacenamiento de archivos.
- Ejecución automática de migraciones o semillas sobre la base de datos local.