# Directorio y Gestión de Médicos (MediCare)

Sistema integral de gestión de visitadores médicos, doctores y centros hospitalarios desarrollado con **React + TypeScript + Tailwind CSS**, **Java + Spring Boot 3**, **Spring Security con JWT** y **PostgreSQL**.

Diseño visual e interactivo fiel a la referencia de Figma: [Listado de Médico](https://www.figma.com/make/SUTdVMsa4Lx9GiZW9ZVOVf/Listado-de-M%C3%A9dico).

---

## 🚀 Arquitectura y Módulos

El sistema está estructurado como un monolito modular con separación estricta de responsabilidades:

1. **Módulo de Autenticación & Seguridad:**
   - Spring Security con tokens JWT sin estado (`Stateless`).
   - Contraseñas cifradas mediante `BCryptPasswordEncoder`.
   - **Registro Inicial de Empresa:** Cuando el sistema inicia por primera vez sin usuarios, el primer usuario en registrarse se convierte automáticamente en el **👑 Administrador General** de la empresa con acceso y activación inmediata.
   - **Aprobación Obligatoria de Cuentas:** Los usuarios posteriores que se registran reciben el rol `VISITADOR` y quedan en estado `inactivo` (**⏳ Pendiente de Aprobación**). No pueden iniciar sesión hasta que un Administrador apruebe su cuenta.
   - **Asignación de Roles:** Un Administrador puede promover a cualquier otro usuario a **Administrador General** (`👑 Hacer Admin`).
   - Soporte para autenticación tradicional y Google OAuth 2.0 / OpenID Connect.
   - Protección contra vinculación automática silenciosa de cuentas por correo.

2. **Módulo de Usuarios, Roles y Aislamiento de Datos:**
   - **Rol `ADMIN`:** Acceso permanente a panel administrativo, gestión de usuarios, asignación de zonas, activación/desactivación y aprobación de cuentas, promoción de administradores y consulta global de todos los médicos de la red.
   - **Rol `VISITADOR`:** Aislamiento estricto de datos aplicado en base de datos, consultas JPA y servicios. Un visitador solo puede consultar, editar y eliminar sus propios médicos asignados.
   - Las cuentas desactivadas o pendientes tienen revocado el acceso de forma inmediata sin eliminar registros ni historiales.

3. **Módulo de Centros Médicos Compartidos:**
   - Catálogo compartido entre visitadores con relación muchos a muchos (`medico_centro_medico`).
   - Creación y reutilización directa desde el formulario del médico con normalización de nombres.
   - Los visitadores no pueden eliminar ni modificar centros compartidos que estén asignados a médicos de otros visitadores.

4. **Módulo de Notificaciones Internas:**
   - Notificación persistente transaccional al administrador ante el registro de cada nuevo usuario (nombre, correo, fecha, zona y estado).
   - Aprobación directa de visitadores con un solo clic desde la tarjeta de notificación.
   - Prevención de duplicados ante reintentos.
   - Contador de pendientes y marcado individual o masivo como leídas.

---

## 🌿 Estrategia de Ramas (Git Branching Model)

Este repositorio sigue el flujo de trabajo estandarizado:

- **`main`**: Rama de producción y estabilidad. Contiene las versiones funcionales y listas para despliegue de la aplicación.
- **`dev`**: Rama principal de desarrollo. Aloja las nuevas actualizaciones, mejoras en proceso y correcciones antes de integrarse a `main`.

### Integración Continua (CI / CD) con GitHub Actions:
- **`ci.yml`**: Ejecuta las suites de pruebas automáticas del backend (JUnit, Spring Boot Test) y verificación de compilación/tipado del frontend (TypeScript + Vite) ante cada `push` o `pull_request` sobre `main` y `dev`.
- **`cd.yml`**: Empaqueta los artefactos de compilación listos para producción (JAR de Spring Boot y compilado estático de React).
- **`pull_request_template.md`**: Plantilla para estandarizar revisiones de código y listas de verificación antes de mergear cambios.

---

## ⚙️ Variables de Entorno

| Variable | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | URL JDBC de PostgreSQL | `jdbc:postgresql://localhost:5432/medicos_db` |
| `SPRING_DATASOURCE_USERNAME` | Usuario de base de datos | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña de base de datos | `postgres` |
| `PORT` | Puerto HTTP del backend | `8080` |
| `JWT_SECRET` | Clave secreta para firma HMAC-SHA256 de tokens JWT | *(Clave por defecto de 256 bits)* |
| `GOOGLE_CLIENT_ID` | Client ID de Google Cloud Console para OAuth2 (Backend) | *(Opcional / Documentado)* |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google para el Frontend | *(Opcional / Documentado)* |

---

## 🏃 Instrucciones de Ejecución

### 1. Iniciar Base de Datos PostgreSQL
```bash
docker compose up -d
```
Aplica automáticamente `init.sql` con el esquema DDL.

### 2. Iniciar Backend (Spring Boot)
```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="standalone" # Modo persistente local o postgresql
.\mvnw.cmd spring-boot:run
# O mediante el script rápido: .\run-backend.ps1
```
*API disponible en: `http://localhost:8080`*

### 3. Iniciar Frontend (React + Vite)
```powershell
cd frontend
npm run dev
# O mediante el script rápido: .\run-frontend.ps1
```
*Aplicación disponible en: `http://localhost:5173`*

---

## 🧪 Pruebas Automatizadas

Para ejecutar la suite de pruebas del backend:
```powershell
cd backend
.\mvnw.cmd test
```

### Resultados Verificados:
- `Tests run: 13, Failures: 0, Errors: 0, Skipped: 0` (`BUILD SUCCESS`)
- **Registro Inicial:** Comprobado que el primer usuario es `ADMIN` y queda activo.
- **Aprobación de Visitadores:** Comprobado que usuarios posteriores quedan inactivos hasta aprobación del admin.
- **Promoción de Administradores:** Comprobado que el administrador puede otorgar rol `ADMIN` a otro usuario.
- **Aislamiento de Visitador:** Comprobado que un visitador no puede consultar (`403`), editar (`403`) ni eliminar (`403`) médicos de otro.
- **Centros Compartidos:** Normalización y protección de eliminación concurrente.
