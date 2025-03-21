"use client"

import type React from "react"

import { motion } from "framer-motion"
import Link from "next/link"
import { Zap } from "lucide-react"

export function LandingFooter() {
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

  return (
    <motion.footer
      className="border-t border-border/40 bg-background/80 backdrop-blur-sm"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-8" variants={containerVariants}>
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="flex items-center gap-2">
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
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="font-bold text-lg tracking-tight">
                TradeSense<span className="text-blue-500">_Ai</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered trading platform for stocks and cryptocurrencies. Make data-driven decisions and optimize your
              investment strategy.
            </p>
          </motion.div>

          <FooterColumn
            title="Product"
            links={[
              { label: "Features", href: "#" },
              { label: "Pricing", href: "#" },
              { label: "Integrations", href: "#" },
              { label: "API", href: "#" },
            ]}
            variants={itemVariants}
          />

          <FooterColumn
            title="Resources"
            links={[
              { label: "Documentation", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Tutorials", href: "#" },
              { label: "Support", href: "#" },
            ]}
            variants={itemVariants}
          />

          <FooterColumn
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
            ]}
            variants={itemVariants}
          />
        </motion.div>

        <motion.div
          className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
          variants={itemVariants}
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TradeSense_Ai. All rights reserved.
          </p>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <SocialLink href="#" label="Twitter">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-twitter"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </SocialLink>
            <SocialLink href="#" label="LinkedIn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </SocialLink>
            <SocialLink href="#" label="GitHub">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </SocialLink>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}

function FooterColumn({
  title,
  links,
  variants,
}: {
  title: string
  links: { label: string; href: string }[]
  variants: any
}) {
  return (
    <motion.div variants={variants}>
      <h3 className="font-medium mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <motion.li key={link.label} variants={variants} custom={index}>
            <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
        <span className="sr-only">{label}</span>
        {children}
      </Link>
    </motion.div>
  )
}

