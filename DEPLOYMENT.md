# 🚀 Guía de Deployment - Subasport

## 📋 Requisitos Previos

- Node.js 18 o superior
- Cuenta en Supabase (base de datos)
- Cuenta en Resend (emails) - Opcional

## 🌐 Opciones de Deployment

### Opción 1: Netlify (Recomendado - Más Fácil)

1. **Conectar Repositorio**:
   - Ve a https://app.netlify.com
   - Click en "Add new site" → "Import an existing project"
   - Conecta tu repositorio de GitHub/GitLab

2. **Configurar Build**:
   - Build command: `npm install --legacy-peer-deps && npm run build`
   - Publish directory: `.next`
   - Node version: `18`

3. **Variables de Entorno**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   RESEND_API_KEY=re_tu_api_key
   RESEND_FROM_EMAIL=ganador@subasport.com
   ```

4. **Deploy**: Click en "Deploy site"

---

### Opción 2: Vercel (Muy Fácil)

1. **Conectar Repositorio**:
   - Ve a https://vercel.com
   - Click en "Add New" → "Project"
   - Importa tu repositorio

2. **Configuración Automática**:
   - Vercel detecta Next.js automáticamente
   - Solo agrega las variables de entorno

3. **Variables de Entorno** (mismas que Netlify)

4. **Deploy**: Click en "Deploy"

---

### Opción 3: Railway (Fácil)

1. **Crear Proyecto**:
   - Ve a https://railway.app
   - Click en "New Project" → "Deploy from GitHub repo"

2. **Configurar**:
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Start Command: `npm start`

3. **Variables de Entorno** (mismas que Netlify)

4. **Deploy**: Railway lo hace automáticamente

---

### Opción 4: Render (Fácil)

1. **Crear Web Service**:
   - Ve a https://render.com
   - Click en "New" → "Web Service"
   - Conecta tu repositorio

2. **Configurar**:
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Variables de Entorno** (mismas que Netlify)

4. **Deploy**: Click en "Create Web Service"

---

### Opción 5: VPS/Servidor Propio (Avanzado)

#### A. Preparar el Build Localmente

```bash
# 1. Ejecutar script de deployment
./deploy.sh

# 2. Comprimir
tar -czf subastando-production.tar.gz dist-production/

# 3. Subir al servidor
scp subastando-production.tar.gz usuario@servidor.com:/home/usuario/
```

#### B. En el Servidor

```bash
# 1. Descomprimir
tar -xzf subastando-production.tar.gz
cd dist-production

# 2. Configurar .env
cp .env.example .env
nano .env  # Editar con tus credenciales

# 3. Instalar PM2
npm install -g pm2

# 4. Iniciar aplicación
pm2 start server.js --name "subastando"
pm2 save
pm2 startup  # Seguir instrucciones

# 5. Configurar Nginx (opcional)
sudo nano /etc/nginx/sites-available/subastando
```

**Configuración Nginx**:
```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/subastando /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 Variables de Entorno Requeridas

| Variable | Descripción | Dónde Obtenerla |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | https://supabase.com/dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/Public key de Supabase | https://supabase.com/dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase | https://supabase.com/dashboard → Settings → API |
| `RESEND_API_KEY` | API key de Resend | https://resend.com/api-keys |
| `RESEND_FROM_EMAIL` | Email desde el que se envían notificaciones | Configurado en Resend |

---

## 🐛 Solución de Problemas

### Error: "ERESOLVE unable to resolve dependency tree"

**Solución**: Asegúrate de que existe el archivo `.npmrc` con:
```
legacy-peer-deps=true
```

### Error: "Module not found"

**Solución**: Ejecuta:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Error: "Port 3000 already in use"

**Solución**:
```bash
# Encontrar proceso
lsof -ti:3000

# Matar proceso
kill -9 $(lsof -ti:3000)
```

### Emails no se envían

**Solución**:
1. Verifica que `RESEND_API_KEY` esté configurada
2. Verifica el dominio en https://resend.com/domains
3. Revisa los logs del servidor

---

## 📊 Monitoreo

### Con PM2 (VPS)
```bash
pm2 status          # Ver estado
pm2 logs subastando # Ver logs en tiempo real
pm2 monit           # Monitor interactivo
```

### En Plataformas Cloud
- Netlify: Functions → Logs
- Vercel: Deployments → [tu deployment] → Logs
- Railway: Deployment → Logs
- Render: Logs (pestaña superior)

---

## 🔄 Actualizar la Aplicación

### En Plataformas Cloud
1. Hacer push a tu repositorio
2. El deployment se hace automáticamente

### En VPS
```bash
# 1. Generar nuevo build
./deploy.sh
tar -czf subastando-production.tar.gz dist-production/

# 2. Subir al servidor
scp subastando-production.tar.gz usuario@servidor.com:/home/usuario/

# 3. En el servidor
cd /home/usuario
tar -xzf subastando-production.tar.gz
cd dist-production
pm2 restart subastando
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que Supabase esté accesible
4. Verifica que el dominio de Resend esté verificado

---

## ✅ Checklist de Deployment

- [ ] Supabase configurado y accesible
- [ ] Variables de entorno configuradas
- [ ] Dominio de Resend verificado (opcional)
- [ ] Build exitoso sin errores
- [ ] Aplicación accesible en el navegador
- [ ] Login funciona correctamente
- [ ] Crear subasta funciona
- [ ] Pujar funciona
- [ ] Emails se envían (si Resend está configurado)
