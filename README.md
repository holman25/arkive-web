
# Arkive Web

Frontend del sistema **Arkive**, parte del ecosistema Arkive + Notifier + API .NET.  
Construido con **React + Vite + TypeScript + Tailwind + TanStack Query/Router**.

---

## Descripción general

Arkive Web es la interfaz de usuario del sistema de gestión documental Arkive.  
Permite visualizar, crear, editar y filtrar documentos sincronizados con la API principal (`Arkive.API` en .NET)  
y comunicarse con el microservicio **Arkive Notifier (Laravel)** mediante webhooks.

### Ecosistema

| Componente | Tecnología | Rol |
|-------------|-------------|-----|
| `Arkive.API` | .NET 8 + SQL Server | API principal (CRUD, lógica de negocio, archivador automático) |
| `Arkive.Notifier` | Laravel 11 | Webhook externo, recibe `{ documentoId, nuevoEstado }` |
| `Arkive.Web` | React + Vite | Interfaz del usuario (listado, creación, edición, filtros) |

---

##  Requisitos

- Node.js **>= 20.19**
- NPM o PNPM
- Backend (`Arkive.API`) corriendo en `http://localhost:5171/api`
- (Opcional) Notifier (`arkive-notifier`) en `http://localhost:8085/api`

---

## 🧩 Instalación y uso

```bash
# 1) Clonar el repositorio
git clone https://github.com/holman25/arkive-web.git
cd arkive-web

# 2) Configurar entorno
cp .env.example .env

# Editar .env
# VITE_API_BASE=http://localhost:5171/api
# VITE_NOTIFIER_BASE=http://localhost:8085/api
# VITE_ARKIVE_TOKEN=dev-token

# 3) Instalar dependencias
npm install

# 4) Ejecutar en desarrollo
npm run dev

# 5) Compilar para producción
npm run build && npm run preview
```

---

##  Estructura del proyecto

```
src/
├── app/
│   ├── main.tsx          # punto de entrada
│   ├── router.tsx        # definición de rutas
│   └── providers.tsx     # QueryClient, Toaster, etc.
├── features/
│   ├── documentos/
│   │   ├── ListPage.tsx  # listado con filtros
│   │   ├── NewPage.tsx   # creación con validaciones
│   │   ├── EditPage.tsx  # edición y actualización
│   │   ├── api.ts        # comunicación HTTP
│   │   ├── schema.ts     # validación Zod
│   │   └── types.ts      # interfaces
│   └── health/
│       └── index.tsx     # health-check UI
└── lib/
    └── axiosClient.ts    # configuración base de Axios
```

---

##  Características clave

- ✅ **CRUD completo** de documentos.
- 🔍 **Filtro avanzado** por estado (`Registrado`, `Pendiente`, `Validado`, `Archivado`).
-  **Paginación y búsqueda** eficiente.
-  **Validaciones Zod** (cliente).
-  **TanStack Router + Query** para rutas reactivas y cacheo.
-  **Diseño minimalista Arkive** (Tailwind v4 + transición suave).
-  **Toasts** con `sonner` para confirmaciones y errores.
-  **Integración Notifier (Laravel)** opcional.

---

##  Comunicación con Notifier

Webhook del microservicio externo (Laravel):

```bash
POST /api/webhook/validar-documento
Content-Type: application/json
X-Arkive-Token: dev-token

{
  "documentoId": 1,
  "nuevoEstado": "Validado"
}
```

**Respuesta:**
```json
{
  "ok": true,
  "id": 1,
  "estadoAnterior": "Registrado",
  "estadoNuevo": "Validado",
  "rowsAffected": 1
}
```

 En el Front, puede usarse para acciones rápidas de cambio de estado (Validar / Archivar)  
sin pasar por el CRUD general de la API .NET.

---

##  Flujo de estados (simplificado)

```
Registrado → Pendiente → Validado → Archivado
         ↑            ↘
         └────── Automatización (90d) ────┘
```

---

## 🧪 Testing

Pendiente la adición de pruebas unitarias ligeras (React Testing Library).  
Tests básicos ya cubiertos en Arkive.API (.NET).

---

##  Deploy

1. Ejecutar `npm run build`
2. Servir el contenido de `/dist` con Nginx o Azure Static Web Apps.
3. Asegurar variables de entorno correctas (`VITE_API_BASE`, `VITE_NOTIFIER_BASE`). En este caso no se configuran esas variables de entorno en el .env.example

---
## ✨ Autor

**Holman Alba**  
 Software Developer 
 Contacto: holman.alba@repremundo.com.co  
 GitHub: [holman25](https://github.com/holman25)


---
##  Licencia

🧩 _Parte del ecosistema Arkive (API .NET + Notifier Laravel + Web React)._  
Este proyecto se distribuye bajo la licencia **MIT**.  
Puedes usarlo, modificarlo y adaptarlo libremente citando al autor original.

