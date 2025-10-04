# Guía de Configuración y Despliegue - Subasport.com

## Variables de Entorno Requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Opcionales
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## Pasos de Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd subastando-main
```

### 2. Instalar Dependencias

```bash
pnpm install
# o
npm install
# o
yarn install
```

### 3. Configurar Supabase

1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. Obtener las credenciales del proyecto:
   - URL del proyecto
   - Anon key (clave pública)
   - Service role key (clave privada - para admin)

### 4. Ejecutar Scripts SQL

En el editor SQL de Supabase, ejecutar los scripts en orden:

```sql
-- 1. Crear tablas
-- Ejecutar: scripts/01-create-tables.sql

-- 2. Poblar datos iniciales (opcional)
-- Ejecutar: scripts/02-seed-data.sql

-- 3. Agregar categorías
-- Ejecutar: scripts/03-populate-categories.sql

-- 4. Crear perfil admin (opcional)
-- Ejecutar: scripts/04-create-admin-profile.sql

-- 5. Arreglar políticas RLS
-- Ejecutar: scripts/05-fix-rls-policies.sql

-- 6. Agregar campo buy_now_price
-- Ejecutar: scripts/06-add-buy-now-price.sql
```

### 5. Configurar Autenticación con Google (Opcional)

1. En Supabase Dashboard → Authentication → Providers
2. Habilitar Google
3. Configurar credenciales OAuth de Google Cloud Console
4. Agregar URL de callback: `https://tu-proyecto.supabase.co/auth/v1/callback`

### 6. Ejecutar en Desarrollo

```bash
pnpm dev
# o
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

## Despliegue en Producción

### Opción 1: Vercel (Recomendado)

1. Crear cuenta en [Vercel](https://vercel.com)
2. Conectar repositorio de GitHub/GitLab/Bitbucket
3. Configurar variables de entorno
4. Desplegar automáticamente

```bash
# CLI de Vercel
vercel deploy --prod
```

### Opción 2: Otros Proveedores

Compatible con cualquier proveedor que soporte Next.js 15:
- Netlify
- Railway
- AWS Amplify
- Google Cloud Run
- etc.

## Verificación Post-Instalación

### Checklist

- [ ] Aplicación corre en localhost
- [ ] Base de datos conectada correctamente
- [ ] Registro de usuarios funciona
- [ ] Login de usuarios funciona
- [ ] Login admin funciona (admin/subastando2024)
- [ ] Crear subasta funciona
- [ ] Realizar pujas funciona
- [ ] Funcionalidad buy now funciona
- [ ] Categorías se muestran correctamente

## Solución de Problemas Comunes

### Error: "Supabase environment variables are not set"

**Solución**: Verificar que las variables de entorno estén correctamente configuradas en `.env.local`

### Error al crear perfil de usuario

**Solución**: Verificar que el trigger `handle_new_user` esté creado correctamente en Supabase

### Pujas no se actualizan en tiempo real

**Solución**: El sistema usa Server-Side Rendering. Recargar la página para ver cambios. Para tiempo real, considerar implementar Supabase Realtime.

### Error de RLS policies

**Solución**: Ejecutar el script `05-fix-rls-policies.sql` para corregir las políticas de seguridad

## Recomendaciones de Seguridad en Producción

1. **Cambiar credenciales de admin**: Modific 
6. **Backup de base de datos**: Configurar backups automáticos en Supabase

## Monitoreo y Mantenimiento

### Logs

- Next.js logs: Revisar en la consola del proveedor de hosting
- Supabase logs: Dashboard → Logs

### Tareas Periódicas

- Finalizar subastas expiradas (implementar cron job)
- Limpiar subastas canceladas
- Backup de base de datos
- Revisar métricas de uso

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
