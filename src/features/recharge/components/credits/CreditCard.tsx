import { CreditCard as CreditCardIcon } from 'lucide-react'
import type { CreditOption } from '../../data/creditOptions'

interface CreditCardProps {
  option: CreditOption
  onBuyNow: (option: CreditOption) => void
  size?: 'large' | 'medium' | 'small'
  backgroundImage?: string
}

export const CreditCard = ({ option, onBuyNow, size = 'medium', backgroundImage }: CreditCardProps) => {
  const isLarge = size === 'large'
  
  const containerClass = isLarge
    ? 'relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg cursor-pointer overflow-hidden flex items-center justify-between'
    : 'bg-white rounded-2xl p-5 border-2 border-gray-300 hover:border-primary transition-all hover:shadow-lg cursor-pointer flex items-center justify-between'
  
  const pesosTextSize = isLarge ? 'text-4xl' : 'text-3xl'
  const pesosSymbolSize = isLarge ? 'text-2xl' : 'text-lg'
  const creditsTextSize = isLarge ? 'text-4xl' : 'text-3xl'
  const equalSignSize = isLarge ? 'text-3xl' : 'text-2xl'
  
  const buttonClass = isLarge
    ? 'bg-white/70 backdrop-blur-md hover:bg-primary text-gray-800 hover:text-white font-semibold py-3 px-6 rounded-xl border border-white/50 hover:border-primary transition-all flex items-center gap-2 hover:shadow-lg shadow-sm cursor-pointer'
    : 'bg-white/70 backdrop-blur-md hover:bg-primary text-gray-800 hover:text-white font-semibold py-2 px-4 rounded-xl border border-white/50 hover:border-primary transition-all flex items-center gap-2 hover:shadow-lg shadow-sm text-sm cursor-pointer'

  const style = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined

  return (
    <div className={containerClass} style={style}>
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs text-gray-600 mb-1">Pesos</div>
          <div className={`${pesosTextSize} font-bold`}>
            <span className={pesosSymbolSize}>$</span>
            {option.pesos}
          </div>
        </div>
        <div className={`${equalSignSize} text-gray-400`}>=</div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Credits</div>
          <div className={`${creditsTextSize} font-bold`}>{option.credits}</div>
        </div>
      </div>
      <button
        onClick={() => onBuyNow(option)}
        className={buttonClass}
      >
        Buy now
        <CreditCardIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
