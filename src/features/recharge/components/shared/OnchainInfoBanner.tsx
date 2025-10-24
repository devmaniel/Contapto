import { FaLink, FaWallet, FaTools } from 'react-icons/fa'

export const OnchainInfoBanner = () => {
  return (
    <div className="mb-8 flex items-start gap-3 p-4 border-l-4 border-primary">
      <FaLink className="text-primary text-2xl mt-1 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="text-base font-bold text-gray-800 mb-2">Onchain Reserve System</h3>
        <p className="text-sm text-gray-600 mb-3">
          When you purchase credits, a portion helps improve and maintain the blockchain infrastructure.
        </p>
        <div className="flex flex-col md:flex-row gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FaWallet className="text-primary text-lg" />
            <span className="text-gray-700">
              <span className="font-bold text-primary">80%</span> to your wallet
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaTools className="text-primary text-lg" />
            <span className="text-gray-700">
              <span className="font-bold text-primary">20%</span> for chain development
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
