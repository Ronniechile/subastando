# 🌐 Configuración del Dominio Subasport.com

## Pasos para Configurar el Dominio

### 1. Configurar DNS en tu Proveedor de Dominio

Agrega los siguientes registros DNS según tu plataforma de hosting:

#### Para Netlify:
```
Tipo: A
Nombre: @
Valor: 75.2.60.5

Tipo: CNAME
Nombre: www
Valor: [tu-sitio].netlify.app
```

#### Para Vercel:
```
Tipo: A
Nombre: @
Valor: 76.76.21.21

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

### 2. Configurar en Netlify

1. Ve a tu sitio en Netlify Dashboard
2. **Domain settings** → **Add custom domain**
3. Ingresa: `subasport.com`
4. Sigue las instrucciones para verificar el dominio
5. Habilita **HTTPS** (automático con Let's Encrypt)

### 3. Configurar en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. **Settings** → **Domains**
3. Agrega: `subasport.com` y `www.subasport.com`
4. Vercel configurará automáticamente SSL

### 4. Actualizar Variables de Entorno

Actualiza las siguientes variables en tu plataforma de hosting:

```env
NEXT_PUBLIC_SITE_URL=https://subasport.com
RESEND_FROM_EMAIL=ganador@subasport.com
```

### 5. Verificar Email en Resend

1. Ve a [Resend Dashboard](https://resend.com/domains)
2. Agrega el dominio `subasport.com`
3. Configura los registros DNS para verificación:
   - SPF
   - DKIM
   - DMARC
4. Verifica el dominio
5. Actualiza `RESEND_FROM_EMAIL` a `ganador@subasport.com`

### 6. Reiniciar el Servidor

Después de actualizar las variables de entorno:
- **Netlify**: Trigger deploy → Clear cache and deploy site
- **Vercel**: Redeploy automático al hacer push

### 7. Verificación Final

- [ ] El sitio carga en `https://subasport.com`
- [ ] El sitio carga en `https://www.subasport.com`
- [ ] SSL está activo (candado verde)
- [ ] Los emails se envían desde `@subasport.com`
- [ ] No hay errores en la consola

---

## Notas Importantes

- La propagación DNS puede tardar hasta 48 horas
- Usa [whatsmydns.net](https://www.whatsmydns.net/) para verificar la propagación
- Mantén el dominio anterior activo durante la transición si es necesario

## Soporte

Si tienes problemas:
1. Verifica los registros DNS
2. Revisa los logs del servidor
3. Contacta al soporte de tu proveedor de hosting
