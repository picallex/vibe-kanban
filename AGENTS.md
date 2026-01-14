# Repository Guidelines

## Project Structure & Module Organization
- `crates/`: Rust workspace crates — `server` (API + bins), `db` (SQLx models/migrations), `executors`, `services`, `utils`, `deployment`, `local-deployment`, `remote`.
- `frontend/`: React + TypeScript app (Vite, Tailwind). Source in `frontend/src`.
- `frontend/src/components/dialogs`: Dialog components for the frontend.
- `remote-frontend/`: Remote deployment frontend.
- `shared/`: Generated TypeScript types (`shared/types.ts`). Do not edit directly.
- `assets/`, `dev_assets_seed/`, `dev_assets/`: Packaged and local dev assets.
- `npx-cli/`: Files published to the npm CLI package.
- `scripts/`: Dev helpers (ports, DB preparation).
- `docs/`: Documentation files.

## Managing Shared Types Between Rust and TypeScript

ts-rs allows you to derive TypeScript types from Rust structs/enums. By annotating your Rust types with #[derive(TS)] and related macros, ts-rs will generate .ts declaration files for those types.
When making changes to the types, you can regenerate them using `pnpm run generate-types`
Do not manually edit shared/types.ts, instead edit crates/server/src/bin/generate_types.rs

## Build, Test, and Development Commands
- Install: `pnpm i`
- Run dev (frontend + backend with ports auto-assigned): `pnpm run dev`
- Backend (watch): `pnpm run backend:dev:watch`
- Frontend (dev): `pnpm run frontend:dev`
- Type checks: `pnpm run check` (frontend) and `pnpm run backend:check` (Rust cargo check)
- Rust tests: `cargo test --workspace`
- Generate TS types from Rust: `pnpm run generate-types` (or `generate-types:check` in CI)
- Prepare SQLx (offline): `pnpm run prepare-db`
- Prepare SQLx (remote package, postgres): `pnpm run remote:prepare-db`
- Local NPX build: `pnpm run build:npx` then `pnpm pack` in `npx-cli/`

## Automated QA
- When testing changes by runnign the application, you should prefer `pnpm run dev:qa` over `pnpm run dev`, which starts the application in a dedicated mode that is optimised for QA testing

## Coding Style & Naming Conventions
- Rust: `rustfmt` enforced (`rustfmt.toml`); group imports by crate; snake_case modules, PascalCase types.
- TypeScript/React: ESLint + Prettier (2 spaces, single quotes, 80 cols). PascalCase components, camelCase vars/functions, kebab-case file names where practical.
- Keep functions small, add `Debug`/`Serialize`/`Deserialize` where useful.

## Testing Guidelines
- Rust: prefer unit tests alongside code (`#[cfg(test)]`), run `cargo test --workspace`. Add tests for new logic and edge cases.
- Frontend: ensure `pnpm run check` and `pnpm run lint` pass. If adding runtime logic, include lightweight tests (e.g., Vitest) in the same directory.

## Security & Config Tips
- Use `.env` for local overrides; never commit secrets. Key envs: `FRONTEND_PORT`, `BACKEND_PORT`, `HOST`
- Dev ports and assets are managed by `scripts/setup-dev-environment.js`.

---

## JPBot Custom Extensions

JPBot es un fork de vibe-kanban con extensiones personalizadas para Picallex. Las extensiones viven en directorios separados para no afectar el upstream.

### Estructura de Extensiones

```
frontend/src/custom/           # Extensiones frontend
├── config.ts                  # Configuración (URLs S3, etc.)
├── index.ts                   # Barrel exports
├── types.ts                   # Tipos legacy (TaskAssignee)
├── types/                     # Tipos Picallex
│   ├── modules.ts             # PicallexModule, PICALLEX_MODULES
│   └── openapi.ts             # OpenApiEndpoint, MissingEndpointInfo
├── components/
│   ├── ModuleSelector.tsx     # Dropdown de módulos API
│   └── EndpointAlert.tsx      # Alerta de endpoints faltantes
├── hooks/
│   ├── useTaskAssignee.ts     # Hook para assignees
│   ├── usePicallexModule.ts   # Fetch de endpoints desde S3
│   ├── usePromptGenerator.ts  # Genera prompts enriquecidos
│   └── useEndpointAnalyzer.ts # Detecta endpoints faltantes
└── utils/
    ├── promptBuilder.ts       # Construye prompts con contexto API
    └── endpointMatcher.ts     # Análisis semántico de descripciones

crates/jpbot-extensions/       # Extensiones backend (Rust)
├── src/
│   ├── lib.rs
│   ├── models.rs              # TaskAssignee models
│   └── routes.rs              # Rutas stateless

crates/server/src/routes/
└── jpbot_custom.rs            # Rutas con DB (assignees CRUD)

api-modules/                   # Archivos generados de API
├── api-index.json             # Índice compacto (~2k tokens)
├── metadata.json              # Metadata para S3
├── API-INDEX.md               # Referencia humana
└── modules/                   # Un archivo por módulo (~500-1k tokens c/u)
    ├── paia-ai.json
    ├── auditor.json
    ├── dynamic-queues.json
    ├── integrations.json
    ├── infrastructure.json
    └── system.json
```

### Sistema de Prompts Enriquecidos

Permite a usuarios no técnicos crear tareas con contexto de API. El formulario de tareas incluye:

1. **Selector de módulo** - Usuario elige área funcional (PAIA, Auditor, Queues, etc.)
2. **Descripción** - Usuario describe lo que quiere
3. **Detección de endpoints faltantes** - Si la descripción requiere un endpoint que no existe, muestra alerta con descripción para Jira
4. **Prompt enriquecido** - La descripción se enriquece automáticamente con los endpoints del módulo seleccionado

### Generar Módulos de API

Los módulos se generan desde el `openapi.json` de picallex-manage:

```bash
# Intenta S3 primero, fallback a archivo local
pnpm run generate-api-modules

# Forzar solo archivo local
pnpm run generate-api-modules:local
```

El script busca en orden:
1. **S3**: `$PICALLEX_OPENAPI_S3_URL` o `https://picallex-openapi.s3.amazonaws.com/openapi.json`
2. **Local**: `../picallex-manage/openapi.json`

#### Opciones del script

```bash
node scripts/generate-api-modules.js --help

# --s3-url <url>       URL de S3 donde buscar openapi.json
# --local <path>       Path local al openapi.json
# --output <dir>       Directorio de salida (default: ./api-modules)
# --force-local        Ignorar S3 y usar solo archivo local
# --force-s3           Fallar si S3 no está disponible
```

### Configuración

Variables de entorno para el frontend:

```bash
# URL base de los módulos de API en S3
VITE_PICALLEX_OPENAPI_URL=https://picallex-openapi.s3.amazonaws.com
```

```bash
# URL base de los módulos de API en S3
VITE_PICALLEX_OPENAPI_URL=https://picallex-manage-openapi.s3.us-west-2.amazonaws.com/openapi.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIASW4N2JBXBT2SYTQE%2F20260114%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260114T203036Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEF0aCXVzLXdlc3QtMiJHMEUCIBbKumTE3s3pGfSptLlTSBnz1kMoN7X3bohL5BrK6LQrAiEA0%2FJiH9%2FHdd4UgUk2YfFlpofX%2BOZM7%2FF5tXsh8OhyJsAq7QMIJhAEGgwxODY1OTE2MjczNzQiDE4Tdn2FIyHhoyup6SrKA6z5FPwI9Sx2HV8EcKN8sC8q%2Fn11zwJ3PXRfOMVaeZ4s51hB1yxoZ%2BAilxOX720N3JoIn7Sf0TKLE5hxlGrmLWq3rRVQ1qz%2FfcVC6ElUvoEUkDROduzS1dltxhurhzLB7xuhpfbE0vN4TqD7Prj7IR8oUVB1m5M2lY9UkcI5%2BiSXYVYW2qhgnXlPlbyTuW7Fy6ynUD82VmHIpWZlSHEzktOMACCJNaM%2F3PPtg6SmLWmEyEGo%2B1nczWSGU5FR7WQD4qpteSfPGwzK7mBZWraN5MaDFam%2FxbRjfAzm6JlBLCEA0xqejzcsmNjEwcn8WBL5NSoBe9DFR%2Ft5iKgLLzz4PzCxZOxQps0wZ7tw8HsFRFYbafg98ayFS0qMWVRqTByr5E51yV9U221w7HI%2FhshZnHuudG1EGHtbT%2BY7cFGEqZYeTfJMIgF62nMKgt6hQpJkhDRMeMsU%2B7KHWypuBXLytoz7XtTQa9BXcqgxwPABsatr7j9lQNWlWraePnlzeLZjVwTWOOJpvjJ%2Fn68NauJ5YzGA0BxuNWGIUEKN2CJeYoEJ6drhxaLJwzEEL8qqwneMq4JvostmGfGraDMWYspIT9LhXDqXOrYt00z2MMv4n8sGOpICo8Qr4NeRlo3dQmDL3NYQFG0YfUa8SgYm%2BEbS719NWXbihFnIGu35agJPdPJ2L16vxSlQxpdQMAi577vS7NWzs5snoM%2F3FGbLgi9WL04d45WoljyBh1bAYFUoQ2XafMcDzSBC3HwDqJMSfDAWdF2dOWyKN4B70jvhI1Rp5RN2XLUPSIQ6zrna0Hm20QAKpE87kb9hZbactblEAsgVbHtQLeFb9LuYaas6B%2BMTvaygqyqwlNUveDNx4pWeA3xkb%2BZaZTWLkJSnE36C3oNEP%2FF0CBLTU6D%2FwW0zfMtQnDbtQUjGbfAwCzeMAR36PIAOqDHaLAVCZWpl6T9yVo38hgFicdobXNEwl3LU46GNtoLQLMyIEA%3D%3D&X-Amz-Signature=aee1cb370839728803245d77a77a9cb50d32159ea9561d02cbe7880f80619038&X-Amz-SignedHeaders=host&response-content-disposition=inline
```


### Subir módulos a S3

Después de generar los módulos:

```bash
aws s3 sync ./api-modules s3://picallex-openapi/ --acl public-read
```

### Agregar nuevos módulos

1. Editar `MODULE_DEFINITIONS` en:
   - `scripts/generate-api-modules.js`
   - `frontend/src/custom/types/modules.ts`

2. Regenerar módulos: `pnpm run generate-api-modules`

3. Subir a S3

### Feature Flag Backend

Las extensiones backend usan feature flag de Cargo:

```bash
# Dev con extensiones JPBot habilitadas
pnpm run dev:jpbot

# O directamente:
cargo run --bin server --features jpbot-custom
```
