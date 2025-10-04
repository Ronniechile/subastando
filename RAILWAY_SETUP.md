# 🚂 Railway Deployment - Guía Completa

## ✅ Checklist de Variables de Entorno

Verifica que tengas **EXACTAMENTE** estas 5 variables en Railway:

### Variables Requeridas:

```
NEXT_PUBLIC_SUPABASE_URL
https://astjjzexwigycsfzcfon.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdGpqemV4d2lneWNzZnpjZm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDAyODgsImV4cCI6MjA3MDg3NjI4OH0.JgrYxcCe9FmN-QjJ_6r9pXcrB6KAJRPX1KrKx35HZI4

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdGpqemV4d2lneWNzZnpjZm9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTMwMDI4OCwiZXhwIjoyMDcwODc2Mjg4fQ.Q3cUjq-kD7JUqjkvHSloEOjH-Tii4eJYOHABtgoAHIU

RESEND_API_KEY
re_MCJrCUhK_HrjPQVAkLzVBhT6wTcpKSdRF

RESEND_FROM_EMAIL
ganador@subasport.com
```

## 🔍 Cómo Agregar Variables en Railway

1. Ve a tu servicio en Railway
2. Click en la pestaña **"Variables"**
3. Click en **"+ New Variable"**
4. **Variable name**: Copia exactamente el nombre (ej: `NEXT_PUBLIC_SUPABASE_URL`)
5. **Value**: Pega el valor correspondiente
6. Click en **"Add"**
7. Repite para las 5 variables

## ⚠️ Errores Comunes

### Error: "NEXT_PUBLIC_SUPABASE_URL is required"
**Causa**: Falta la variable o está mal nombrada
**Solución**: Verifica que el nombre sea exactamente `NEXT_PUBLIC_SUPABASE_URL` (con guiones bajos)

### Error: "Application error: a server-side exception"
**Causa**: Variables no configuradas o error en el código
**Solución**: 
1. Verifica que todas las 5 variables estén configuradas
2. Revisa los "Deploy Logs" para ver el error específico
3. Redeploy después de agregar variables

### Error: "Cannot find module"
**Causa**: Problema con las dependencias
**Solución**: 
1. Ve a Settings → Redeploy
2. Selecciona "Clear build cache and redeploy"

## 🔄 Después de Agregar Variables

1. Ve a **"Deployments"**
2. Click en el deployment actual
3. Click en **"Redeploy"** (los 3 puntos)
4. Espera 3-5 minutos
5. Abre tu sitio

## 🎯 Verificar que Funciona

Una vez deployado, verifica:
- [ ] El sitio carga sin errores
- [ ] No hay errores en la consola del navegador (F12)
- [ ] Puedes ver las subastas en la página principal
- [ ] Puedes hacer login
- [ ] Puedes crear una subasta (si eres admin)

## 📞 Si Sigue Fallando

1. Copia los últimos 50 líneas de "Deploy Logs"
2. Comparte el error específico
3. Verifica que Supabase esté accesible: https://astjjzexwigycsfzcfon.supabase.co

## 🆘 Contacto

Si necesitas ayuda, comparte:
- Screenshot de las variables configuradas
- Los últimos logs de deploy
- El error específico que aparece
