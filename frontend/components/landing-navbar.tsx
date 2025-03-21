"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-sm transition-all duration-300 ${
        scrolled ? "bg-background/90 shadow-md" : "bg-background/80"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-8 h-8">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
            <div className="absolute inset-0.5 bg-background rounded-full flex items-center justify-center">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          </div>
          <motion.div
            className="font-bold text-lg tracking-tight"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            TradeSense
            <motion.span
              className="text-blue-500"
              animate={{
                color: ["#3b82f6", "#8b5cf6", "#3b82f6"],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              _Ai
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.nav
          className="hidden md:flex items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {["Features", "Platform", "Pricing", "Testimonials", "FAQ"].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
            >
              <Link
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item}
                <motion.span
                  className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <motion.div
          className="hidden md:flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Log In</Link>
          </Button>
          <Button size="sm" asChild className="relative overflow-hidden group">
            <Link href="/dashboard">
              <span className="relative z-10">Get Started</span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 z-0"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </Link>
          </Button>
        </motion.div>

        <motion.button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </motion.button>
      </div>

      {/* Mobile menu with animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden border-t border-border/40 bg-background"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {["Features", "Platform", "Pricing", "Testimonials", "FAQ"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-medium py-2 hover:text-blue-500 transition-colors block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="flex flex-col gap-2 pt-2 border-t border-border/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button variant="outline" asChild>
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

