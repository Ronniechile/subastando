# 🆓 Guía de Deployment Gratuito - Subasport

## 📊 Comparación de Plataformas Gratuitas

| Plataforma | Límites Gratuitos | Facilidad | Uptime | Recomendado |
|------------|-------------------|-----------|--------|-------------|
| **Vercel** | Ilimitado | ⭐⭐⭐⭐⭐ | 99.9% | ✅ Mejor para Next.js |
| **Railway** | $5/mes crédito | ⭐⭐⭐⭐⭐ | 99.9% | ✅ Muy fácil |
| **Render** | Ilimitado (sleep) | ⭐⭐⭐⭐ | 99% | ✅ Buena opción |
| **Fly.io** | 3 VMs gratis | ⭐⭐⭐ | 99.9% | ⚠️ Más técnico |
| **Netlify** | Ilimitado | ⭐⭐⭐ | 99.9% | ⚠️ Problemas con deps |

---

## 1️⃣ Railway (Más Recomendado)

### **Ventajas:**
- ✅ Setup en 2 minutos
- ✅ Detecta Next.js automáticamente
- ✅ $5 de crédito mensual gratis
- ✅ No duerme (siempre activo)
- ✅ Base de datos PostgreSQL gratis incluida

### **Pasos:**

1. **Ir a Railway**
   ```
   https://railway.app
   ```

2. **Sign Up con GitHub**

3. **New Project → Deploy from GitHub repo**

4. **Seleccionar repositorio**: `Ronniechile/subastando`

5. **Railway detecta Next.js automáticamente**

6. **Agregar Variables de Entorno**
   - Click en tu servicio
   - Variables → Add Variable
   - Agregar todas las variables de `.env`

7. **Deploy automático** ✅

### **Configuración (si es necesaria):**
```bash
Build Command: pnpm install && pnpm build
Start Command: pnpm start
```

---

## 2️⃣ Render

### **Ventajas:**
- ✅ Completamente gratis
- ✅ SSL automático
- ✅ Fácil de usar
- ⚠️ Duerme después de 15 min de inactividad

### **Pasos:**

1. **Ir a Render**
   ```
   https://render.com
   ```

2. **Sign Up con GitHub**

3. **New → Web Service**

4. **Conectar repositorio**: `Ronniechile/subastando`

5. **Configurar:**
   - **Name**: `subastando`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)` o el más cercano
   - **Branch**: `main`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

6. **Agregar Variables de Entorno**
   - En la sección "Environment"
   - Add Environment Variable
   - Agregar todas las variables

7. **Create Web Service** → Deploy automático ✅

---

## 3️⃣ Fly.io (Más Avanzado)

### **Ventajas:**
- ✅ 3 VMs gratis
- ✅ Más control
- ✅ Múltiples regiones
- ⚠️ Requiere CLI

### **Pasos:**

1. **Instalar Fly CLI**
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Ir al directorio del proyecto**
   ```bash
   cd /Users/ronnie/Downloads/subastando-main
   ```

4. **Lanzar app**
   ```bash
   fly launch
   ```
   
   Responde:
   - App name: `subastando` (o el que prefieras)
   - Region: `iad` (Washington DC) o el más cercano
   - PostgreSQL: `No` (ya tienes Supabase)
   - Redis: `No`

5. **Configurar Variables de Entorno**
   ```bash
   fly secrets set NEXT_PUBLIC_SUPABASE_URL="https://astjjzexwigycsfzcfon.supabase.co"
   fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_anon_key"
   fly secrets set SUPABASE_SERVICE_ROLE_KEY="tu_service_role_key"
   fly secrets set RESEND_API_KEY="re_tu_api_key"
   fly secrets set RESEND_FROM_EMAIL="ganador@subasport.com"
   ```

6. **Deploy**
   ```bash
   fly deploy
   ```

7. **Abrir en navegador**
   ```bash
   fly open
   ```

---

## 4️⃣ Vercel (Ya Configurado)

Si Vercel funciona, es la mejor opción. Si sigue fallando, usa Railway o Render.

---

## 🔐 Variables de Entorno (Para Todas las Plataformas)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://astjjzexwigycsfzcfon.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdGpqemV4d2lneWNzZnpjZm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDAyODgsImV4cCI6MjA3MDg3NjI4OH0.JgrYxcCe9FmN-QjJ_6r9pXcrB6KAJRPX1KrKx35HZI4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdGpqemV4d2lneWNzZnpjZm9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTMwMDI4OCwiZXhwIjoyMDcwODc2Mjg4fQ.Q3cUjq-kD7JUqjkvHSloEOjH-Tii4eJYOHABtgoAHIU
RESEND_API_KEY=re_MCJrCUhK_HrjPQVAkLzVBhT6wTcpKSdRF
RESEND_FROM_EMAIL=ganador@subasport.com
```

---

## 📝 Recomendación Final

**Para tu caso, recomiendo este orden:**

1. **Railway** (más fácil y confiable)
2. **Render** (completamente gratis)
3. **Vercel** (si funciona, es perfecto)
4. **Fly.io** (si quieres más control)

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs de la plataforma
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que Supabase esté accesible

---

## ✅ Checklist Post-Deployment

- [ ] Sitio accesible en la URL
- [ ] Login funciona
- [ ] Crear subasta funciona
- [ ] Pujar funciona
- [ ] Compra inmediata funciona
- [ ] Emails se envían (si Resend está configurado)
- [ ] Imágenes se cargan correctamente
