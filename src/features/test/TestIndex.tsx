import React from 'react'
import Layout1 from '@/shared/layouts/Layout1'

const TestIndex = () => {
  return (
    <Layout1>
      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          {/* Hero Section */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6 sm:p-8 lg:p-12 shadow-2xl border border-white/20">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl mb-4">
                Welcome to Test UI
              </h2>
              <p className="text-lg text-white/90 sm:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto">
                This is a fully responsive page that adapts beautifully from desktop to mobile devices.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="w-full sm:w-auto px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg">
                  Get Started
                </button>
                <button className="w-full sm:w-auto px-8 py-3 bg-transparent text-white border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200">
                  Learn More
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-200">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-white mb-2">Beautiful Design</h3>
                <p className="text-white/80 text-sm">
                  Modern and elegant UI with smooth animations
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-200">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-white mb-2">Fully Responsive</h3>
                <p className="text-white/80 text-sm">
                  Optimized for all screen sizes and devices
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-200 sm:col-span-2 lg:col-span-1">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-white mb-2">Fast Performance</h3>
                <p className="text-white/80 text-sm">
                  Built with modern technologies for speed
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-white/70 text-sm">
            &copy; 2025 Test UI. All rights reserved.
          </p>
        </div>
      </footer>
    </Layout1>
  )
}

export default TestIndex