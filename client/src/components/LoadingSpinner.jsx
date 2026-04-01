import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg z-[1000]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-24 h-24">
          <motion.div 
            animate={{ 
              rotate: 360,
              borderRadius: ["20%", "50%", "20%"]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-r-2 border-accent" 
          />
          <motion.div 
            animate={{ 
              rotate: -360,
              borderRadius: ["50%", "20%", "50%"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border-b-2 border-l-2 border-primary" 
          />
        </div>
        <p className="text-xs font-bold text-primary uppercase tracking-[0.4em] animate-pulse">Healing the World</p>
      </div>
    </div>
  )
}
