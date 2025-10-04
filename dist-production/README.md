# Deployment Instructions

## Requisitos del Servidor
- Node.js 18 o superior
- PM2 (recomendado para producción)

## Instalación

1. Subir esta carpeta al servidor
2. Configurar variables de entorno en `.env`
3. Instalar PM2 (opcional pero recomendado):
   ```bash
   npm install -g pm2
   ```

## Iniciar la Aplicación

### Opción 1: Con PM2 (Recomendado)
```bash
pm2 start server.js --name "subastando"
pm2 save
pm2 startup
```

### Opción 2: Directamente con Node
```bash
PORT=3000 NODE_ENV=production node server.js
```

### Opción 3: Con el script de inicio
```bash
./start.sh
```

## Configurar Nginx (Opcional)

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

## Variables de Entorno Requeridas

Copia `.env.example` a `.env` y configura:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY
- RESEND_FROM_EMAIL

## Verificar que está corriendo

```bash
curl http://localhost:3000
```

## Logs con PM2

```bash
pm2 logs subastando
```

## Reiniciar

```bash
pm2 restart subastando
```
