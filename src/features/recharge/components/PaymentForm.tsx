import React from 'react'
import { SiVisa, SiMastercard, SiAmericanexpress } from 'react-icons/si'

interface PaymentFormProps {
  cardNumber: string
  setCardNumber: (value: string) => void
  cardholderName: string
  setCardholderName: (value: string) => void
  expirationDate: string
  setExpirationDate: (value: string) => void
  securityCode: string
  setSecurityCode: (value: string) => void
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  cardNumber,
  setCardNumber,
  cardholderName,
  setCardholderName,
  expirationDate,
  setExpirationDate,
  securityCode,
  setSecurityCode
}) => {
  return (
    <div className="p-4 border-2 border-primary rounded-xl bg-blue-50/30">
      <div className="flex items-center gap-3 mb-4">
        <input
          type="radio"
          id="card"
          name="payment"
          checked={true}
          readOnly
          className="w-5 h-5 text-primary cursor-pointer appearance-none rounded-full border-2 border-primary bg-primary ring-4 ring-primary/20"
        />
        <label htmlFor="card" className="flex items-center gap-2 flex-1 cursor-pointer">
          <span className="font-semibold text-gray-800">Add Credit or Debit Card</span>
        </label>
        <div className="flex items-center gap-2">
          <SiVisa className="text-blue-600 text-2xl" />
          <SiMastercard className="text-red-600 text-2xl" />
          <SiAmericanexpress className="text-blue-500 text-2xl" />
        </div>
      </div>

      {/* Card Form */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Card Number
            </label>
            <input
              type="text"
              placeholder="Enter card numberr"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={19}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Cardholder name
            </label>
            <input
              type="text"
              placeholder="Cardholder name"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Expiration Date
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Security Code
            </label>
            <input
              type="text"
              placeholder="CVV/CVC"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={4}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentForm
