"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ArrowRight, BarChart3, Bitcoin, Briefcase, CreditCard, LineChart, MessageSquare, Zap, TrendingUp, Activity, Shield, Rocket, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { TestimonialCard } from "@/components/testimonial-card"

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview");
  
  const sampleData = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 59 },
    { name: 'Mar', value: 80 },
    { name: 'Apr', value: 81 },
    { name: 'May', value: 56 },
    { name: 'Jun', value: 95 },
    { name: 'Jul', value: 78 }
  ];
  
  const riskScenarios = [
    { name: "Low Risk", value: 40, color: "#10b981" },
    { name: "Medium Risk", value: 35, color: "#f59e0b" },
    { name: "High Risk", value: 25, color: "#ef4444" }
  ];
  

  // Refs for scroll animations
  const featuresRef = useRef(null)
  const platformRef = useRef(null)
  const audienceRef = useRef(null)
  const testimonialsRef = useRef(null)
  const ctaRef = useRef(null)

  // Check if elements are in view
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 })
  const platformInView = useInView(platformRef, { once: true, amount: 0.2 })
  const audienceInView = useInView(audienceRef, { once: true, amount: 0.2 })
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 })
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 })

  // Parallax effect for hero section
  const { scrollY } = useScroll()
  const heroImageY = useTransform(scrollY, [0, 500], [0, 100])
  const heroTextY = useTransform(scrollY, [0, 500], [0, -50])

  // Set loaded state after initial render
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  }

  const fadeInUpVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const scaleInVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  const cardVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    hover: { 
      y: -10, 
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      } 
    }
  };
  
  const tabVariants = {
    inactive: { opacity: 0, y: 10, display: "none" },
    active: { 
      opacity: 1, 
      y: 0, 
      display: "flex",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/90">
      <LandingNavbar />

      {/* Hero Section with Animations */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        <AnimatePresence>
          {isLoaded && (
            <motion.div
              className="container mx-auto max-w-6xl relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="space-y-6"
                  style={{ y: heroTextY }}
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <motion.div
                    className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-500"
                    variants={itemVariants}
                  >
                    <Zap className="mr-1 h-3.5 w-3.5" />
                    <span>Powered by advanced AI algorithms</span>
                  </motion.div>

                  <motion.h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                    variants={itemVariants}
                  >
                    Trade Smarter with{" "}
                    <motion.span
                      className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 inline-block"
                      initial={{ backgroundPosition: "0% 50%" }}
                      animate={{ backgroundPosition: "100% 50%" }}
                      transition={{
                        duration: 5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "linear",
                      }}
                    >
                      TradeSense_Ai
                    </motion.span>
                  </motion.h1>

                  <motion.p className="text-xl text-muted-foreground max-w-lg" variants={itemVariants}>
                    An AI-powered trading platform that helps you make data-driven decisions, analyze market trends, and
                    optimize your investment strategy.
                  </motion.p>

                  <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
                    <Button size="lg" asChild className="relative overflow-hidden group">
                      <Link href="/dashboard">
                        <span className="relative z-10">Get Started</span>
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 z-0"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        />
                        <motion.div
                          className="absolute right-4 z-10"
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="relative overflow-hidden group">
                      <span className="relative z-10">Learn More</span>
                      <motion.span
                        className="absolute inset-0 bg-foreground/5 z-0"
                        initial={{ y: "100%" }}
                        whileHover={{ y: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    </Button>
                  </motion.div>

                  <motion.div className="flex items-center gap-4 text-sm text-muted-foreground" variants={itemVariants}>
                    <motion.div
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.05, color: "rgb(34, 197, 94)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Real-time data</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.05, color: "rgb(59, 130, 246)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>AI-powered insights</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.05, color: "rgb(168, 85, 247)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      <span>Secure platform</span>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="relative"
                  style={{ y: heroImageY }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-50"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />
                  <div className="relative bg-background/80 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden shadow-xl">
                    <motion.img
                      src="/header.jpg"
                      alt="TradeSense_Ai Dashboard Preview"
                      className="w-full h-auto"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 md:px-6 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Intelligent Risk-Managed Trading System
            </h2>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Why Monte Carlo Simulation?</h3>
              <article className="prose prose-gray dark:prose-invert">
                <p>
                  Our novel integration of Monte Carlo methods revolutionizes automated trading by providing dynamic risk assessment. 
                  While traditional systems use static risk parameters, our solution performs 10,000+ market scenario simulations 
                  for every potential trade, analyzing:
                </p>
                <ul>
                  <li>Price volatility distributions</li>
                  <li>Black swan event probabilities</li>
                  <li>Correlated asset movements</li>
                  <li>Liquidity shock scenarios</li>
                </ul>
                <p>
                  This probabilistic approach enables our AI to <strong>quantify uncertainty</strong> in ways deterministic models cannot. 
                  When combined with LSTM price predictions and RSI technical signals, we create three layers of protection:
                </p>
              </article>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-blue-100 dark:border-gray-700">
                <div className="text-blue-600 dark:text-blue-400 mb-2">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h4 className="font-semibold">RSI Signals</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Entry/Exit Timing</p>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-purple-100 dark:border-gray-700">
                <div className="text-purple-600 dark:text-purple-400 mb-2">
                  <Activity className="h-6 w-6" />
                </div>
                <h4 className="font-semibold">LSTM Network</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Price Forecasting</p>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-green-100 dark:border-gray-700">
                <div className="text-green-600 dark:text-green-400 mb-2">
                  <Shield className="h-6 w-6" />
                </div>
                <h4 className="font-semibold">Monte Carlo</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Risk Simulation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section> */}
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <motion.div 
            className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            Proprietary Technology
          </motion.div>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Intelligent Risk-Managed Trading System
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our AI-powered platform combines advanced predictive models with sophisticated risk management to deliver exceptional trading results
          </motion.p>
        </motion.div>
        
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center mb-16">
          <motion.div 
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2 mb-4">
                {["overview", "performance", "simulation"].map((tab) => (
                  <motion.button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.button>
                ))}
              </div>
              
              <div className="relative h-64">
                <motion.div 
                  className="h-64 flex items-center justify-center relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
                  variants={tabVariants}
                  initial="inactive"
                  animate={activeTab === "overview" ? "active" : "inactive"}
                  key="overview"
                >
                  <div className="absolute inset-0 opacity-30">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <motion.path 
                        d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" 
                        fill="url(#gradient1)"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                      />
                      <motion.path 
                        d="M0,70 Q25,50 50,70 T100,70 L100,100 L0,100 Z" 
                        fill="url(#gradient2)" 
                        opacity="0.8"
                        initial={{ y: 0 }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                      />
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="z-10 text-center p-6">
                    <motion.h3 
                      className="text-2xl font-bold mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      Triple-Layer Protection
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600 dark:text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      Our system combines technical indicators, neural networks, and advanced risk modeling
                    </motion.p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="h-64 flex flex-col justify-center absolute top-0 left-0 right-0"
                  variants={tabVariants}
                  initial="inactive"
                  animate={activeTab === "performance" ? "active" : "inactive"}
                  key="performance"
                >
                  <div className="w-full h-full flex">
                    {sampleData.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end">
                        <motion.div 
                          className="w-full mx-1 rounded-t-sm"
                          style={{ 
                            background: `linear-gradient(to top, #3b82f6, #8b5cf6)`,
                            height: "0%"
                          }}
                          animate={{ 
                            height: `${item.value}%`
                          }}
                          transition={{ 
                            duration: 0.8, 
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 50
                          }}
                        />
                        <motion.span 
                          className="text-xs mt-1 text-gray-600 dark:text-gray-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          {item.name}
                        </motion.span>
                      </div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div 
                  className="h-64 flex items-center justify-center absolute top-0 left-0 right-0"
                  variants={tabVariants}
                  initial="inactive"
                  animate={activeTab === "simulation" ? "active" : "inactive"}
                  key="simulation"
                >
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                      
                      {riskScenarios.map((scenario, index) => {
                        const previousValues = riskScenarios.slice(0, index).reduce((sum, item) => sum + item.value, 0);
                        const dashArray = 251.2;
                        const dashOffset = dashArray;
                        const finalDashOffset = dashArray - (dashArray * scenario.value) / 100;
                        const rotation = (previousValues * 3.6) - 90;
                        
                        return (
                          <motion.circle 
                            key={index}
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none" 
                            stroke={scenario.color}
                            strokeWidth="10" 
                            strokeDasharray={dashArray}
                            initial={{ strokeDashoffset: dashArray }}
                            animate={{ strokeDashoffset: finalDashOffset }}
                            transition={{ 
                              duration: 1.5, 
                              delay: index * 0.3,
                              ease: "easeOut" 
                            }}
                            transform={`rotate(${rotation} 50 50)`}
                          />
                        );
                      })}
                    </svg>
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      <div className="text-center">
                        <motion.span 
                          className="block text-3xl font-bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                        >
                          10k+
                        </motion.span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Simulations</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="space-y-6 order-1 lg:order-2"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h3 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              variants={itemVariant}
            >
              Why Monte Carlo Simulation?
            </motion.h3>
            <motion.p 
              className="text-gray-700 dark:text-gray-300"
              variants={itemVariant}
            >
              Our novel integration of Monte Carlo methods revolutionizes automated trading by providing dynamic risk assessment in real-time market conditions.
            </motion.p>
            
            <motion.div 
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[
                {
                  title: "Beyond Static Risk Parameters",
                  description: "While traditional systems rely on fixed risk thresholds, our platform runs 10,000+ scenario simulations for each potential trade."
                },
                {
                  title: "Comprehensive Risk Analysis",
                  description: "Our system analyzes price volatility distributions, black swan event probabilities, correlated asset movements, and liquidity shock scenarios."
                },
                {
                  title: "Quantifiable Uncertainty",
                  description: "This probabilistic approach enables our AI to quantify uncertainty in ways deterministic models cannot match."
                }
              ].map((item, index) => (
                <motion.div 
                  className="flex"
                  key={index}
                  variants={itemVariant}
                  custom={index}
                >
                  <motion.div 
                    className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 mr-3"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {[
            {
              icon: <TrendingUp className="h-6 w-6" />,
              title: "RSI Signals",
              description: "Adaptive technical indicators identify optimal entry and exit points across timeframes",
              label: "Entry/Exit Precision",
              color: "blue"
            },
            {
              icon: <Activity className="h-6 w-6" />,
              title: "LSTM Network",
              description: "Deep learning models predict price movements by analyzing complex market patterns and relationships",
              label: "Price Forecasting",
              color: "purple"
            },
            {
              icon: <Shield className="h-6 w-6" />,
              title: "Monte Carlo",
              description: "Powerful probabilistic modeling simulates thousands of market scenarios to quantify potential outcomes",
              label: "Risk Simulation",
              color: "green"
            }
          ].map((card, index) => (
            <motion.div
              key={index}
              className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-${card.color}-100 dark:border-${card.color}-900`}
              variants={cardVariant}
              whileHover="hover"
              custom={index}
            >
              <motion.div 
                className={`w-12 h-12 rounded-full bg-${card.color}-100 dark:bg-${card.color}-900 flex items-center justify-center text-${card.color}-600 dark:text-${card.color}-200 mb-4`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {card.icon}
              </motion.div>
              <motion.h4 
                className="text-xl font-bold mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {card.title}
              </motion.h4>
              <motion.p 
                className="text-gray-600 dark:text-gray-400 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                {card.description}
              </motion.p>
              <motion.div 
                className={`flex items-center text-sm text-${card.color}-600 dark:text-${card.color}-400 font-medium`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <span>{card.label}</span>
                <Zap className="ml-1 h-4 w-4" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.a 
            href="#" 
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-medium shadow-lg hover:from-blue-700 hover:to-purple-700"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Learn How It Works
          </motion.a>
        </motion.div>
      </div>
    </section>

      {/* Features Section with Scroll Animations */}
      <section className="py-20 px-4 relative" ref={featuresRef} id="features">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
        <motion.div
          className="container mx-auto max-w-6xl relative z-10"
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={fadeInUpVariants}
        >
          <motion.div className="text-center mb-16" variants={fadeInUpVariants}>
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4" variants={fadeInUpVariants}>
              Powerful Features for Modern Traders
            </motion.h2>
            <motion.p className="text-xl text-muted-foreground max-w-2xl mx-auto" variants={fadeInUpVariants}>
              TradeSense_Ai combines cutting-edge technology with intuitive design to provide you with the tools you
              need to succeed in today's markets.
            </motion.p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-blue-500" />}
              title="Advanced Market Analysis"
              description="Get real-time insights into market trends, with AI-powered analysis of price movements, volume patterns, and market sentiment."
              variants={itemVariants}
            />

            <FeatureCard
              icon={<LineChart className="h-10 w-10 text-purple-500" />}
              title="Algorithmic Trading"
              description="Create, test, and deploy custom trading algorithms with our intuitive interface. No coding experience required."
              variants={itemVariants}
              delay={1}
            />

            <FeatureCard
              icon={<Briefcase className="h-10 w-10 text-green-500" />}
              title="Portfolio Management"
              description="Track your investments in one place with detailed performance metrics, risk analysis, and diversification recommendations."
              variants={itemVariants}
              delay={2}
            />

            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-yellow-500" />}
              title="FinChatbot Integration"
              description="Get instant answers to your financial questions with our AI-powered chatbot, trained on the latest market data and financial knowledge."
              variants={itemVariants}
              delay={3}
            />

            <FeatureCard
              icon={<Bitcoin className="h-10 w-10 text-orange-500" />}
              title="Crypto & Stock Trading"
              description="Trade both traditional stocks and cryptocurrencies from a single platform with advanced charting and analysis tools."
              variants={itemVariants}
              delay={4}
            />

            <FeatureCard
              icon={<CreditCard className="h-10 w-10 text-red-500" />}
              title="Transaction Tracking"
              description="Keep detailed records of all your trades with comprehensive transaction history, performance metrics, and tax reporting tools."
              variants={itemVariants}
              delay={5}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Platform Overview with Scroll Animations */}
      <section className="py-20 px-4 bg-muted/30 relative" ref={platformRef} id="platform">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
        <motion.div
          className="container mx-auto max-w-6xl relative z-10"
          initial="hidden"
          animate={platformInView ? "visible" : "hidden"}
          variants={fadeInUpVariants}
        >
          <motion.div className="text-center mb-16" variants={fadeInUpVariants}>
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4" variants={fadeInUpVariants}>
              A Complete Trading Ecosystem
            </motion.h2>
            <motion.p className="text-xl text-muted-foreground max-w-2xl mx-auto" variants={fadeInUpVariants}>
              TradeSense_Ai provides a comprehensive suite of tools designed to enhance your trading experience from
              analysis to execution.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20"
            variants={containerVariants}
          >
            <motion.div className="order-2 lg:order-1" variants={fadeInVariants}>
              <motion.h3 className="text-2xl font-bold mb-4" variants={itemVariants}>
                Real-time Dashboard
              </motion.h3>
              <motion.p className="text-muted-foreground mb-6" variants={itemVariants}>
                Our intuitive dashboard gives you a complete overview of the markets, your portfolio, and key metrics in
                real-time. Customize your view to focus on what matters most to you.
              </motion.p>
              <motion.ul className="space-y-3" variants={containerVariants}>
                {[
                  "Live market data for stocks and cryptocurrencies",
                  "Portfolio performance tracking with visual analytics",
                  "Personalized watchlists and alerts",
                  "Market news and sentiment analysis",
                  "Economic calendar and event notifications",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className="mr-2 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-blue-500/20"
                      whileHover={{ scale: 1.2, backgroundColor: "rgba(59, 130, 246, 0.3)" }}
                    >
                      <motion.div className="h-2 w-2 rounded-full bg-blue-500" whileHover={{ scale: 1.5 }} />
                    </motion.div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
            <motion.div className="order-1 lg:order-2 relative" variants={scaleInVariants}>
              <motion.div
                className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-xl opacity-50"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="relative bg-background/80 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden shadow-xl"
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <img
                  src="/Dashboard.jpg"
                  alt="TradeSense_Ai Dashboard"
                  className="w-full h-auto"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" variants={containerVariants}>
            <motion.div className="relative" variants={scaleInVariants}>
              <motion.div
                className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl blur-xl opacity-50"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="relative bg-background/80 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden shadow-xl"
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <img
                  src="/analysis.avif"
                  alt="TradeSense_Ai Analysis Tools"
                  className="w-full h-auto"
                />
              </motion.div>
            </motion.div>
            <motion.div variants={fadeInVariants}>
              <motion.h3 className="text-2xl font-bold mb-4" variants={itemVariants}>
                Advanced Analysis Tools
              </motion.h3>
              <motion.p className="text-muted-foreground mb-6" variants={itemVariants}>
                Our platform provides sophisticated analysis tools powered by AI to help you identify trends, patterns,
                and opportunities in the market before others do.
              </motion.p>
              <motion.ul className="space-y-3" variants={containerVariants}>
                {[
                  "Technical analysis with over 100+ indicators",
                  "Pattern recognition powered by machine learning",
                  "Sentiment analysis of news and social media",
                  "Correlation analysis across multiple assets",
                  "Backtesting capabilities for strategy validation",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className="mr-2 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-purple-500/20"
                      whileHover={{ scale: 1.2, backgroundColor: "rgba(168, 85, 247, 0.3)" }}
                    >
                      <motion.div className="h-2 w-2 rounded-full bg-purple-500" whileHover={{ scale: 1.5 }} />
                    </motion.div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Target Audience with Scroll Animations */}
      <section className="py-20 px-4 relative" ref={audienceRef} id="audience">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
        <motion.div
          className="container mx-auto max-w-6xl relative z-10"
          initial="hidden"
          animate={audienceInView ? "visible" : "hidden"}
          variants={fadeInUpVariants}
        >
          <motion.div className="text-center mb-16" variants={fadeInUpVariants}>
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4" variants={fadeInUpVariants}>
              Who TradeSense_Ai Is For
            </motion.h2>
            <motion.p className="text-xl text-muted-foreground max-w-2xl mx-auto" variants={fadeInUpVariants}>
              Our platform is designed to serve traders and investors at all experience levels, providing the tools and
              insights needed to succeed in today's complex markets.
            </motion.p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
            <AudienceCard
              title="New Investors"
              description="Get started with confidence using our intuitive interface and educational resources. TradeSense_Ai helps you understand the markets and make informed decisions from day one."
              features={[
                "Guided onboarding process",
                "Educational resources and tutorials",
                "Risk management tools",
                "Simplified interface options",
              ]}
              variants={itemVariants}
            />

            <AudienceCard
              title="Active Traders"
              description="Take advantage of our advanced analysis tools, real-time data, and algorithmic trading capabilities to identify and capitalize on market opportunities."
              features={[
                "Real-time market data and alerts",
                "Advanced technical analysis",
                "Custom algorithm creation",
                "Multi-device synchronization",
              ]}
              variants={itemVariants}
              delay={1}
            />

            <AudienceCard
              title="Portfolio Managers"
              description="Manage multiple portfolios with comprehensive analytics, risk assessment tools, and performance tracking to optimize returns and minimize risk."
              features={[
                "Multi-portfolio management",
                "Advanced risk analytics",
                "Performance attribution",
                "Client reporting tools",
              ]}
              variants={itemVariants}
              delay={2}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials with Scroll Animations */}
      <section className="py-20 px-4 bg-muted/30 relative" ref={testimonialsRef} id="testimonials">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
        <motion.div
          className="container mx-auto max-w-6xl relative z-10"
          initial="hidden"
          animate={testimonialsInView ? "visible" : "hidden"}
          variants={fadeInUpVariants}
        >
          <motion.div className="text-center mb-16" variants={fadeInUpVariants}>
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4" variants={fadeInUpVariants}>
              What Our Users Say
            </motion.h2>
            <motion.p className="text-xl text-muted-foreground max-w-2xl mx-auto" variants={fadeInUpVariants}>
              Hear from traders and investors who have transformed their approach to the markets with TradeSense_Ai.
            </motion.p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <TestimonialCard
                quote="TradeSense_Ai has completely transformed my trading strategy. The AI-powered insights have helped me identify opportunities I would have otherwise missed."
                author="Vedant Sharma"
                role="Day Trader"
                avatarUrl="/avatar.png"
              />
            </motion.div>

            <motion.div variants={itemVariants} custom={1}>
              <TestimonialCard
                quote="As someone new to investing, I was intimidated by the complexity of the markets. TradeSense_Ai made it accessible and helped me build a solid portfolio."
                author="Pratik Agrawal"
                role="New Investor"
                avatarUrl="/avatar.png"
              />
            </motion.div>

            <motion.div variants={itemVariants} custom={2}>
              <TestimonialCard
                quote="The algorithmic trading features have saved me countless hours. I can now automate my strategies and focus on refining my approach rather than executing trades."
                author="Ravi Mehta"
                role="Portfolio Manager"
                avatarUrl="/avatar.png"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section with Scroll Animations */}
      <section className="py-20 px-4 relative" ref={ctaRef}>
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
        <motion.div
          className="container mx-auto max-w-6xl relative z-10"
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={scaleInVariants}
        >
          <motion.div
            className="relative overflow-hidden rounded-xl border border-border/40 bg-background/80 backdrop-blur-sm p-8 md:p-12"
            variants={scaleInVariants}
            whileHover={{
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10"
              animate={{
                background: [
                  "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))",
                  "linear-gradient(to right, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))",
                  "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "linear",
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-purple-600/0 via-purple-600/50 to-purple-600/0"></div>

            <motion.div className="relative text-center max-w-3xl mx-auto" variants={containerVariants}>
              <motion.h2 className="text-3xl md:text-4xl font-bold mb-4" variants={itemVariants}>
                Ready to Transform Your Trading?
              </motion.h2>
              <motion.p className="text-xl text-muted-foreground mb-8" variants={itemVariants}>
                Join thousands of traders who are already using TradeSense_Ai to gain an edge in the markets. Get
                started today and experience the power of AI-driven trading.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row justify-center gap-4" variants={itemVariants}>
                <Button size="lg" asChild className="relative overflow-hidden group">
                  <Link href="/dashboard">
                    <span className="relative z-10">Get Started Now</span>
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 z-0"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute right-4 z-10"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="relative overflow-hidden group">
                  <span className="relative z-10">Schedule a Demo</span>
                  <motion.span
                    className="absolute inset-0 bg-foreground/5 z-0"
                    initial={{ y: "100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  variants,
  delay = 0,
}: {
  icon: React.ReactNode
  title: string
  description: string
  variants?: any
  delay?: number
}) {
  return (
    <motion.div variants={variants} custom={delay}>
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="bg-background/80 backdrop-blur-sm border-border/40 h-full">
          <CardHeader>
            <motion.div
              className="mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              {icon}
            </motion.div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">{description}</CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function AudienceCard({
  title,
  description,
  features,
  variants,
  delay = 0,
}: {
  title: string
  description: string
  features: string[]
  variants?: any
  delay?: number
}) {
  return (
    <motion.div variants={variants} custom={delay}>
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="bg-background/80 backdrop-blur-sm border-border/40 h-full">
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-base">{description}</CardDescription>
            <motion.ul className="space-y-2">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    className="mr-2 mt-1 h-4 w-4 flex items-center justify-center rounded-full bg-blue-500/20"
                    whileHover={{ scale: 1.2, backgroundColor: "rgba(59, 130, 246, 0.3)" }}
                  >
                    <motion.div className="h-1.5 w-1.5 rounded-full bg-blue-500" whileHover={{ scale: 1.5 }} />
                  </motion.div>
                  <span className="text-sm">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

