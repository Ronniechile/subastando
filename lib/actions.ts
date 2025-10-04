"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

async function sendAuctionEndEmail(
  auctionTitle: string,
  winnerEmail: string,
  winnerName: string,
  finalPrice: number,
  auctionId: string,
) {
  try {
    console.log("[v0] Sending auction end email to globaliachile@gmail.com")
    console.log("[v0] Winner details - Name:", winnerName, "Email:", winnerEmail)

    const emailData = {
      to: "globaliachile@gmail.com",
      subject: `🎉 Subasta Finalizada: ${auctionTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 5px; }
            .label { font-weight: bold; color: #667eea; }
            .value { color: #333; margin-left: 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .winner-badge { background: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏆 ¡Subasta Finalizada!</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>Te informamos que la siguiente subasta ha finalizado:</p>
              
              <div class="info-box">
                <p><span class="label">📦 Título:</span><span class="value">${auctionTitle}</span></p>
              </div>
              
              <div class="info-box">
                <p><span class="label">👤 Ganador:</span><span class="value">${winnerName}</span></p>
                <p><span class="label">📧 Email:</span><span class="value">${winnerEmail}</span></p>
              </div>
              
              <div class="info-box">
                <p><span class="label">💰 Precio Final:</span><span class="value">$${finalPrice.toFixed(2)}</span></p>
              </div>
              
              <div class="info-box">
                <p><span class="label">🆔 ID Subasta:</span><span class="value">${auctionId}</span></p>
                <p><span class="label">📅 Fecha:</span><span class="value">${new Date().toLocaleString("es-ES", { 
                  dateStyle: "full", 
                  timeStyle: "short" 
                })}</span></p>
              </div>
              
              <p style="margin-top: 20px;">Puedes contactar al ganador para coordinar la entrega.</p>
              
              <div class="footer">
                <p>Este correo fue enviado automáticamente por el Sistema de Subastas</p>
                <p>© ${new Date().getFullYear()} Subastando.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    // Intentar enviar con Resend si está configurado
    if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] ✅ Email sent successfully via Resend!")
          console.log("[v0] Email ID:", data.id)
          console.log("[v0] Check inbox at: globaliachile@gmail.com")
          return true
        } else {
          const errorText = await response.text()
          console.error("[v0] ❌ Resend API error - Status:", response.status)
          console.error("[v0] ❌ Error response:", errorText)
          
          // Intentar parsear el error como JSON
          try {
            const errorJson = JSON.parse(errorText)
            console.error("[v0] ❌ Error details:", errorJson)
            
            // Si el error es por dominio no verificado, dar instrucciones
            if (errorText.includes("not verified") || errorText.includes("domain")) {
              console.error("[v0] 🔧 SOLUCIÓN: Necesitas verificar el email de destino en Resend")
              console.error("[v0] 🔧 Ve a: https://resend.com/emails")
              console.error("[v0] 🔧 O cambia RESEND_FROM_EMAIL a un dominio verificado")
            }
          } catch (e) {
            // Si no es JSON, mostrar el texto tal cual
          }
        }
      } catch (error) {
        console.error("[v0] Error calling Resend API:", error)
      }
    }

    // Fallback: solo loguear si no hay API key configurada o si falló el envío
    console.log("[v0] ⚠️  Email NOT sent via Resend (check errors above)")
    console.log("[v0] 📧 Email would have been sent to:", emailData.to)
    console.log("[v0] 📝 Subject:", emailData.subject)
    console.log("[v0] 👤 Winner:", winnerName, "-", winnerEmail)
    console.log("[v0] 💰 Final Price: $" + finalPrice.toFixed(2))
    console.log("[v0] 🆔 Auction ID:", auctionId)
    console.log("[v0] ")
    console.log("[v0] 🔧 To fix 'domain not found' error:")
    console.log("[v0] 1. Go to https://resend.com/domains")
    console.log("[v0] 2. Add and verify your domain OR")
    console.log("[v0] 3. Add globaliachile@gmail.com as a verified email")
    console.log("[v0] 4. Or use a different email service")

    return true
  } catch (error) {
    console.error("[v0] Error sending auction end email:", error)
    return false
  }
}

async function finalizeAuctionByTime(auctionId: string) {
  const supabase = createServiceClient()

  try {
    console.log("[v0] Finalizing auction by time:", auctionId)

    // Get auction details with bids and winner info
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select(`
        *,
        bids (
          amount,
          bidder_id,
          profiles (
            email,
            full_name
          )
        )
      `)
      .eq("id", auctionId)
      .eq("status", "active")
      .single()

    if (auctionError || !auction) {
      console.error("[v0] Auction not found or not active:", auctionError)
      return false
    }

    // Check if auction time has actually expired
    if (new Date(auction.end_time) > new Date()) {
      console.log("[v0] Auction time has not expired yet")
      return false
    }

    // Update auction status to ended
    const { error: updateError } = await supabase
      .from("auctions")
      .update({
        status: "ended",
        end_time: new Date().toISOString(),
      })
      .eq("id", auctionId)

    if (updateError) {
      console.error("[v0] Error updating auction status:", updateError)
      return false
    }

    // Send email if there are bids
    if (auction.bids && auction.bids.length > 0) {
      // Find the highest bid (winner)
      const highestBid = auction.bids.reduce((max, bid) => (bid.amount > max.amount ? bid : max))
      const winner = highestBid.profiles

      if (winner) {
        await sendAuctionEndEmail(
          auction.title,
          winner.email,
          winner.full_name || winner.email,
          highestBid.amount,
          auctionId,
        )
      }
    }

    console.log("[v0] Auction finalized successfully by time")
    return true
  } catch (error) {
    console.error("[v0] Error finalizing auction by time:", error)
    return false
  }
}

async function finalizeAuctionByBuyNowPrice(auctionId: string, buyerId: string) {
  const supabase = createServiceClient()

  try {
    console.log("[v0] Finalizing auction by Buy Now Price:", auctionId)

    // Get auction details
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select(`
        *,
        bids (
          amount,
          bidder_id,
          profiles (
            email,
            full_name
          )
        )
      `)
      .eq("id", auctionId)
      .eq("status", "active")
      .single()

    if (auctionError || !auction) {
      console.error("[v0] Auction not found or not active:", auctionError)
      return false
    }

    // Update auction status to ended and set the winner
    const { error: updateError } = await supabase
      .from("auctions")
      .update({
        status: "ended",
        end_time: new Date().toISOString(),
        winner_id: buyerId,
      })
      .eq("id", auctionId)

    if (updateError) {
      console.error("[v0] Error updating auction status:", updateError)
      return false
    }

    // Notify the buyer
    const buyerProfile = auction.bids.find((bid) => bid.bidder_id === buyerId)?.profiles
    if (buyerProfile) {
      await sendAuctionEndEmail(
        auction.title,
        buyerProfile.email,
        buyerProfile.full_name || buyerProfile.email,
        auction.buy_now_price ?? auction.current_price,
        auctionId,
      )
    }

    console.log("[v0] Auction finalized successfully by Buy Now Price.")
    return true
  } catch (error) {
    console.error("[v0] Error finalizing auction by Buy Now Price:", error)
    return false
  }
}

export async function getCategories() {
  const supabase = createServiceClient()

  try {
    console.log("[v0] Fetching categories...")
    const { data: categories, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("[v0] Error fetching categories:", error)
      throw new Error("Error al cargar las categorías")
    }

    console.log("[v0] Categories fetched successfully:", categories?.length || 0)
    return categories || []
  } catch (error) {
    console.error("[v0] Get categories error:", error)
    throw new Error("Error al cargar las categorías")
  }
}

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()

  try {
    console.log("[v0] Attempting sign in for email:", email)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      console.error("[v0] Sign in error:", error)
      return { error: error.message }
    }

    console.log("[v0] Sign in successful")
    revalidatePath("/", "layout")
    return { success: "Login exitoso" }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "http"
  const origin = `${protocol}://${host}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Google sign in error:", error)
    return
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUpWithGoogle() {
  const supabase = await createClient()

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "http"
  const origin = `${protocol}://${host}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Google sign up error:", error)
    return
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/auth/login")
}

export async function signInAdmin(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const username = formData.get("username")
  const password = formData.get("password")

  if (!username || !password) {
    return { error: "Usuario y contraseña son requeridos" }
  }

  // Simple admin credentials check
  if (username.toString() === "admin" && password.toString() === "subastando2024") {
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
    })
    return { success: true }
  }

  return { error: "Credenciales de administrador incorrectas" }
}

export async function signOutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/admin/login")
}

export async function placeBid(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const auctionId = formData.get("auctionId")
  const userId = formData.get("userId")
  const amount = formData.get("amount")

  // Validate required fields
  if (!auctionId || !userId || !amount) {
    return { error: "Todos los campos son requeridos" }
  }

  const bidAmount = Number.parseFloat(amount.toString())
  if (isNaN(bidAmount) || bidAmount <= 0) {
    return { error: "El monto de la puja debe ser un número válido" }
  }

  const supabase = await createClient()
  
  console.log("[v0] Creating service client for bid operation...")
  const supabaseService = createServiceClient()
  console.log("[v0] Service client created:", !!supabaseService)

  try {
    // Get current auction details with seller and bidder info
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select(`
        *,
        bids(amount),
        buy_now_price,
        profiles!auctions_seller_id_fkey (
          email,
          full_name
        )
      `)
      .eq("id", auctionId)
      .eq("status", "active")
      .single()

    if (auctionError || !auction) {
      return { error: "Subasta no encontrada o no está activa" }
    }

    // Check if auction is still active
    if (new Date(auction.end_time) <= new Date()) {
      return { error: "Esta subasta ya ha finalizado" }
    }

    // Check if user is not the seller
    if (auction.seller_id === userId) {
      return { error: "No puedes pujar en tu propia subasta" }
    }

    // Get current highest bid
    const currentPrice =
      auction.bids.length > 0 ? Math.max(...auction.bids.map((bid: any) => bid.amount)) : auction.starting_price

    // Validate bid amount
    if (bidAmount <= currentPrice) {
      return { error: `Tu puja debe ser mayor a $${currentPrice.toFixed(2)}` }
    }

    console.log("[DEBUG] Auction details:", auction);
    console.log("[DEBUG] Bid amount:", bidAmount);
    console.log("[DEBUG] Buy Now Price:", auction.buy_now_price);

    if (auction.buy_now_price && bidAmount >= auction.buy_now_price) {
      console.log("[v0] Buy now price reached! Finalizing auction immediately")

      // Get bidder info for email
      const { data: bidder, error: bidderError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single()

      if (bidderError) {
        console.error("[v0] Error fetching bidder info:", bidderError)
      }

      // Place the winning bid using service client to bypass RLS
      const { error: bidError } = await supabaseService.from("bids").insert({
        auction_id: auctionId,
        bidder_id: userId,
        amount: bidAmount,
      })

      if (bidError) {
        console.error("Error placing winning bid:", bidError)
        return { error: "Error al realizar la puja. Inténtalo de nuevo." }
      }

      // Finalize the auction immediately using service client to bypass RLS
      console.log("[v0] Updating auction to ended status...")
      console.log("[v0] Auction ID:", auctionId)
      console.log("[v0] User ID (winner):", userId)
      
      const updateData = {
        current_price: bidAmount,
        status: "ended" as const,
        end_time: new Date().toISOString(),
        winner_id: userId,
      }
      console.log("[v0] Update data:", JSON.stringify(updateData, null, 2))
      
      try {
        const { data: updatedAuction, error: finalizeError } = await supabaseService
          .from("auctions")
          .update(updateData)
          .eq("id", auctionId)
          .select()

        if (finalizeError) {
          console.error("[v0] Error finalizing auction - Full error:", JSON.stringify(finalizeError, null, 2))
          console.error("[v0] Error code:", finalizeError.code)
          console.error("[v0] Error message:", finalizeError.message)
          console.error("[v0] Error details:", finalizeError.details)
          console.error("[v0] Error hint:", finalizeError.hint)
          return { error: `Error al finalizar la subasta: ${finalizeError.message}` }
        }

        console.log("[v0] Auction updated successfully:", JSON.stringify(updatedAuction, null, 2))
      } catch (e) {
        console.error("[v0] Exception during update:", e)
        return { error: `Excepción al finalizar: ${e}` }
      }

      // Send email notification
      if (bidder) {
        await sendAuctionEndEmail(
          auction.title,
          bidder.email,
          bidder.full_name || bidder.email,
          bidAmount,
          auctionId.toString(),
        )
      }

      console.log("[v0] Auction finalized! Winner:", userId, "Amount:", bidAmount)
      console.log("[v0] Revalidating paths...")

      revalidatePath(`/auction/${auctionId}`)
      revalidatePath("/")

      console.log("[v0] Paths revalidated, returning success message")
      return { success: `¡Felicidades! Has ganado la subasta por $${bidAmount.toFixed(2)} con compra inmediata!` }
    }

    // Place the bid using service client
    const { error: bidError } = await supabaseService.from("bids").insert({
      auction_id: auctionId,
      bidder_id: userId,
      amount: bidAmount,
    })

    if (bidError) {
      console.error("Error placing bid:", bidError)
      return { error: "Error al realizar la puja. Inténtalo de nuevo." }
    }

    // Update auction current price using service client to bypass RLS
    const { error: updateError } = await supabaseService
      .from("auctions")
      .update({ current_price: bidAmount })
      .eq("id", auctionId)

    if (updateError) {
      console.error("Error updating auction price:", updateError)
    }

    // Revalidate the auction page to show new bid
    revalidatePath(`/auction/${auctionId}`)

    return { success: `¡Puja realizada exitosamente por $${bidAmount.toFixed(2)}!` }
  } catch (error) {
    console.error("Place bid error:", error)
    return { error: "Error inesperado. Inténtalo de nuevo." }
  }
}

export async function createAuction(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const userId = formData.get("userId")
  const categoryId = formData.get("categoryId")
  const title = formData.get("title")
  const description = formData.get("description")
  const imageUrl = formData.get("imageUrl")
  const startingPrice = formData.get("startingPrice")
  const buyNowPrice = formData.get("buyNowPrice")

  // Validate required fields
  if (!userId || !title || !description || !startingPrice) {
    return { error: "Todos los campos obligatorios deben ser completados" }
  }

  let sellerId = userId.toString()
  let useServiceRole = false

  if (sellerId === "admin") {
    sellerId = "00000000-0000-0000-0000-000000000001" // Admin UUID
    useServiceRole = true
  }

  const startingPriceNum = Number.parseFloat(startingPrice.toString())

  if (isNaN(startingPriceNum) || startingPriceNum <= 0) {
    return { error: "El precio inicial debe ser un número válido mayor a 0" }
  }

  let buyNowPriceNum = null
  if (buyNowPrice && buyNowPrice.toString().trim() !== "") {
    buyNowPriceNum = Number.parseFloat(buyNowPrice.toString())
    if (isNaN(buyNowPriceNum) || buyNowPriceNum <= startingPriceNum) {
      return { error: "El precio de compra inmediata debe ser mayor al precio inicial" }
    }
  }

  const supabase = useServiceRole ? createServiceClient() : createClient()

  try {
    // Calculate end time (24 hours from now)
    const endTime = new Date()
    endTime.setHours(endTime.getHours() + 24)

    const auctionData = {
      seller_id: sellerId,
      category_id: categoryId || null,
      title: title.toString(),
      description: description.toString(),
      image_url: imageUrl?.toString() || null,
      starting_price: startingPriceNum,
      current_price: startingPriceNum,
      buy_now_price: buyNowPriceNum,
      end_time: endTime.toISOString(),
      status: "active",
    }

    console.log("[v0] Creating auction with data:", auctionData)

    const { data: auction, error } = await supabase.from("auctions").insert(auctionData).select().single()

    if (error) {
      console.error("Error creating auction:", error)
      return { error: "Error al crear la subasta. Inténtalo de nuevo." }
    }

    console.log("[v0] Auction created successfully:", auction)

    // Revalidate relevant pages
    revalidatePath("/")
    revalidatePath("/profile")
    revalidatePath("/admin/dashboard")

    return { success: `Subasta "${auction.title}" creada exitosamente` }
  } catch (error) {
    console.error("Create auction error:", error)
    return { error: "Error inesperado. Inténtalo de nuevo." }
  }
}

export async function createCategory(name: string, description?: string) {
  const supabase = await createClient()

  try {
    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      throw new Error("Error al crear la categoría")
    }

    // Revalidate pages that show categories
    revalidatePath("/admin/dashboard")
    revalidatePath("/create-auction")

    return category
  } catch (error) {
    console.error("Create category error:", error)
    throw new Error("Error al crear la categoría")
  }
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient()

  try {
    // Check if category has any auctions
    const { data: auctions, error: auctionsError } = await supabase
      .from("auctions")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1)

    if (auctionsError) {
      console.error("Error checking category auctions:", auctionsError)
      throw new Error("Error al verificar la categoría")
    }

    if (auctions && auctions.length > 0) {
      throw new Error("No se puede eliminar una categoría que tiene subastas asociadas")
    }

    // Delete the category
    const { error } = await supabase.from("categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Error deleting category:", error)
      throw new Error("Error al eliminar la categoría")
    }

    // Revalidate pages that show categories
    revalidatePath("/admin/dashboard")
    revalidatePath("/create-auction")

    return { success: true }
  } catch (error) {
    console.error("Delete category error:", error)
    throw error
  }
}

export async function getUserProfile(userId: string) {
  const supabase = createServiceClient()

  try {
    console.log("[v0] Fetching user profile for:", userId)
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("[v0] Error fetching user profile:", error)
      throw new Error("Error al cargar el perfil del usuario")
    }

    console.log("[v0] User profile fetched successfully")
    return profile
  } catch (error) {
    console.error("[v0] Get user profile error:", error)
    throw new Error("Error al cargar el perfil del usuario")
  }
}

export async function getUserAuctions(userId: string) {
  const supabase = createServiceClient()

  try {
    console.log("[v0] Fetching user auctions for:", userId)
    const { data: auctions, error } = await supabase
      .from("auctions")
      .select(`
        *,
        categories (
          id,
          name
        ),
        bids (
          amount,
          bidder_id,
          created_at,
          profiles (
            email,
            full_name
          )
        )
      `)
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching user auctions:", error)
      throw new Error("Error al cargar las subastas del usuario")
    }

    // Add winner information to each auction
    const auctionsWithWinners = auctions?.map((auction) => {
      let winner = null
      if (auction.status === "ended" && auction.bids && auction.bids.length > 0) {
        // Find the highest bid
        const highestBid = auction.bids.reduce((max, bid) => (bid.amount > max.amount ? bid : max))
        winner = {
          bidder_id: highestBid.bidder_id,
          amount: highestBid.amount,
          email: highestBid.profiles?.email,
          full_name: highestBid.profiles?.full_name,
        }
      }
      return {
        ...auction,
        winner,
      }
    })

    console.log("[v0] User auctions fetched successfully:", auctionsWithWinners?.length || 0)
    return auctionsWithWinners || []
  } catch (error) {
    console.error("[v0] Get user auctions error:", error)
    throw new Error("Error al cargar las subastas del usuario")
  }
}

export async function getUserBids(userId: string) {
  const supabase = createServiceClient()

  try {
    console.log("[v0] Fetching user bids for:", userId)
    const { data: bids, error } = await supabase
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
          categories (
            name
          ),
          bids (
            amount,
            bidder_id,
            profiles (
              email,
              full_name
            )
          )
        )
      `)
      .eq("bidder_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching user bids:", error)
      throw new Error("Error al cargar las pujas del usuario")
    }

    // Add winner information and user's bid status
    const bidsWithStatus = bids?.map((bid) => {
      let isWinner = false
      let winnerInfo = null

      if (bid.auctions?.status === "ended" && bid.auctions.bids && bid.auctions.bids.length > 0) {
        // Find the highest bid
        const highestBid = bid.auctions.bids.reduce((max, bidItem) => (bidItem.amount > max.amount ? bidItem : max))

        isWinner = highestBid.bidder_id === userId
        winnerInfo = {
          bidder_id: highestBid.bidder_id,
          amount: highestBid.amount,
          email: highestBid.profiles?.email,
          full_name: highestBid.profiles?.full_name,
        }
      }

      return {
        ...bid,
        isWinner,
        winnerInfo,
      }
    })

    console.log("[v0] User bids fetched successfully:", bidsWithStatus?.length || 0)
    return bidsWithStatus || []
  } catch (error) {
    console.error("[v0] Get user bids error:", error)
    throw new Error("Error al cargar las pujas del usuario")
  }
}

export async function getActiveAuctions() {
  const supabase = createServiceClient()

  try {
    console.log("[v0] Fetching active auctions...")
    const { data: auctions, error } = await supabase
      .from("auctions")
      .select(`
        *,
        categories (
          id,
          name
        ),
        bids (
          amount
        )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching active auctions:", error)
      throw new Error("Error al cargar las subastas activas")
    }

    console.log("[v0] Active auctions fetched successfully:", auctions?.length || 0)
    return auctions || []
  } catch (error) {
    console.error("[v0] Get active auctions error:", error)
    throw new Error("Error al cargar las subastas activas")
  }
}

export async function editAuctionAdmin(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const auctionId = formData.get("auctionId")
  const title = formData.get("title")
  const description = formData.get("description")
  const imageUrl = formData.get("imageUrl")
  const categoryId = formData.get("categoryId")
  const buyNowPrice = formData.get("buyNowPrice")

  // Validate required fields
  if (!auctionId || !title || !description) {
    return { error: "Todos los campos obligatorios deben ser completados" }
  }

  let buyNowPriceNum = null
  if (buyNowPrice && buyNowPrice.toString().trim() !== "") {
    buyNowPriceNum = Number.parseFloat(buyNowPrice.toString())
    if (isNaN(buyNowPriceNum) || buyNowPriceNum <= 0) {
      return { error: "El precio de compra inmediata debe ser un número válido mayor a 0" }
    }
  }

  const supabase = createServiceClient()

  try {
    // Get current auction to validate
    const { data: currentAuction, error: fetchError } = await supabase
      .from("auctions")
      .select("starting_price, current_price")
      .eq("id", auctionId)
      .single()

    if (fetchError || !currentAuction) {
      return { error: "Subasta no encontrada" }
    }

    // Validate buy now price against current price
    if (buyNowPriceNum && buyNowPriceNum <= currentAuction.current_price) {
      return { error: "El precio de compra inmediata debe ser mayor al precio actual de la subasta" }
    }

    const updateData = {
      title: title.toString(),
      description: description.toString(),
      image_url: imageUrl?.toString() || null,
      category_id: categoryId || null,
      buy_now_price: buyNowPriceNum,
    }

    console.log("[v0] Updating auction with data:", updateData)

    const { data: auction, error } = await supabase
      .from("auctions")
      .update(updateData)
      .eq("id", auctionId)
      .select()
      .single()

    if (error) {
      console.error("Error updating auction:", error)
      return { error: "Error al actualizar la subasta. Inténtalo de nuevo." }
    }

    console.log("[v0] Auction updated successfully:", auction)

    // Revalidate relevant pages
    revalidatePath("/")
    revalidatePath("/admin/dashboard")
    revalidatePath(`/auction/${auctionId}`)

    return { success: `Subasta "${auction.title}" actualizada exitosamente` }
  } catch (error) {
    console.error("Edit auction error:", error)
    return { error: "Error inesperado. Inténtalo de nuevo." }
  }
}

export async function deleteAuctionAdmin(auctionId: string) {
  const supabase = createServiceClient()

  try {
    // Check if auction has bids
    const { data: bids, error: bidsError } = await supabase
      .from("bids")
      .select("id")
      .eq("auction_id", auctionId)
      .limit(1)

    if (bidsError) {
      console.error("Error checking auction bids:", bidsError)
      throw new Error("Error al verificar la subasta")
    }

    if (bids && bids.length > 0) {
      throw new Error("No se puede eliminar una subasta que tiene pujas")
    }

    // Delete the auction
    const { error } = await supabase.from("auctions").delete().eq("id", auctionId)

    if (error) {
      console.error("Error deleting auction:", error)
      throw new Error("Error al eliminar la subasta")
    }

    console.log("[v0] Auction deleted successfully:", auctionId)

    // Revalidate relevant pages
    revalidatePath("/")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Delete auction error:", error)
    throw error
  }
}

export async function getAuctionById(auctionId: string) {
  const supabase = createServiceClient()

  try {
    console.log("[v0] Fetching auction by ID:", auctionId)
    const { data: auction, error } = await supabase
      .from("auctions")
      .select(`
        *,
        categories (
          id,
          name
        ),
        bids (
          id,
          amount
        )
      `)
      .eq("id", auctionId)
      .single()

    if (error) {
      console.error("[v0] Error fetching auction:", error)
      throw new Error("Error al cargar la subasta")
    }

    console.log("[v0] Auction fetched successfully")
    return auction
  } catch (error) {
    console.error("[v0] Get auction by ID error:", error)
    throw new Error("Error al cargar la subasta")
  }
}

export { editAuctionAdmin as editAuction }
export { deleteAuctionAdmin as deleteAuction }

export { finalizeAuctionByTime }
export { finalizeAuctionByBuyNowPrice }
