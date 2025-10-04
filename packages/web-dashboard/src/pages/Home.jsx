import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Scan, Shield, TrendingUp, ArrowRight, CheckCircle, Sparkles, Zap, Globe } from 'lucide-react'
import { useUser } from '../contexts/UserContext'

const Home = () => {
  const { isAuthenticated } = useUser()
  const [isVisible, setIsVisible] = useState(false)
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0])

  useEffect(() => {
    setIsVisible(true)
    
    // Animate stats
    const targetStats = [1234, 456, 7890, 98.5]
    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps
    
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      
      setAnimatedStats(targetStats.map(target => Math.floor(target * easeOutCubic)))
      
      if (currentStep >= steps) {
        clearInterval(interval)
        setAnimatedStats(targetStats)
      }
    }, stepDuration)
    
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Package,
      title: 'Batch Tracking',
      description: 'Track your produce from farm to consumer with complete transparency.',
      color: 'from-blue-500 to-blue-600',
      delay: 'delay-0'
    },
    {
      icon: Scan,
      title: 'QR Code Scanning',
      description: 'Generate and scan QR codes for instant product information.',
      color: 'from-green-500 to-green-600',
      delay: 'delay-100'
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Ensure product quality with blockchain-verified certifications.',
      color: 'from-purple-500 to-purple-600',
      delay: 'delay-200'
    },
    {
      icon: TrendingUp,
      title: 'Fair Pricing',
      description: 'Transparent pricing with government-regulated fair price ranges.',
      color: 'from-orange-500 to-orange-600',
      delay: 'delay-300'
    }
  ]

  const stats = [
    { label: 'Active Batches', value: animatedStats[0].toLocaleString(), icon: Package },
    { label: 'Farmers Registered', value: animatedStats[1].toLocaleString(), icon: Globe },
    { label: 'Products Tracked', value: animatedStats[2].toLocaleString(), icon: Zap },
    { label: 'Quality Score', value: `${animatedStats[3]}%`, icon: CheckCircle }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className={`text-center py-16 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-primary-600 font-semibold text-lg">Revolutionary Technology</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className={`inline-block transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                Blockchain Supply Chain
              </span>
              <br />
              <span className={`inline-block text-primary-600 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                for Agriculture
              </span>
            </h1>
          </div>
          
          <p className={`text-xl text-gray-600 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Track agricultural produce from farm to consumer with complete transparency, 
            quality assurance, and fair pricing using blockchain technology.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-primary inline-flex items-center group hover:scale-105 transition-all duration-300">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link to="/scan" className="btn-outline inline-flex items-center group hover:scale-105 transition-all duration-300">
                  Scan QR Code
                  <Scan className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary inline-flex items-center group hover:scale-105 transition-all duration-300">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link to="/login" className="btn-outline inline-flex items-center group hover:scale-105 transition-all duration-300">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div 
              key={index} 
              className={`text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${1300 + index * 100}ms` }}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary-600 mb-2 group-hover:text-primary-700 transition-colors duration-300">
                {stat.value}
              </div>
              <div className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                {stat.label}
              </div>
            </div>
          )
        })}
      </section>

      {/* Features Section */}
      <section className={`transition-all duration-1000 delay-1400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform provides comprehensive tools for supply chain management 
            with blockchain technology.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className={`card hover:shadow-xl transition-all duration-500 hover:scale-105 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${1500 + index * 150}ms` }}
              >
                <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  {feature.description}
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`bg-gray-50 rounded-2xl p-8 transition-all duration-1000 delay-1600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                { title: 'Complete Transparency', desc: 'Every step of the supply chain is recorded on the blockchain.' },
                { title: 'Quality Assurance', desc: 'Blockchain-verified quality certifications and testing results.' },
                { title: 'Fair Pricing', desc: 'Government-regulated pricing ensures fair compensation for farmers.' }
              ].map((benefit, index) => (
                <div 
                  key={index}
                  className={`flex items-start space-x-3 p-4 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300 group ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                  style={{ transitionDelay: `${1700 + index * 100}ms` }}
                >
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                { title: 'Real-time Tracking', desc: 'Monitor your produce in real-time with GPS and IoT sensors.' },
                { title: 'Mobile Access', desc: 'Access the platform from anywhere with our mobile app.' },
                { title: 'Compliance Ready', desc: 'Built-in compliance with food safety and regulatory standards.' }
              ].map((benefit, index) => (
                <div 
                  key={index}
                  className={`flex items-start space-x-3 p-4 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300 group ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                  style={{ transitionDelay: `${1700 + (index + 3) * 100}ms` }}
                >
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl p-12 relative overflow-hidden transition-all duration-1000 delay-1800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white to-transparent transform -skew-y-12"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-white to-transparent transform skew-y-12"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of farmers and consumers using blockchain technology for transparent supply chains.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-all duration-300 inline-flex items-center group hover:scale-105 hover:shadow-lg"
            >
              Register Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link 
              to="/login" 
              className="border border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-6 rounded-lg transition-all duration-300 group hover:scale-105 hover:shadow-lg"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
