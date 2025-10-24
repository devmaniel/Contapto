import type { Participant, Message, Chat } from '../types'

export const ME_ID = 'me'

export const participants: Participant[] = [
  {
    id: 'p1',
    phone: '+639171234567'
  },
  {
    id: 'p2',
    phone: '+639281234568'
  },
  {
    id: 'p3',
    phone: '+639051234569'
  },
  {
    id: 'p4',
    phone: '+639191234570'
  },
  {
    id: 'p5',
    phone: '+639271234571'
  },
  {
    id: 'p6',
    phone: '+639061234572'
  }
]

// Helper to create timestamps relative to now
const now = new Date()
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60 * 1000)
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000)

export const messages: Message[] = [
  // Chat 1: No problem conversation (most recent)
  {
    id: 'm1-1',
    chatId: 'c1',
    senderId: 'p1',
    text: 'No problem! See you there! 👋',
    timestamp: minutesAgo(5),
    status: 'read'
  },
  {
    id: 'm1-2',
    chatId: 'c1',
    senderId: ME_ID,
    text: 'No problem! See you there! 👋',
    timestamp: minutesAgo(6),
    status: 'delivered'
  },
  {
    id: 'm1-3',
    chatId: 'c1',
    senderId: 'p1',
    text: 'Got it. Thanks for the quick motivation! 🙏 Talk later.',
    timestamp: minutesAgo(7),
    status: 'read'
  },
  {
    id: 'm1-4',
    chatId: 'c1',
    senderId: ME_ID,
    text: 'Definitely do it! And don\'t forget the AI in Production workshop on day one. It looks like a must-see.',
    timestamp: minutesAgo(8),
    status: 'delivered'
  },
  {
    id: 'm1-5',
    chatId: 'c1',
    senderId: 'p1',
    text: 'P6k is steep! I really wanna attend that Microservices scaling talk. I\'ll do it now before I get sidetracked.',
    timestamp: minutesAgo(10),
    status: 'read'
  },
  {
    id: 'm1-6',
    chatId: 'c1',
    senderId: ME_ID,
    text: 'Yep! If you register now, it should still be that price, but the text says the early-bird deadline is tonight. After that, it jumps to ₱6,000.',
    timestamp: minutesAgo(12),
    status: 'delivered'
  },
  {
    id: 'm1-7',
    chatId: 'c1',
    senderId: 'p1',
    text: 'Argh, I knew I was forgetting something. You\'re set for the ₱4,500 rate, right?',
    timestamp: minutesAgo(14),
    status: 'read'
  },
  {
    id: 'm1-8',
    chatId: 'c1',
    senderId: ME_ID,
    text: 'Yeah, I got it! I already registered last week, thank goodness! The price hike is no joke.',
    timestamp: minutesAgo(16),
    status: 'delivered'
  },
  {
    id: 'm1-9',
    chatId: 'c1',
    senderId: 'p1',
    text: 'Hey, did you see the text from Dev Summit? Final call for early-bird registration to the Dev Summit! 🎉',
    timestamp: minutesAgo(18),
    status: 'read'
  },

  // Chat 2: Order delivery
  {
    id: 'm2-1',
    chatId: 'c2',
    senderId: 'p2',
    text: 'Your order #44598 is out for delivery and will arrive today.',
    timestamp: minutesAgo(2),
    status: 'delivered'
  },
  {
    id: 'm2-2',
    chatId: 'c2',
    senderId: 'p2',
    text: 'Thank you for your order! We\'re preparing it now.',
    timestamp: hoursAgo(2),
    status: 'read'
  },

  // Chat 3: Doctor appointment
  {
    id: 'm3-1',
    chatId: 'c3',
    senderId: 'p3',
    text: 'Reminder: Your appointment with Dr. Reyes is on Oct 25 at 10 AM.',
    timestamp: minutesAgo(15),
    status: 'delivered'
  },
  {
    id: 'm3-2',
    chatId: 'c3',
    senderId: ME_ID,
    text: 'Thanks for the reminder!',
    timestamp: minutesAgo(20),
    status: 'delivered'
  },
  {
    id: 'm3-3',
    chatId: 'c3',
    senderId: 'p3',
    text: 'We\'ve detected a successful login from a new device. Is this you?',
    timestamp: minutesAgo(25),
    status: 'read'
  },

  // Chat 4: Billing - with various message states
  {
    id: 'm4-1',
    chatId: 'c4',
    senderId: 'p4',
    text: 'Your monthly bill of ₱1,599.00 is due on November 5th.',
    timestamp: minutesAgo(10),
    status: 'delivered'
  },
  {
    id: 'm4-2',
    chatId: 'c4',
    senderId: ME_ID,
    text: 'Thank you for the reminder!',
    timestamp: minutesAgo(8),
    status: 'sent'
  },
  {
    id: 'm4-3',
    chatId: 'c4',
    senderId: ME_ID,
    text: 'Can I get a payment extension?',
    timestamp: minutesAgo(5),
    status: 'loading'
  },
  {
    id: 'm4-4',
    chatId: 'c4',
    senderId: ME_ID,
    text: 'Please process my payment now.',
    timestamp: minutesAgo(2),
    status: 'error',
    errorMessage: 'Something went wrong, please try again.'
  },

  // Chat 5: Loyalty points
  {
    id: 'm5-1',
    chatId: 'c5',
    senderId: 'p5',
    text: 'Congratulations! You\'ve earned 50 loyalty points this week.',
    timestamp: minutesAgo(5),
    status: 'delivered'
  },

  // Chat 6: Email verification (oldest)
  {
    id: 'm6-1',
    chatId: 'c6',
    senderId: 'p6',
    text: 'Please verify your email address to complete your account setup.',
    timestamp: new Date('2025-10-17T14:30:00'),
    status: 'delivered'
  }
]

export const chats: Chat[] = [
  {
    id: 'c1',
    participantId: 'p1',
    messages: messages.filter(m => m.chatId === 'c1')
  },
  {
    id: 'c2',
    participantId: 'p2',
    messages: messages.filter(m => m.chatId === 'c2')
  },
  {
    id: 'c3',
    participantId: 'p3',
    messages: messages.filter(m => m.chatId === 'c3')
  },
  {
    id: 'c4',
    participantId: 'p4',
    messages: messages.filter(m => m.chatId === 'c4')
  },
  {
    id: 'c5',
    participantId: 'p5',
    messages: messages.filter(m => m.chatId === 'c5')
  },
  {
    id: 'c6',
    participantId: 'p6',
    messages: messages.filter(m => m.chatId === 'c6')
  }
]
