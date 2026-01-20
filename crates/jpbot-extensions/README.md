# JPBot Extensions

Custom extensions for JPBot that don't conflict with upstream (vibe-kanban).

## Activar el Feature

### Backend (Rust)

```bash
# Compilar CON las extensiones custom
cargo build --features jpbot-custom

# Correr el server CON extensiones
cargo run -p server --features jpbot-custom
```

### Para desarrollo (dev mode)

Modificar el `package.json` del root para agregar el feature:

```json
{
  "scripts": {
    "backend:dev:jpbot": "cargo run -p server --features jpbot-custom"
  }
}
```

## Desactivar el Feature

```bash
# Compilar SIN las extensiones (comportamiento por defecto)
cargo build

# Correr sin extensiones
cargo run -p server
```

## Estructura

```
crates/jpbot-extensions/
├── src/
│   ├── lib.rs       # Entry point
│   └── routes.rs    # Custom API endpoints
└── Cargo.toml

frontend/src/custom/
├── components/      # Custom React components
├── pages/           # Custom pages
├── hooks/           # Custom hooks
├── routes.tsx       # Custom routes
└── index.ts         # Barrel export
```

## Endpoints Disponibles

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/custom/hello` | GET | Demo endpoint que retorna un saludo |

## Frontend Routes

| Ruta | Componente |
|------|------------|
| `/custom` | CustomDemoPage |
| `/custom/demo` | CustomDemoPage |

## Como Agregar Nuevas Features

### Backend (Rust)

1. Agregar endpoint en `crates/jpbot-extensions/src/routes.rs`
2. El endpoint estara disponible en `/api/custom/*`

### Frontend (React)

1. Agregar componente en `frontend/src/custom/components/`
2. Agregar pagina en `frontend/src/custom/pages/`
3. Registrar ruta en `frontend/src/custom/routes.tsx`
4. Exportar en `frontend/src/custom/index.ts`

## Sincronizacion con Upstream

Las extensiones viven en carpetas que el upstream nunca toca:
- `crates/jpbot-extensions/` (no existe en upstream)
- `frontend/src/custom/` (no existe en upstream)

Los unicos archivos modificados del upstream son:
- `Cargo.toml` - agrega el crate al workspace
- `crates/server/Cargo.toml` - agrega feature flag
- `crates/server/src/routes/mod.rs` - importa rutas (con #[cfg])
- `frontend/src/App.tsx` - importa customRoutes

Al hacer merge con upstream, solo estos 4 archivos pueden tener conflictos.
