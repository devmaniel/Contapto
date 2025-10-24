# 🏗️ Architecture Overview

## System Architecture

Contapto is built as a modern, scalable web application using a microservices-inspired architecture with real-time capabilities and blockchain integration.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   React    │  │  TypeScript  │  │  TanStack Router   │  │
│  │  Frontend  │  │   Type Safe  │  │   Navigation       │  │
│  └────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API & Services Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Supabase   │  │   Ethers.js  │  │  Real-time WS   │  │
│  │   Backend    │  │   Crypto     │  │   Connections   │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  PostgreSQL  │  │  Blockchain  │  │  File Storage   │  │
│  │   Database   │  │   Network    │  │                 │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### **Frontend Layer**

#### Core Framework
- **React 18+**: Component-based UI library
  - Functional components with hooks
  - Concurrent rendering for better performance
  - Suspense for data fetching

- **TypeScript**: Type-safe development
  - Compile-time error detection
  - Enhanced IDE support
  - Better code maintainability

#### Routing & Navigation
- **TanStack Router**: Modern routing solution
  - Type-safe routing
  - Code splitting
  - Nested routes support
  - Search params management

#### UI Framework
- **TailwindCSS**: Utility-first CSS framework
  - Rapid UI development
  - Consistent design system
  - Responsive design utilities
  - Custom theme configuration

- **shadcn/ui**: High-quality component library
  - Accessible components
  - Customizable and composable
  - Built on Radix UI primitives
  - Dark mode support

#### Data Visualization
- **Recharts**: React charting library
  - Interactive charts for investment data
  - Multiple chart types (line, bar, area)
  - Responsive and animated
  - Customizable styling

---

### **Backend & Services Layer**

#### Backend-as-a-Service
- **Supabase**: Comprehensive backend platform
  - **PostgreSQL Database**: Relational data storage
  - **Authentication**: Phone-based auth system
  - **Real-time Subscriptions**: WebSocket connections
  - **Row Level Security**: Database-level permissions
  - **RESTful API**: Auto-generated from schema
  - **Edge Functions**: Serverless compute

#### Blockchain Integration
- **Ethers.js**: Ethereum library
  - Cryptocurrency payment processing
  - Wallet integration
  - Smart contract interaction
  - Transaction management

---

## Core Modules

### 1. **Authentication Module** 🔐

#### Components:
- Phone number registration
- OTP verification
- Session management
- Token refresh logic

#### Technology:
- Supabase Auth
- JWT tokens
- Secure cookie storage

#### Flow:
```
User → Phone Input → OTP Sent → Verification → Session Created → Access Granted
```

---

### 2. **Messaging Module** 💬

#### Features:
- Real-time message delivery
- Contact management
- Conversation threads
- Message history

#### Architecture:
- **Frontend**: React components with real-time updates
- **Backend**: Supabase real-time subscriptions
- **Database**: Messages table with indexes on user_id and timestamp
- **Transport**: WebSocket connections

#### Data Flow:
```
User A → Message Sent → Supabase DB → Real-time Broadcast → User B Receives
```

---

### 3. **Voice Calling Module** 📞

#### Features:
- Peer-to-peer voice calls
- Call state management
- Audio quality optimization
- Call history tracking

#### Technology Stack:
- WebRTC for peer connections
- Supabase for signaling
- STUN/TURN servers for NAT traversal

#### Call Flow:
```
Caller → Initiate Call → Signaling → Callee Receives → Connection Established → Audio Stream
```

---

### 4. **Credit System Module** 💳

#### Components:
- Credit purchase interface
- Balance tracking
- Transaction history
- Payment processing

#### Payment Methods:
- **PHP Payments**: Traditional payment gateway integration
- **Cryptocurrency**: Ethers.js for blockchain transactions

#### Database Schema:
```
users
  ├── user_id
  ├── credit_balance
  └── phone_number

transactions
  ├── transaction_id
  ├── user_id
  ├── amount
  ├── type (purchase/deduction)
  ├── payment_method
  └── timestamp
```

---

### 5. **Promotional System Module** 🎯

#### Features:
- Promo package catalog
- Redemption logic
- Usage tracking
- Expiration management

#### Architecture:
- **Promo Definitions**: Stored in database
- **Redemption Engine**: Serverless functions
- **Usage Tracker**: Real-time balance updates

---

### 6. **Investment Platform Module** 📈

#### Components:
- Market data visualization
- Token purchase interface
- Portfolio tracking
- Price history charts

#### Data Management:
- **Price Feed**: Real-time or periodic updates
- **Historical Data**: Time-series storage
- **User Holdings**: Portfolio table
- **Transactions**: Buy/sell records

#### Chart Timeframes:
- 1 Day (1D)
- 7 Days (7D)
- 1 Month (1M)
- 3 Months (3M)
- 1 Year (1Y)
- All-time

---

### 7. **Health Monitoring Module** 🛡️

#### Features:
- System health checks
- Service status monitoring
- Performance metrics
- Error tracking

#### Implementation:
- Periodic health check endpoints
- Real-time status dashboard
- Alert system for failures

---

## Data Architecture

### **Database Schema (PostgreSQL)**

#### Core Tables:
```sql
-- Users
users (
  id UUID PRIMARY KEY,
  phone_number VARCHAR UNIQUE,
  credit_balance DECIMAL,
  created_at TIMESTAMP
)

-- Messages
messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users,
  receiver_id UUID REFERENCES users,
  content TEXT,
  timestamp TIMESTAMP,
  status VARCHAR
)

-- Calls
calls (
  id UUID PRIMARY KEY,
  caller_id UUID REFERENCES users,
  callee_id UUID REFERENCES users,
  duration INTEGER,
  cost DECIMAL,
  timestamp TIMESTAMP
)

-- Transactions
transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  amount DECIMAL,
  type VARCHAR,
  payment_method VARCHAR,
  timestamp TIMESTAMP
)

-- Promos
promos (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  cost DECIMAL,
  benefits JSONB
)

-- User Promos
user_promos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  promo_id UUID REFERENCES promos,
  activated_at TIMESTAMP,
  expires_at TIMESTAMP
)

-- Investments
investments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  token_amount DECIMAL,
  purchase_price DECIMAL,
  timestamp TIMESTAMP
)

-- Token Prices
token_prices (
  id UUID PRIMARY KEY,
  price DECIMAL,
  timestamp TIMESTAMP
)
```

---

## Security Architecture

### **Authentication & Authorization**
- Phone-based authentication
- JWT token validation
- Row-level security policies
- API rate limiting

### **Data Protection**
- Encrypted data transmission (HTTPS)
- Encrypted data at rest
- Secure credential storage
- PII data handling compliance

### **Payment Security**
- PCI compliance for PHP payments
- Secure wallet integration for crypto
- Transaction verification
- Fraud detection mechanisms

---

## Scalability Considerations

### **Horizontal Scaling**
- Stateless frontend (CDN deployment)
- Supabase auto-scaling
- Load balancing for API requests

### **Performance Optimization**
- Code splitting and lazy loading
- Image optimization
- Database query optimization
- Caching strategies (Redis/CDN)

### **Real-time Optimization**
- WebSocket connection pooling
- Message queuing for high traffic
- Efficient database indexes

---

## Deployment Architecture

### **Frontend Deployment**
- Static site hosting (Vercel/Netlify)
- CDN distribution
- Automatic HTTPS
- CI/CD pipeline

### **Backend Deployment**
- Supabase managed infrastructure
- Edge functions deployment
- Database migrations
- Monitoring and logging

---

## Development Workflow

### **Local Development**
```
npm install → npm run dev → Local server (localhost:5173)
```

### **Build Process**
```
TypeScript Compilation → React Build → Asset Optimization → Production Bundle
```

### **Testing Strategy**
- Unit tests for components
- Integration tests for API calls
- E2E tests for critical flows
- Performance testing

---

## Monitoring & Observability

### **Application Monitoring**
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- Real-time dashboards

### **Infrastructure Monitoring**
- Database performance
- API response times
- WebSocket connection health
- Resource utilization

---

## Future Architecture Enhancements

### **Planned Improvements**
- Microservices migration for specific modules
- GraphQL API layer
- Advanced caching with Redis
- Message queue for async processing
- AI-powered features (chatbots, recommendations)
- Multi-region deployment
- Enhanced blockchain integration

---

## Technology Decisions Rationale

### **Why React + TypeScript?**
- Industry standard with large ecosystem
- Type safety reduces runtime errors
- Excellent developer experience
- Strong community support

### **Why Supabase?**
- Rapid development with BaaS
- Built-in real-time capabilities
- PostgreSQL reliability
- Cost-effective scaling
- Open-source alternative to Firebase

### **Why TailwindCSS + shadcn/ui?**
- Fast UI development
- Consistent design system
- Highly customizable
- Excellent accessibility

### **Why Ethers.js?**
- Comprehensive Ethereum library
- Well-documented
- Active maintenance
- Secure wallet integration
