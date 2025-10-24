import { CreditCard } from './CreditCard'
import type { CreditOption } from '../../data/creditOptions'
import {
  creditOptionsRow1,
  creditOptionsRow2,
  creditOptionsRow3,
  creditOptionSmall,
} from '../../data/creditOptions'
import cardGlow from '../../../../assets/glow/card-glow.png'

interface BuyCreditsSectionProps {
  onBuyNow: (option: CreditOption) => void
}

export const BuyCreditsSection = ({ onBuyNow }: BuyCreditsSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Row 1: 3 large cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {creditOptionsRow1.map((option, index) => (
          <CreditCard
            key={index}
            option={option}
            onBuyNow={onBuyNow}
            size="large"
            backgroundImage={cardGlow}
          />
        ))}
      </div>

      {/* Row 2: 4 medium cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {creditOptionsRow2.map((option, index) => (
          <CreditCard
            key={index}
            option={option}
            onBuyNow={onBuyNow}
            size="medium"
          />
        ))}
      </div>

      {/* Row 3: 4 medium cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {creditOptionsRow3.map((option, index) => (
          <CreditCard
            key={index}
            option={option}
            onBuyNow={onBuyNow}
            size="medium"
          />
        ))}
      </div>

      {/* Row 4: 1 small card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CreditCard
          option={creditOptionSmall}
          onBuyNow={onBuyNow}
          size="small"
        />
      </div>
    </div>
  )
}
