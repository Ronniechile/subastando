# Documentación del Sistema de Subastas - Subastando.com

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [Autenticación y Autorización](#autenticación-y-autorización)
5. [Funcionalidades Principales](#funcionalidades-principales)
6. [Flujo de Trabajo](#flujo-de-trabajo)
7. [Componentes Técnicos](#componentes-técnicos)
8. [API y Acciones del Servidor](#api-y-acciones-del-servidor)
9. [Rutas y Páginas](#rutas-y-páginas)
10. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
11. [Configuración y Despliegue](#configuración-y-despliegue)

---

## Introducción

**Subastando.com** es una plataforma de subastas en línea desarrollada con tecnologías modernas para facilitar la compra y venta de artículos deportivos, específicamente camisetas de equipos.

### Tecnologías Utilizadas

- **Framework**: Next.js 15.2.4 (React 19)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth con soporte para Google OAuth
- **UI**: Radix UI + Tailwind CSS
- **Validación**: Zod + React Hook Form
- **Lenguaje**: TypeScript

---

## Arquitectura del Sistema

### Estructura del Proyecto

```
subastando-main/
├── app/                        # Páginas y rutas (App Router)
│   ├── admin/                  # Panel de administración
│   ├── auction/[id]/          # Detalles de subasta
│   ├── auth/                   # Autenticación de usuarios
│   └── profile/               # Perfil de usuario
├── components/                 # Componentes React reutilizables
│   ├── admin/                 # Componentes del admin
│   ├── auth/                  # Componentes de autenticación
│   └── ui/                    # Componentes de UI base
├── lib/                       # Lógica de negocio
│   ├── actions.ts            # Server Actions
│   ├── types.ts              # Tipos TypeScript
│   └── supabase/             # Configuración Supabase
└── scripts/                   # Scripts SQL de base de datos
```

### Patrón de Arquitectura

El sistema sigue el patrón **Server-Side Rendering (SSR)** con **Server Actions** de Next.js 15:

1. **Cliente → Servidor**: Las acciones del usuario se envían como Server Actions
2. **Servidor → Base de Datos**: Las Server Actions interactúan con Supabase
3. **Base de Datos → Servidor**: Los datos se recuperan y validan
4. **Servidor → Cliente**: Los datos se renderizan en el servidor y se envían al cliente

---

## Base de Datos

### Esquema de Datos

El sistema utiliza **PostgreSQL** a través de Supabase con 4 tablas principales:

#### 1. **profiles** (Perfiles de Usuario)

Extiende la tabla `auth.users` de Supabase:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,              -- Referencia a auth.users(id)
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Almacenar información adicional del usuario más allá de la autenticación básica.

#### 2. **categories** (Categorías)

```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Clasificar las subastas por tipo de camiseta (ej: Camisetas Clásicas, Internacional, etc.)

#### 3. **auctions** (Subastas)

```sql
CREATE TABLE public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  seller_id UUID REFERENCES profiles(id),
  starting_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  buy_now_price DECIMAL(10,2),          -- Precio de compra inmediata
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active',         -- 'active', 'ended', 'cancelled'
  winner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos clave**:
- `starting_price`: Precio inicial de la subasta
- `current_price`: Precio actual (actualizado con cada puja)
- `buy_now_price`: Precio para finalizar la subasta inmediatamente
- `status`: Estado de la subasta (activa, finalizada, cancelada)
- `winner_id`: ID del ganador (se establece al finalizar)

#### 4. **bids** (Pujas)

```sql
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito**: Registrar cada puja realizada en una subasta.

### Índices para Rendimiento

```sql
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);
CREATE INDEX idx_auctions_category ON auctions(category_id);
CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);
```

Estos índices optimizan:
- Búsqueda de subastas activas
- Filtrado por fecha de finalización
- Consultas por categoría
- Historial de pujas por subasta y usuario

### Row Level Security (RLS)

Todas las tablas tienen **RLS habilitado** con políticas específicas:

#### Políticas de profiles:
- **SELECT**: Todos pueden ver perfiles
- **UPDATE**: Los usuarios solo pueden actualizar su propio perfil
- **INSERT**: Los usuarios solo pueden crear su propio perfil

#### Políticas de categories:
- **SELECT**: Todos pueden ver categorías (público)

#### Políticas de auctions:
- **SELECT**: Todos pueden ver subastas
- **INSERT**: Los usuarios autenticados pueden crear subastas
- **UPDATE**: Los vendedores pueden actualizar sus propias subastas

#### Políticas de bids:
- **SELECT**: Todos pueden ver pujas
- **INSERT**: Los usuarios autenticados pueden crear pujas

### Trigger: Creación Automática de Perfil

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Función**: Cuando un usuario se registra, automáticamente se crea un perfil en la tabla `profiles`.

---

## Autenticación y Autorización

### Sistema de Autenticación Dual

El sistema implementa **dos tipos de autenticación**:

#### 1. Autenticación de Usuarios (Supabase Auth)

**Métodos soportados**:
- Email y contraseña
- Google OAuth

**Flujo de autenticación**:

```typescript
// lib/actions.ts - signIn
export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email")
  const password = formData.get("password")
  
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email: email.toString(),
    password: password.toString(),
  })
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath("/", "layout")
  return { success: "Login exitoso" }
}
```

**Google OAuth**:

```typescript
export async function signInWithGoogle() {
  const supabase = createClient()
  const origin = `${protocol}://${host}`
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })
  
  if (data.url) {
    redirect(data.url)
  }
}
```

#### 2. Autenticación de Administrador (Cookie-based)

**Credenciales hardcodeadas**:
- Usuario: `admin`
- Contraseña: `subastando2024`

```typescript
// lib/actions.ts - signInAdmin
export async function signInAdmin(prevState: any, formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")
  
  if (username.toString() === "admin" && password.toString() === "subastando2024") {
    const cookieStore = cookies()
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 horas
    })
    return { success: true }
  }
  
  return { error: "Credenciales incorrectas" }
}
```

### Clientes Supabase

#### createClient (Usuario normal)

```typescript
// lib/supabase/server.ts
export const createClient = cache(() => {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.then((store) => store.getAll()),
        setAll: (cookiesToSet) => {
          cookieStore.then((store) => {
            cookiesToSet.forEach(({ name, value, options }) => 
              store.set(name, value, options)
            )
          })
        },
      },
    }
  )
})
```

**Uso**: Para operaciones que requieren autenticación de usuario, respeta RLS.

#### createServiceClient (Administrador)

```typescript
export const createServiceClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

**Uso**: Para operaciones administrativas que necesitan bypass de RLS.

### Middleware de Autenticación

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Actualiza la sesión del usuario en cada request
  const { supabase, response } = await updateSession(request)
  return response
}
```

---

## Funcionalidades Principales

### 1. Sistema de Pujas

#### Proceso de Puja Normal

```typescript
// lib/actions.ts - placeBid
export async function placeBid(prevState: any, formData: FormData) {
  const auctionId = formData.get("auctionId")
  const userId = formData.get("userId")
  const amount = formData.get("amount")
  
  // Validaciones:
  // 1. Verificar que la subasta existe y está activa
  const { data: auction } = await supabase
    .from("auctions")
    .select("*")
    .eq("id", auctionId)
    .eq("status", "active")
    .single()
  
  // 2. Verificar que no ha finalizado
  if (new Date(auction.end_time) <= new Date()) {
    return { error: "Esta subasta ya ha finalizado" }
  }
  
  // 3. Verificar que el usuario no es el vendedor
  if (auction.seller_id === userId) {
    return { error: "No puedes pujar en tu propia subasta" }
  }
  
  // 4. Verificar que la puja es mayor al precio actual
  const currentPrice = auction.current_price
  if (bidAmount <= currentPrice) {
    return { error: `Tu puja debe ser mayor a $${currentPrice}` }
  }
  
  // 5. Insertar la puja
  await supabase.from("bids").insert({
    auction_id: auctionId,
    bidder_id: userId,
    amount: bidAmount,
  })
  
  // 6. Actualizar precio actual de la subasta
  await supabase
    .from("auctions")
    .update({ current_price: bidAmount })
    .eq("id", auctionId)
  
  return { success: "¡Puja realizada exitosamente!" }
}
```

#### Compra Inmediata (Buy Now)

```typescript
// Dentro de placeBid
if (auction.buy_now_price && bidAmount >= auction.buy_now_price) {
  // Insertar puja ganadora
  await supabase.from("bids").insert({
    auction_id: auctionId,
    bidder_id: userId,
    amount: bidAmount,
  })
  
  // Finalizar subasta inmediatamente
  await supabase
    .from("auctions")
    .update({
      current_price: bidAmount,
      status: "ended",
      end_time: new Date().toISOString(),
    })
    .eq("id", auctionId)
  
  // Enviar notificación por email
  await sendAuctionEndEmail(
    auction.title,
    bidder.email,
    bidder.full_name,
    bidAmount,
    auctionId
  )
  
  return { 
    success: "¡Felicidades! Has ganado la subasta con compra inmediata!" 
  }
}
```

### 2. Creación de Subastas

```typescript
// lib/actions.ts - createAuction
export async function createAuction(prevState: any, formData: FormData) {
  const userId = formData.get("userId")
  const title = formData.get("title")
  const description = formData.get("description")
  const startingPrice = formData.get("startingPrice")
  const buyNowPrice = formData.get("buyNowPrice")
  
  // Validaciones
  if (!title || !description || !startingPrice) {
    return { error: "Todos los campos obligatorios deben ser completados" }
  }
  
  // Validar precios
  const startingPriceNum = parseFloat(startingPrice)
  if (isNaN(startingPriceNum) || startingPriceNum <= 0) {
    return { error: "El precio inicial debe ser mayor a 0" }
  }
  
  let buyNowPriceNum = null
  if (buyNowPrice) {
    buyNowPriceNum = parseFloat(buyNowPrice)
    if (buyNowPriceNum <= startingPriceNum) {
      return { 
        error: "El precio de compra inmediata debe ser mayor al precio inicial" 
      }
    }
  }
  
  // Calcular tiempo de finalización (24 horas)
  const endTime = new Date()
  endTime.setHours(endTime.getHours() + 24)
  
  // Crear subasta
  const { data: auction, error } = await supabase
    .from("auctions")
    .insert({
      seller_id: userId,
      title: title,
      description: description,
      starting_price: startingPriceNum,
      current_price: startingPriceNum,
      buy_now_price: buyNowPriceNum,
      end_time: endTime.toISOString(),
      status: "active",
    })
    .select()
    .single()
  
  revalidatePath("/")
  return { success: "Subasta creada exitosamente" }
}
```

### 3. Finalización de Subastas

#### Por Tiempo

```typescript
async function finalizeAuctionByTime(auctionId: string) {
  // Obtener detalles de la subasta
  const { data: auction } = await supabase
    .from("auctions")
    .select(`
      *,
      bids (
        amount,
        bidder_id,
        profiles (email, full_name)
      )
    `)
    .eq("id", auctionId)
    .eq("status", "active")
    .single()
  
  // Verificar que el tiempo ha expirado
  if (new Date(auction.end_time) > new Date()) {
    return false
  }
  
  // Actualizar estado
  await supabase
    .from("auctions")
    .update({
      status: "ended",
      end_time: new Date().toISOString(),
    })
    .eq("id", auctionId)
  
  // Si hay pujas, enviar email al ganador
  if (auction.bids && auction.bids.length > 0) {
    const highestBid = auction.bids.reduce((max, bid) => 
      bid.amount > max.amount ? bid : max
    )
    
    await sendAuctionEndEmail(
      auction.title,
      highestBid.profiles.email,
      highestBid.profiles.full_name,
      highestBid.amount,
      auctionId
    )
  }
  
  return true
}
```

### 4. Gestión de Categorías

```typescript
// Crear categoría
export async function createCategory(name: string, description?: string) {
  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
    })
    .select()
    .single()
  
  revalidatePath("/admin/dashboard")
  return category
}

// Eliminar categoría
export async function deleteCategory(categoryId: string) {
  // Verificar que no tiene subastas asociadas
  const { data: auctions } = await supabase
    .from("auctions")
    .select("id")
    .eq("category_id", categoryId)
    .limit(1)
  
  if (auctions && auctions.length > 0) {
    throw new Error("No se puede eliminar una categoría con subastas")
  }
  
  await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
  
  revalidatePath("/admin/dashboard")
  return { success: true }
}
```

### 5. Perfil de Usuario

El sistema permite a los usuarios ver:

#### Subastas Creadas

```typescript
export async function getUserAuctions(userId: string) {
  const { data: auctions } = await supabase
    .from("auctions")
    .select(`
      *,
      categories (id, name),
      bids (
        amount,
        bidder_id,
        profiles (email, full_name)
      )
    `)
    .eq("seller_id", userId)
    .order("created_at", { ascending: false })
  
  // Agregar información del ganador
  const auctionsWithWinners = auctions?.map((auction) => {
    let winner = null
    if (auction.status === "ended" && auction.bids.length > 0) {
      const highestBid = auction.bids.reduce((max, bid) => 
        bid.amount > max.amount ? bid : max
      )
      winner = {
        bidder_id: highestBid.bidder_id,
        amount: highestBid.amount,
        email: highestBid.profiles.email,
        full_name: highestBid.profiles.full_name,
      }
    }
    return { ...auction, winner }
  })
  
  return auctionsWithWinners
}
```

#### Pujas Realizadas

```typescript
export async function getUserBids(userId: string) {
  const { data: bids } = await supabase
    .from("bids")
    .select(`
      *,
      auctions (
        id,
        title,
        image_url,
        end_time,
        status,
        current_price,
        bids (amount, bidder_id)
      )
    `)
    .eq("bidder_id", userId)
    .order("created_at", { ascending: false })
  
  // Determinar si el usuario ganó cada subasta
  const bidsWithStatus = bids?.map((bid) => {
    let isWinner = false
    
    if (bid.auctions?.status === "ended" && bid.auctions.bids.length > 0) {
      const highestBid = bid.auctions.bids.reduce((max, b) => 
        b.amount > max.amount ? b : max
      )
      isWinner = highestBid.bidder_id === userId
    }
    
    return { ...bid, isWinner }
  })
  
  return bidsWithStatus
}
```

---

## Flujo de Trabajo

### Flujo Completo de una Subasta

```
1. Vendedor crea subasta
   ↓
2. Sistema guarda en BD (tabla auctions)
   ↓
3. Subasta aparece en página principal
   ↓
4. Usuarios ven subasta activa
   ↓
5. Usuario realiza puja
   ├─→ Si es puja normal:
   │   ├─→ Sistema valida puja
   │   ├─→ Guarda en BD (tabla bids)
   │   ├─→ Actualiza current_price
   │   └─→ Verifica si alcanza buy_now_price
   │
   └─→ Si alcanza buy_now_price:
       ├─→ Finaliza subasta inmediatamente
       ├─→ Marca status como "ended"
       ├─→ Envía email al ganador
       └─→ FIN
   ↓
6. Continúa subasta hasta que:
   - Tiempo expire (24 horas), o
   - Alguien pague buy_now_price
   ↓
7. Finalizar subasta
   ├─→ Marca status como "ended"
   ├─→ Identifica ganador (puja más alta)
   ├─→ Envía email al ganador
   └─→ Actualiza winner_id
```

### Flujo de Autenticación de Usuario

```
1. Usuario visita sitio
   ↓
2. ¿Está autenticado?
   ├─→ NO: Puede ver subastas (sin pujar)
   │   └─→ ¿Quiere pujar?
   │       └─→ Redirige a /auth/login
   │           ├─→ Login con email/password
   │           └─→ Login con Google OAuth
   │               └─→ Callback: /auth/callback
   │                   └─→ Trigger crea perfil automáticamente
   │
   └─→ SÍ: Puede pujar y crear subastas
       └─→ Session almacenada en cookies
```

### Flujo de Administrador

```
1. Accede a /admin/login
   ↓
2. Ingresa credenciales (admin/subastando2024)
   ↓
3. Sistema valida
   ├─→ Incorrecto: Muestra error
   └─→ Correcto: Crea cookie "admin_session"
       ↓
4. Accede a /admin/dashboard
   ├─→ Tab: Crear Subasta
   │   └─→ Puede crear sin restricciones
   │
   ├─→ Tab: Gestionar Subastas
   │   ├─→ Ver todas las subastas
   │   ├─→ Editar subastas
   │   └─→ Eliminar subastas (si no tienen pujas)
   │
   └─→ Tab: Categorías
       ├─→ Crear categorías
       └─→ Eliminar categorías (si no tienen subastas)
```

---

## Componentes Técnicos

### Tipos TypeScript

```typescript
// lib/types.ts

export interface Auction {
  id: string
  title: string
  description: string
  image_url: string | null
  category_id: string | null
  seller_id: string
  starting_price: number
  current_price: number
  buy_now_price: number | null
  start_time: string
  end_time: string
  status: "active" | "ended" | "cancelled"
  winner_id: string | null
  created_at: string
  updated_at: string
  bids?: Bid[]
  categories?: Category
}

export interface Bid {
  id: string
  auction_id: string
  bidder_id: string
  amount: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}
```

---

## API y Acciones del Servidor

El sistema utiliza **Server Actions** de Next.js para toda la lógica del servidor. Estas son funciones asíncronas marcadas con `"use server"` que se ejecutan en el servidor.

### Listado Completo de Acciones

#### Autenticación

| Función | Descripción | Parámetros | Retorno |
|---------|-------------|------------|---------|
| `signIn()` | Login con email/password | email, password | success/error |
| `signUp()` | Registro de nuevo usuario | email, password | success/error |
| `signInWithGoogle()` | Login con Google OAuth | - | redirect a OAuth |
| `signUpWithGoogle()` | Registro con Google OAuth | - | redirect a OAuth |
| `signOut()` | Cerrar sesión usuario | - | redirect a /auth/login |
| `signInAdmin()` | Login administrador | username, password | success/error |
| `signOutAdmin()` | Cerrar sesión admin | - | redirect a /admin/login |

#### Subastas

| Función | Descripción | Parámetros | Retorno |
|---------|-------------|------------|---------|
| `getActiveAuctions()` | Obtener subastas activas | - | Auction[] |
| `getAuctionById()` | Obtener subasta por ID | auctionId | Auction |
| `createAuction()` | Crear nueva subasta | FormData | success/error |
| `editAuctionAdmin()` | Editar subasta (admin) | FormData | success/error |
| `deleteAuctionAdmin()` | Eliminar subasta (admin) | auctionId | success/error |
| `finalizeAuctionByTime()` | Finalizar por tiempo | auctionId | boolean |
| `finalizeAuctionByBuyNowPrice()` | Finalizar por buy now | auctionId, buyerId | boolean |

#### Pujas

| Función | Descripción | Parámetros | Retorno |
|---------|-------------|------------|---------|
| `placeBid()` | Realizar puja | auctionId, userId, amount | success/error |

#### Categorías

| Función | Descripción | Parámetros | Retorno |
|---------|-------------|------------|---------|
| `getCategories()` | Obtener todas las categorías | - | Category[] |
| `createCategory()` | Crear categoría | name, description | Category |
| `deleteCategory()` | Eliminar categoría | categoryId | success/error |

#### Usuarios

| Función | Descripción | Parámetros | Retorno |
|---------|-------------|------------|---------|
| `getUserProfile()` | Obtener perfil | userId | Profile |
| `getUserAuctions()` | Subastas del usuario | userId | Auction[] |
| `getUserBids()` | Pujas del usuario | userId | Bid[] |

### Revalidación de Caché

El sistema utiliza `revalidatePath()` para actualizar el caché de Next.js después de cambios:

```typescript
// Después de crear/editar/eliminar una subasta
revalidatePath("/")
revalidatePath("/admin/dashboard")
revalidatePath(`/auction/${auctionId}`)

// Después de gestionar categorías
revalidatePath("/admin/dashboard")
revalidatePath("/create-auction")
```

---

## Rutas y Páginas

### Rutas Públicas

| Ruta | Descripción | Autenticación |
|------|-------------|---------------|
| `/` | Página principal con subastas activas | No requerida |
| `/auction/[id]` | Detalle de subasta individual | No requerida |
| `/auth/login` | Inicio de sesión | No requerida |
| `/auth/sign-up` | Registro de usuario | No requerida |
| `/auth/callback` | Callback OAuth | No requerida |

### Rutas Protegidas (Usuario)

| Ruta | Descripción | Autenticación |
|------|-------------|---------------|
| `/profile` | Perfil del usuario | Usuario autenticado |

### Rutas Protegidas (Admin)

| Ruta | Descripción | Autenticación |
|------|-------------|---------------|
| `/admin/login` | Login administrador | No requerida |
| `/admin/dashboard` | Panel de administración | Cookie admin_session |

### Protección de Rutas

```typescript
// app/admin/dashboard/page.tsx
export default async function AdminDashboardPage() {
  const cookieStore = cookies()
  const adminSession = (await cookieStore).get("admin_session")

  if (!adminSession) {
    redirect("/admin/login")
  }

  return <AdminDashboard />
}
```

---

## Consideraciones de Seguridad

### 1. Row Level Security (RLS)

**✓ Implementado**: Todas las tablas tienen RLS habilitado con políticas específicas.

**Beneficios**
