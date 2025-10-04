# 🚀 Despliegue en Vercel - Subasport

## Guía Rápida de Despliegue

### Paso 1: Preparar el Proyecto

El proyecto ya está configurado para Vercel. El archivo `vercel.json` ya existe.

### Paso 2: Desplegar en Vercel

#### Opción A: Desde la Web (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Add New Project"**
3. Importa tu repositorio de GitHub/GitLab/Bitbucket
4. Vercel detectará automáticamente que es un proyecto Next.js

#### Opción B: Desde la Terminal

```bash
# Instalar Vercel CLI
npm i -g vercel

# Hacer login
vercel login

# Desplegar
vercel
```

### Paso 3: Configurar Variables de Entorno

En el dashboard de Vercel, ve a **Settings** → **Environment Variables** y agrega:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Resend (Email)
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM_EMAIL=ganador@subasport.com

# URL del sitio
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

### Paso 4: Configurar Dominio (Opcional)

Si quieres usar un dominio personalizado:

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio (ej: `subasport-vercel.com`)
3. Sigue las instrucciones de DNS

**Nota:** Puedes usar un subdominio diferente para no interferir con Netlify:
- Netlify: `subasport.com`
- Vercel: `app.subasport.com` o `v2.subasport.com`

### Paso 5: Verificar el Despliegue

1. Espera a que termine el build (2-3 minutos)
2. Vercel te dará una URL: `https://tu-proyecto.vercel.app`
3. Visita la URL y verifica que todo funcione

### Diferencias entre Netlify y Vercel

| Característica | Netlify | Vercel |
|---------------|---------|--------|
| **Build Time** | ~3-5 min | ~2-3 min |
| **Edge Functions** | Sí | Sí (mejor integración) |
| **Dominio Gratis** | Sí | Sí |
| **SSL** | Automático | Automático |
| **Despliegue** | Git push | Git push |

### Ventajas de Vercel para Next.js

- ✅ **Optimizado para Next.js** (creadores de Next.js)
- ✅ **Edge Runtime** más rápido
- ✅ **Mejor caché** y CDN global
- ✅ **Analytics** integrado
- ✅ **Preview deployments** automáticos

### Mantener Ambos Despliegues

Puedes tener ambos activos:

```
Netlify:  https://subasport.netlify.app  (producción)
Vercel:   https://subasport.vercel.app   (staging/testing)
```

O viceversa. Ambos se actualizarán automáticamente con cada push a tu repositorio.

### Comandos Útiles

```bash
# Ver despliegues
vercel ls

# Ver logs
vercel logs

# Promover a producción
vercel --prod

# Eliminar proyecto
vercel remove
```

### Troubleshooting

#### Error: Build Failed
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs en el dashboard de Vercel

#### Error: Environment Variables
- Asegúrate de agregar TODAS las variables de entorno
- Redeploy después de agregar variables

#### Error: Supabase Connection
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` sea correcta
- Verifica que las keys no tengan espacios extras

### Configuración de Supabase para Vercel

En Supabase Dashboard → **Authentication** → **URL Configuration**:

Agrega la URL de Vercel a:
- **Site URL**: `https://tu-proyecto.vercel.app`
- **Redirect URLs**: 
  - `https://tu-proyecto.vercel.app/auth/callback`
  - `https://tu-proyecto.vercel.app/**`

### Próximos Pasos

1. ✅ Desplegar en Vercel
2. ✅ Configurar variables de entorno
3. ✅ Probar autenticación
4. ✅ Probar creación de subastas
5. ✅ Verificar emails
6. 🎯 Decidir cuál usar en producción

---

## 🎉 ¡Listo!

Tu aplicación estará disponible en:
- **Vercel**: https://tu-proyecto.vercel.app
- **Netlify**: https://tu-proyecto.netlify.app

Ambas se actualizarán automáticamente con cada push a tu repositorio.
