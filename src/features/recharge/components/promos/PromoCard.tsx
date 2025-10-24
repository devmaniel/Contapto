import { MdToken } from 'react-icons/md'
import type { PromoOption } from '../../data/promoOptions'
import lineSvg from '../../../../assets/svg/line.svg'

interface PromoCardProps {
  promo: PromoOption
  onBuyPromo: (promo: PromoOption) => void
  size?: 'large' | 'medium'
  backgroundImage?: string
}

export const PromoCard = ({ promo, onBuyPromo, size = 'medium', backgroundImage }: PromoCardProps) => {
  const isLarge = size === 'large'
  
  const containerClass = isLarge
    ? 'relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg overflow-hidden cursor-pointer'
    : 'relative bg-white rounded-2xl p-5 border-2 border-gray-300 hover:border-primary transition-all hover:shadow-lg overflow-hidden cursor-pointer'
  
  const titleClass = isLarge ? 'text-lg font-bold text-gray-800 mb-2' : 'text-base font-bold text-gray-800 mb-2'
  const descClass = isLarge ? 'text-sm text-gray-600 mb-4' : 'text-xs text-gray-600 mb-4 min-h-[40px]'
  const iconSize = isLarge ? 'w-20 h-20' : 'w-16 h-16'

  const style = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined

  return (
    <div className={containerClass} style={style}>
      {/* Line SVG decoration */}
      <img 
        src={lineSvg} 
        alt="" 
        className={`absolute top-0 right-0 ${iconSize} ${isLarge ? 'opacity-50' : 'opacity-30'} pointer-events-none`}
      />
      
      <div className="relative z-10">
        <h3 className={titleClass}>{promo.name}</h3>
        <p className={descClass}>{promo.description}</p>
        <button 
          onClick={() => onBuyPromo(promo)}
          className="w-full bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <span>Buy now for {promo.credits} Credits</span>
          <MdToken className="text-primary group-hover:text-white text-lg transition-colors" />
        </button>
      </div>
    </div>
  )
}
