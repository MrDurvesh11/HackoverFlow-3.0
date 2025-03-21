"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  avatarUrl: string
}

export function TestimonialCard({ quote, author, role, avatarUrl }: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="bg-background/80 backdrop-blur-sm border-border/40 h-full">
        <CardContent className="p-6">
          <motion.div
            className="mb-4"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <svg
              width="45"
              height="36"
              viewBox="0 0 45 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-500/20"
            >
              <path
                d="M13.4 36C9.4 36 6.2 34.6 3.8 31.8C1.4 28.8 0.2 25.2 0.2 21C0.2 17.6 1 14.4 2.6 11.4C4.2 8.4 6.4 5.8 9.2 3.6C12 1.2 15.2 0 18.8 0L20.2 5.4C17.4 6.2 14.8 7.6 12.4 9.6C10 11.6 8.6 13.8 8.2 16.2C8.6 16 9.2 15.8 10 15.6C10.8 15.4 11.6 15.2 12.4 15.2C15.2 15.2 17.6 16.2 19.6 18.2C21.6 20 22.6 22.6 22.6 25.8C22.6 28.8 21.6 31.4 19.6 33.4C17.6 35.2 15.8 36 13.4 36ZM35.4 36C31.4 36 28.2 34.6 25.8 31.8C23.4 28.8 22.2 25.2 22.2 21C22.2 17.6 23 14.4 24.6 11.4C26.2 8.4 28.4 5.8 31.2 3.6C34 1.2 37.2 0 40.8 0L42.2 5.4C39.4 6.2 36.8 7.6 34.4 9.6C32 11.6 30.6 13.8 30.2 16.2C30.6 16 31.2 15.8 32 15.6C32.8 15.4 33.6 15.2 34.4 15.2C37.2 15.2 39.6 16.2 41.6 18.2C43.6 20 44.6 22.6 44.6 25.8C44.6 28.8 43.6 31.4 41.6 33.4C39.6 35.2 37.8 36 35.4 36Z"
                fill="currentColor"
              />
            </svg>
          </motion.div>

          <motion.p
            className="mb-6 text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            {quote}
          </motion.p>

          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300, damping: 10 }}>
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={avatarUrl} alt={author} />
                <AvatarFallback>{author.charAt(0)}</AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <div className="font-medium">{author}</div>
              <div className="text-sm text-muted-foreground">{role}</div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

