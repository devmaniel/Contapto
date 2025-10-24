import React from 'react'
import backgroundImage from '../../assets/background/26987170_v904-nunny-012-l.jpg'
import Navbar from '../components/navbar'

interface Layout1Props {
  children: React.ReactNode
}

const Layout1: React.FC<Layout1Props> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Navbar */}
      <div className="relative z-40">
        <Navbar />
      </div>

      {/* Content Container - Matches navbar width */}
      <div className="relative z-0 w-full flex justify-center">
        <div className="w-full max-w-[1550px] mx-5">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout1