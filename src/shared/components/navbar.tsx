import { useState } from 'react'
import { FiMenu } from 'react-icons/fi'
import { MdToken } from 'react-icons/md'
import { BiSolidMessageAltDots } from 'react-icons/bi'
import { IoIosCall } from 'react-icons/io'
import { LogOut, Calendar, Clock } from 'lucide-react'
import { useSignOut } from '@/features/auth/hooks/useSignOut'
import { Link, useRouterState } from '@tanstack/react-router'
import { useCreditsStore } from '@/shared/stores/useCreditsStore'
import { useActivePromos } from '@/features/recharge/hooks/useActivePromos'
import { formatMinutes } from '@/features/recharge/utils/promoParser'

const Navbar = () => {
  const { signOut, loading } = useSignOut()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  
  // Get credits from Zustand store (persisted, no loading needed)
  const credits = useCreditsStore((state) => state.credits)
  const resetCredits = useCreditsStore((state) => state.reset)
  
  // Get active promos for text/call badges
  const { summary: promoSummary } = useActivePromos()
  
  // Hover state for dropdowns
  const [showTextDropdown, setShowTextDropdown] = useState(false)
  const [showCallDropdown, setShowCallDropdown] = useState(false)
  
  // Check if user has any active promos
  const hasAnyPromos = promoSummary.activePromos.length > 0
  
  // Format expiration date
  const formatExpiresAt = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 1) return 'Expires today'
    if (diffDays === 1) return 'Expires tomorrow'
    return `${diffDays} days left`
  }

  const handleLogout = async () => {
    await signOut()
    // Reset credits store on logout
    resetCredits()
  }

  const isActive = (path: string): boolean => {
    // Normalize paths by removing trailing slashes for comparison
    const normalizedCurrent = currentPath.replace(/\/$/, '');
    const normalizedPath = path.replace(/\/$/, '');
    return normalizedCurrent === normalizedPath;
  };

  return (
    <div className="w-full flex justify-center">
      <nav className="w-full max-w-[1550px] rounded-full bg-white/90 backdrop-blur-xl mx-5 my-5 border-2 border-white/70 shadow-lg">
        <div className="px-5 sm:px-5 lg:px-5">
          <div className="flex h-12 items-center justify-between">
            {/* Left Section - Logo and Navigation */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="flex items-center gap-2">
               
                <span className="text-lg font-bold text-gray-900">Contapto</span>
              </div>

              {/* Navigation Links - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2">
                <Link 
                  to="/chats"
                  className={`px-4 py-1 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                    isActive('/chats') 
                      ? 'font-bold text-white bg-primary hover:bg-primary/90' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Chats
                </Link>
                <Link 
                  to="/recharge"
                  className={`px-4 py-1 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                    isActive('/recharge') 
                      ? 'font-bold text-white bg-primary hover:bg-primary/90' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Recharge
                </Link>
                <Link 
                  to="/invest"
                  className={`px-4 py-1 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                    isActive('/invest') 
                      ? 'font-bold text-white bg-primary hover:bg-primary/90' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Invest
                </Link>
              </div>
            </div>

            {/* Right Section - Promos, Balance and Avatar */}
            <div className="flex items-center gap-3">
              {/* Text Badge with Dropdown - Capsule UI */}
              {(promoSummary.hasUnlimitedText || (promoSummary.textTotal !== null && promoSummary.textTotal > 0)) && (
                <div 
                  className="relative hidden md:block"
                  onMouseEnter={() => setShowTextDropdown(true)}
                  onMouseLeave={() => setShowTextDropdown(false)}
                >
                  {(() => {
                    const isExhausted = !promoSummary.hasUnlimitedText && promoSummary.textTotal !== null && promoSummary.textUsed >= promoSummary.textTotal
                    return (
                      <div className={`flex items-center gap-2 px-3 py-1 bg-gray-100 border-2 shadow-2xl rounded-full cursor-pointer transition-all ${
                        isExhausted ? 'border-red-500' : 'border-gray-200'
                      }`}>
                        <BiSolidMessageAltDots className={isExhausted ? 'text-red-500 text-lg' : 'text-blue-500 text-lg'} />
                        <span className="text-gray-400">|</span>
                        <span className={`text-sm font-bold ${
                          isExhausted ? 'text-red-500' : 'text-blue-500'
                        }`}>
                          {promoSummary.hasUnlimitedText 
                            ? '∞' 
                            : `${promoSummary.textUsed} / ${promoSummary.textTotal}`
                          }
                        </span>
                      </div>
                    )
                  })()}
                  
                  {/* Dropdown */}
                  {showTextDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                          <BiSolidMessageAltDots className="w-4 h-4" />
                          Text Promos
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {promoSummary.activePromos
                          .filter(p => 
                            p.promo_type === 'unlimited_both' || 
                            p.promo_type === 'unlimited_text' || 
                            p.promo_type === 'limited_both' || 
                            p.promo_type === 'limited_text'
                          )
                          .map((promo) => (
                            <div key={promo.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800 text-sm">{promo.promo_name}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3 text-gray-500" />
                                    <p className="text-xs text-gray-600">{formatExpiresAt(promo.expires_at)}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {promo.text_allowance === null ? (
                                    <span className="text-green-600 font-bold text-sm">∞</span>
                                  ) : (
                                    <span className={`font-semibold text-xs ${
                                      promo.text_used >= promo.text_allowance ? 'text-red-500' : 'text-gray-700'
                                    }`}>
                                      {promo.text_used}/{promo.text_allowance}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Call Badge with Dropdown - Capsule UI */}
              {(promoSummary.hasUnlimitedCalls || (promoSummary.callTotal !== null && promoSummary.callTotal > 0)) && (
                <div 
                  className="relative hidden md:block"
                  onMouseEnter={() => setShowCallDropdown(true)}
                  onMouseLeave={() => setShowCallDropdown(false)}
                >
                  {(() => {
                    const isExhausted = !promoSummary.hasUnlimitedCalls && promoSummary.callTotal !== null && promoSummary.callUsed >= promoSummary.callTotal
                    return (
                      <div className={`flex items-center gap-2 px-3 py-1 bg-gray-100 border-2 shadow-2xl rounded-full cursor-pointer transition-all ${
                        isExhausted ? 'border-red-500' : 'border-gray-200'
                      }`}>
                        <IoIosCall className={isExhausted ? 'text-red-500 text-lg' : 'text-blue-500 text-lg'} />
                        <span className="text-gray-400">|</span>
                        <span className={`text-sm font-bold ${
                          isExhausted ? 'text-red-500' : 'text-blue-500'
                        }`}>
                          {promoSummary.hasUnlimitedCalls 
                            ? '∞' 
                            : `${formatMinutes(promoSummary.callUsed)} / ${formatMinutes(promoSummary.callTotal || 0)}`
                          }
                        </span>
                      </div>
                    )
                  })()}
                  
                  {/* Dropdown */}
                  {showCallDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                          <IoIosCall className="w-4 h-4" />
                          Call Promos
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {promoSummary.activePromos
                          .filter(p => 
                            p.promo_type === 'unlimited_both' || 
                            p.promo_type === 'unlimited_calls' || 
                            p.promo_type === 'limited_both' || 
                            p.promo_type === 'limited_calls'
                          )
                          .map((promo) => (
                            <div key={promo.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800 text-sm">{promo.promo_name}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3 text-gray-500" />
                                    <p className="text-xs text-gray-600">{formatExpiresAt(promo.expires_at)}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {promo.call_allowance === null ? (
                                    <span className="text-green-600 font-bold text-sm">∞</span>
                                  ) : (
                                    <span className={`font-semibold text-xs ${
                                      promo.call_used >= promo.call_allowance ? 'text-red-500' : 'text-gray-700'
                                    }`}>
                                      {formatMinutes(promo.call_used)}/{formatMinutes(promo.call_allowance)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* No Active Promos Badge */}
              {!hasAnyPromos && (
                <Link to="/recharge">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 border-2 border-dashed border-gray-300 bg-gray-50 rounded-full cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">No Active Promos</span>
                  </div>
                </Link>
              )}

              {/* Credits Balance - Hidden on small mobile */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 border-2 border-gray-200 shadow-2xl rounded-full">
                <span className="text-sm font-semibold text-blue-500">{credits}</span>
                <MdToken className="text-blue-500 text-xl" />
              </div>

              {/* Logout Text */}
              <button 
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center gap-2 text-red-500 font-semibold text-sm hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{loading ? 'Logging out...' : 'Logout'}</span>
              </button>

              {/* Mobile Menu Button */}
              <button type="button" className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
                <FiMenu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar