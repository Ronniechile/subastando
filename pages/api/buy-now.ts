import type { NextApiRequest, NextApiResponse } from "next"
import { finalizeAuctionByBuyNowPrice } from "@/lib/actions"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]) 
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  try {
    const { auctionId, buyerId } = req.body || {}

    if (!auctionId || !buyerId) {
      return res.status(400).json({ error: "auctionId y buyerId son requeridos" })
    }

    const ok = await finalizeAuctionByBuyNowPrice(auctionId, buyerId)
    if (!ok) {
      return res.status(400).json({ error: "No se pudo finalizar la subasta por compra inmediata" })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error("/api/buy-now error:", err)
    return res.status(500).json({ error: "Error interno del servidor" })
  }
}

