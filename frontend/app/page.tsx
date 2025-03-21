"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ArrowRight, BarChart3, Bitcoin, Briefcase, CreditCard, LineChart, MessageSquare, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { TestimonialCard } from "@/components/testimonial-card"

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)

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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/90">
      <LandingNavbar />

      {/* Hero Section with Animations */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden">
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
                      src="/placeholder.svg?height=600&width=800"
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
                  src="/placeholder.svg?height=500&width=700"
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
                  src="/placeholder.svg?height=500&width=700"
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
                author="Sarah J."
                role="Day Trader"
                avatarUrl="/placeholder.svg?height=100&width=100"
              />
            </motion.div>

            <motion.div variants={itemVariants} custom={1}>
              <TestimonialCard
                quote="As someone new to investing, I was intimidated by the complexity of the markets. TradeSense_Ai made it accessible and helped me build a solid portfolio."
                author="Michael T."
                role="New Investor"
                avatarUrl="/placeholder.svg?height=100&width=100"
              />
            </motion.div>

            <motion.div variants={itemVariants} custom={2}>
              <TestimonialCard
                quote="The algorithmic trading features have saved me countless hours. I can now automate my strategies and focus on refining my approach rather than executing trades."
                author="David L."
                role="Portfolio Manager"
                avatarUrl="/placeholder.svg?height=100&width=100"
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

