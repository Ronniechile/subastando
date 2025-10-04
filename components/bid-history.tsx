import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Bid {
  id: string
  amount: number
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    email: string
    is_anonymous: boolean | null
  } | null
}

interface BidHistoryProps {
  bids: Bid[]
}

export default function BidHistory({ bids }: BidHistoryProps) {
  if (bids.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aún no hay pujas</p>
        <p className="text-sm text-gray-400 mt-1">Sé el primero en pujar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {bids.map((bid, index) => (
        <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {bid.profiles?.is_anonymous 
                  ? "A" 
                  : (bid.profiles?.full_name?.[0] || bid.profiles?.email?.[0] || "?")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {bid.profiles?.is_anonymous 
                  ? "Usuario Anónimo" 
                  : (bid.profiles?.full_name || bid.profiles?.email || "Usuario")}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true, locale: es })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${index === 0 ? "text-green-600" : "text-gray-700"}`}>${bid.amount.toFixed(2)}</p>
            {index === 0 && <p className="text-xs text-green-600">Puja más alta</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
