'use client'

import { motion, AnimatePresence } from 'framer-motion'

export default function AnimatedLayoutWrapper({ children, className = '' }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                className={className}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
