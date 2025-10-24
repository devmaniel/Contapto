import { useState } from 'react'
import OrderSummaryDialog from './components/OrderSummaryDialog'
import BuyPromoDialog from './components/BuyPromoDialog'
import { TabButtons, type TabType } from './components/shared/TabButtons'
import { OnchainInfoBanner } from './components/shared/OnchainInfoBanner'
import { BuyCreditsSection } from './components/credits/BuyCreditsSection'
import { BuyPromosSection } from './components/promos/BuyPromosSection'
import { useAuthSession } from './hooks/useAuthSession'
import { useCreditsBalance } from './hooks/useCreditsBalance'
import type { CreditOption } from './data/creditOptions'
import type { PromoOption } from './data/promoOptions'

const RechargePage = () => {
  const session = useAuthSession()
  const [activeTab, setActiveTab] = useState<TabType>('buy-token')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<CreditOption | null>(null)
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState<PromoOption | null>(null)
    
  // Get real credits balance from Supabase (synced with Zustand store)
  const { credits: currentCredits } = useCreditsBalance()

  // Get phone and user ID from JWT session (no loading needed - session is cached)
  const userPhone = session?.user?.phone
  const userId = session?.user?.id

  const handleBuyNow = (option: CreditOption) => {
    setSelectedOption(option)
    setIsDialogOpen(true)
  }

  const handleBuyPromo = (promo: PromoOption) => {
    setSelectedPromo(promo)
    setIsPromoDialogOpen(true)
  }

  return (
    <div className="w-full">
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-8">Choose Recharge</h1>

        {/* Tab Buttons */}
        <TabButtons activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Onchain Info */}
        <OnchainInfoBanner />

        {/* Buy Credits Section */}
        {activeTab === 'buy-token' && <BuyCreditsSection onBuyNow={handleBuyNow} />}

        {/* Buy Promos Section */}
        {activeTab === 'buy-promo' && <BuyPromosSection onBuyPromo={handleBuyPromo} />}
      </div>

      {/* Order Summary Dialog */}
      {selectedOption && (
        <OrderSummaryDialog
          key={`${selectedOption.pesos}-${selectedOption.credits}`}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          pesos={selectedOption.pesos}
          credits={selectedOption.credits}
          userAccount={userPhone}
        />
      )}

      {/* Buy Promo Dialog */}
      {selectedPromo && (
        <BuyPromoDialog
          isOpen={isPromoDialogOpen}
          onClose={() => setIsPromoDialogOpen(false)}
          promoId={selectedPromo.id}
          promoName={selectedPromo.name}
          promoDescription={selectedPromo.description}
          requiredCredits={selectedPromo.credits}
          currentCredits={currentCredits}
          userAccount={userPhone}
          userId={userId}
        />
      )}
    </div>
  )
}

export default RechargePage