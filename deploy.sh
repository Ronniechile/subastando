#!/bin/bash

echo "🚀 Preparando build para producción..."

# 1. Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf .next
rm -rf dist-production

# 2. Hacer build con modo standalone
echo "📦 Construyendo aplicación..."
pnpm build

# 3. Crear directorio de distribución
echo "📁 Creando directorio de distribución..."
mkdir -p dist-production

# 4. Copiar archivos necesarios
echo "📋 Copiando archivos..."
cp -r .next/standalone/* dist-production/
cp -r .next/static dist-production/.next/
cp -r public dist-production/

# 5. Copiar package.json, .npmrc y crear .env de ejemplo
cp package.json dist-production/
cp .npmrc dist-production/
echo "# Configurar estas variables en producción
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM_EMAIL=ganador@subasport.com" > dist-production/.env.example

# 6. Crear script de inicio
cat > dist-production/start.sh << 'EOF'
#!/bin/bash
export PORT=3000
export NODE_ENV=production
node server.js
EOF

chmod +x dist-production/start.sh

# 7. Crear README de deployment
cat > dist-production/README.md << 'EOF'
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
EOF

echo ""
echo "✅ Build completado!"
echo ""
echo "📦 Archivos listos en: dist-production/"
echo ""
echo "📝 Próximos pasos:"
echo "1. Comprimir la carpeta: tar -czf subastando-production.tar.gz dist-production/"
echo "2. Subir al servidor"
echo "3. Descomprimir: tar -xzf subastando-production.tar.gz"
echo "4. Configurar .env"
echo "5. Ejecutar: cd dist-production && ./start.sh"
echo ""
