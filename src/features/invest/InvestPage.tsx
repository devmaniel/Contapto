import { useMemo, useState } from 'react'
import Layout1 from '@/shared/layouts/Layout1'
import TokenHeader from './components/TokenHeader'
import MarketStats from './components/MarketStats'
import PriceChart from './components/PriceChart'
import PurchasePanel from './components/PurchasePanel'
import InvestOrderSummaryDialog from './components/InvestOrderSummaryDialog'
import { useAuthSession } from '../recharge/hooks/useAuthSession'

// Investment page with purchase functionality
const InvestPage = () => {
  const [priceInput, setPriceInput] = useState('75') // Default: 75 PHP = 75 Credits = 1 AP
  const [tokenAmount, setTokenAmount] = useState('1')
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D')
  const [selectedCurrency, setSelectedCurrency] = useState('PHP')
  const [paymentCurrency, setPaymentCurrency] = useState<'PHP' | 'Credits'>('PHP') // Payment method selector
  const [showOrderDialog, setShowOrderDialog] = useState(false)

  // Get user session for phone number
  const session = useAuthSession()
  const userPhone = session?.user?.phone || ''

  // Currency conversion rates (PHP as base)
  const currencyRates: Record<string, { rate: number; symbol: string }> = {
    PHP: { rate: 1, symbol: '₱' },
    USD: { rate: 0.018, symbol: '$' },
    EUR: { rate: 0.017, symbol: '€' },
    GBP: { rate: 0.014, symbol: '£' },
    JPY: { rate: 2.7, symbol: '¥' },
    CNY: { rate: 0.13, symbol: '¥' },
    KRW: { rate: 24.5, symbol: '₩' },
  }

  // --- Price series (single source of truth) ---
  type Point = { time: string; price: number }
  const series = useMemo<Point[]>(() => {
    const cfg: Record<string, { points: number; label: (i: number) => string; mu: number; sigma: number }> = {
      '1D': { points: 24, label: (i) => `${String(i).padStart(2, '0')}:00`, mu: 0.15, sigma: 0.25 },
      '7D': { points: 56, label: (i) => `Day ${Math.floor(i / 8) + 1}`, mu: 0.25, sigma: 0.35 },
      '1M': { points: 30, label: (i) => `${i + 1}`, mu: 0.35, sigma: 0.40 },
      '3M': { points: 90, label: (i) => `${i + 1}`, mu: 0.45, sigma: 0.45 },
      '1Y': { points: 365, label: (i) => `${i + 1}`, mu: 0.60, sigma: 0.50 },
      'All': { points: 730, label: (i) => `${i + 1}`, mu: 0.80, sigma: 0.55 },
    }
    const { points, label, mu, sigma } = cfg[selectedTimeframe] || cfg['1D']
    const basePrice = 75 // Affordable: ~75 credits per token
    const dt = 1 / points
    const data: Point[] = []
    let price = basePrice
    const first = price
    const gauss = () => {
      let u = 0, v = 0
      while (u === 0) u = Math.random()
      while (v === 0) v = Math.random()
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    }
    for (let i = 0; i < points; i++) {
      const drift = (mu - 0.5 * sigma * sigma) * dt
      const diffusion = sigma * Math.sqrt(dt) * gauss()
      price = price * Math.exp(drift + diffusion)
      data.push({ time: label(i), price: Math.round(price) })
    }
    // Ensure positive growth trajectory for attractive investment
    const lastPrice = data[data.length - 1].price
    if (lastPrice < first) {
      // Add upward trend to show growth potential
      const targetGrowth = first * 1.15 // 15% minimum growth
      const uplift = targetGrowth - lastPrice
      const step = uplift / Math.max(1, data.length - 1)
      for (let i = 0; i < data.length; i++) {
        data[i].price += step * i
      }
    } else {
      // Already growing, boost it a bit more for attractiveness
      const extraGrowth = (lastPrice - first) * 0.2 // Add 20% more growth
      const step = extraGrowth / Math.max(1, data.length - 1)
      for (let i = 0; i < data.length; i++) {
        data[i].price += step * i
      }
    }
    return data
  }, [selectedTimeframe])

  const currentPrice = series[series.length - 1]?.price ?? 75
  const openPrice = series[0]?.price ?? currentPrice
  const changeAbs = currentPrice - openPrice
  const changePct = openPrice ? (changeAbs / openPrice) * 100 : 0
  const high = Math.max(...series.map(p => p.price))
  const low = Math.min(...series.map(p => p.price))
  const circulatingSupply = 1_000_000 // demo
  const marketCap = currentPrice * circulatingSupply

  const formatPhp = (n: number) => `₱${n.toLocaleString()}`
  const formatCompact = (n: number) => {
    if (n >= 1_000_000_000) return `₱${(n / 1_000_000_000).toFixed(1)}B`
    if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `₱${(n / 1_000).toFixed(1)}K`
    return `₱${n.toLocaleString()}`
  }

  // Get current currency info
  const currentCurrencyInfo = currencyRates[selectedCurrency]
  const convertedPrice = currentPrice * currentCurrencyInfo.rate

  // Bidirectional conversion handlers
  const handlePriceChange = (value: string) => {
    setPriceInput(value)
    // Auto-calculate tokens based on payment currency
    if (value && currentPrice) {
      const inputAmount = parseFloat(value)
      // PHP and Credits are 1:1 (1 Credit = ₱1)
      const creditsAmount = inputAmount // Same value for both!
      const tokens = creditsAmount / currentPrice
      setTokenAmount(tokens > 0 ? tokens.toFixed(4) : '')
    } else {
      setTokenAmount('')
    }
  }

  const handleTokenChange = (value: string) => {
    setTokenAmount(value)
    // Auto-calculate amount needed from tokens
    if (value && currentPrice) {
      const credits = parseFloat(value) * currentPrice
      // PHP and Credits are 1:1 (1 Credit = ₱1)
      const amount = credits // Same value for both!
      setPriceInput(amount > 0 ? amount.toFixed(2) : '')
    } else {
      setPriceInput('')
    }
  }

  // Recompute estimations based on live currentPrice
  // Note: 1 Credit = ₱1, so PHP and Credits have same value
  const estimatedTokens = priceInput && currentPrice
    ? (parseFloat(priceInput) / currentPrice).toFixed(4)
    : '0'
  const estimatedTotal = tokenAmount && currentPrice
    ? (parseFloat(tokenAmount) * currentPrice).toLocaleString()
    : '0'

  const handleBuy = () => {
    const creditsToSpend = parseFloat(priceInput)
    const tokens = parseFloat(tokenAmount)
    
    if (!creditsToSpend || !tokens || creditsToSpend <= 0 || tokens <= 0) {
      alert('Please enter valid amounts')
      return
    }

    // Open order summary dialog
    setShowOrderDialog(true)
  }

  return (
    <Layout1>
      <div className="pt-2 pb-6 h-fit">
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <TokenHeader
              tokenName="AppToken"
              tokenSymbol="AP"
              currentPrice={`${currentCurrencyInfo.symbol}${(currentPrice * currentCurrencyInfo.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              priceChange={`${changeAbs >= 0 ? '+' : ''}${formatPhp(Math.abs(changeAbs))}`}
              priceChangePercent={`${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`}
              selectedCurrency={selectedCurrency}
              currencySymbol={currentCurrencyInfo.symbol}
              availableCurrencies={Object.keys(currencyRates)}
              onCurrencyChange={setSelectedCurrency}
            />

            <MarketStats
              high24h={formatPhp(high)}
              low24h={formatPhp(low)}
              volume24h={formatCompact(currentPrice * series.length * 850)}
              marketCap={formatCompact(marketCap)}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch mt-6">
              <PriceChart
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
                data={series}
              />

              <PurchasePanel
                priceInput={priceInput}
                tokenAmount={tokenAmount}
                estimatedTokens={estimatedTokens}
                estimatedTotal={estimatedTotal}
                selectedCurrency={selectedCurrency}
                currencySymbol={currentCurrencyInfo.symbol}
                convertedPrice={convertedPrice}
                paymentCurrency={paymentCurrency}
                onPaymentCurrencyChange={setPaymentCurrency}
                onPriceChange={handlePriceChange}
                onTokenAmountChange={handleTokenChange}
                onBuy={handleBuy}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary Dialog */}
      <InvestOrderSummaryDialog
        isOpen={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        tokenSymbol="AP"
        tokenName="AppToken"
        tokenAmount={parseFloat(tokenAmount) || 0}
        tokenPrice={currentPrice}
        totalCost={parseFloat(priceInput) || 0}
        userAccount={userPhone}
      />
    </Layout1>
  )
}

export default InvestPage