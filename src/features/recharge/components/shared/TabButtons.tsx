type TabType = 'buy-token' | 'buy-promo'

interface TabButtonsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export const TabButtons = ({ activeTab, onTabChange }: TabButtonsProps) => {
  return (
    <div className="flex gap-2 mb-8 bg-white/40 backdrop-blur-md rounded-full border border-white/50 p-2 shadow-sm">
      <button
        onClick={() => onTabChange('buy-token')}
        className={`flex-1 py-3 px-6 rounded-full font-semibold text-base transition-all cursor-pointer ${
          activeTab === 'buy-token'
            ? 'bg-primary text-white shadow-lg'
            : 'bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/70'
        }`}
      >
        Buy Credits
      </button>
      <button
        onClick={() => onTabChange('buy-promo')}
        className={`flex-1 py-3 px-6 rounded-full font-semibold text-base transition-all cursor-pointer ${
          activeTab === 'buy-promo'
            ? 'bg-primary text-white shadow-lg'
            : 'bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/70'
        }`}
      >
        Buy Promo
      </button>
    </div>
  )
}

export type { TabType }
