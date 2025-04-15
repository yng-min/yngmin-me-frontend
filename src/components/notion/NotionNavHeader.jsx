'use client'

import { motion } from 'framer-motion'
import ToggleThemeButton from '../buttons/ToggleThemeButton'
import InstagramLinkButton from '../buttons/InstagramLinkButton'

export default function NotionNavHeader({ darkMode }) {
    return (
        <motion.div
            className="notion-nav-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeInOut' }}
        >
            <h1>• • • • •</h1>
            <div className="blur-overlay"></div>
            <ToggleThemeButton darkMode={darkMode} setDarkMode={() => { }}/>
            <InstagramLinkButton darkMode={darkMode} setDarkMode={() => { }}/>
            <div className="custom-title">
                <a href="/" className="logo">
                    <img src="/ryu.png" alt="yngmin logo" className="logo"/>
                </a>
            </div>
        </motion.div>
    )
}
