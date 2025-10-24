export interface PromoOption {
  id: string
  name: string
  description: string
  credits: number
}

export const promoOptions: PromoOption[] = [
  {
    id: 'sulit-10',
    name: 'Sulit 10',
    description: '100 Text Messages (SMS) & 1 Hour of Voice Call',
    credits: 10,
  },
  {
    id: 'the-180',
    name: 'The 180',
    description: 'Unlimited Text (SMS) & Voice Calls, shareable with one number, for 15 Days',
    credits: 180,
  },
  {
    id: 'voice-value-60',
    name: 'The "Voice-Value 60"',
    description: '4,000 Minutes of Voice Calls for 60 Days',
    credits: 160,
  },
  {
    id: '15-day-unli',
    name: 'The 15-Day Unli',
    description: 'Unlimited Text (SMS) & Voice Calls for 15 Days',
    credits: 100,
  },
  {
    id: 'the-weekender',
    name: 'The Weekender',
    description: 'Unlimited Text (SMS) & Voice Calls for 7 Days',
    credits: 50,
  },
  {
    id: 'monthly-basic',
    name: 'The Monthly Basic',
    description: 'Unlimited Text (SMS) to all networks for 30 Days',
    credits: 75,
  },
  {
    id: 'call-centric',
    name: 'The "Call-Centric"',
    description: '2,000 Minutes of Voice Calls for 30 Days',
    credits: 60,
  },
  {
    id: 'micro-pack',
    name: 'The "Micro-Pack"',
    description: '500 Text Messages (SMS) & 100 Minutes of Voice Calls for 3 Days',
    credits: 20,
  },
  {
    id: 'late-night',
    name: 'The "Late Night"',
    description: 'Unlimited Voice Calls (10 PM - 6 AM only) for 30 Days',
    credits: 40,
  },
  {
    id: 'international-connect',
    name: 'The "International Connect"',
    description: '100 International Text Messages (SMS) to select countries for 30 Days',
    credits: 30,
  },
  {
    id: 'text-saver-90',
    name: 'The "Text-Saver 90"',
    description: 'Unlimited Text (SMS) only for 90 Days',
    credits: 150,
  },
]
