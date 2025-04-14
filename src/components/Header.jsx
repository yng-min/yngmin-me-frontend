'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
    const pathname = usePathname()
    const [scrollY, setScrollY] = useState(0)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)

        const handleScroll = () => {
            setScrollY(window.scrollY)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!isClient) {
        return null
    }

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    const brightnessValue = 1 - (scrollY / maxScroll) * 0.15

    return (
        <motion.div
            key={`header-${pathname}`}
            className="notion-nav-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            layout="position"
        >
            <div
                className="blur-background"
                aria-hidden="true"
                style={{ backdropFilter: `blur(10px) brightness(${brightnessValue})` }}
            />

            <div className="header-content">
                <h1 className="dotted-title">• • • • •</h1>
                <div className="custom-title">
                    <a href="/" className="logo">
                        <img src="/ryu_symbol.png" alt="yngmin logo" className="logo"/>
                    </a>
                </div>
            </div>
        </motion.div>
    )
}
