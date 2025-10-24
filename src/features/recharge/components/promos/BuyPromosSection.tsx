import { PromoCard } from './PromoCard'
import type { PromoOption } from '../../data/promoOptions'
import { promoOptions } from '../../data/promoOptions'
import glow2 from '../../../../assets/glow/glow-2.png'

interface BuyPromosSectionProps {
  onBuyPromo: (promo: PromoOption) => void
}

export const BuyPromosSection = ({ onBuyPromo }: BuyPromosSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Row 1: 2 large cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promoOptions.slice(0, 2).map((promo) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            onBuyPromo={onBuyPromo}
            size="large"
            backgroundImage={glow2}
          />
        ))}
      </div>

      {/* Row 2: 4 medium cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {promoOptions.slice(2, 6).map((promo) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            onBuyPromo={onBuyPromo}
            size="medium"
          />
        ))}
      </div>

      {/* Row 3: 4 medium cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {promoOptions.slice(6, 10).map((promo) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            onBuyPromo={onBuyPromo}
            size="medium"
          />
        ))}
      </div>
    </div>
  )
}
