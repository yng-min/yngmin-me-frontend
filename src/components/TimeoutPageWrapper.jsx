'use client'

import { useEffect, useState } from 'react'

import Twemoji from 'react-twemoji'

import FloatingButtonGroup from '@/components/buttons/FloatingButtonGroup'
import ToggleThemeButton from '@/components/buttons/ToggleThemeButton'
import ToggleCursorButton from '@/components/buttons/ToggleCursorButton'
import InstagramLinkButton from '@/components/buttons/InstagramLinkButton'

export default function LoadingOverlayWrapper() {
    const [hydrated, setHydrated] = useState(false)
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        // 동기화 목적
        const savedDarkMode = localStorage.getItem('darkMode')
        if (savedDarkMode !== null) {
            const parsed = savedDarkMode === 'true'
            if (parsed !== darkMode) setDarkMode(parsed)
        }
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (hydrated) {
            const root = document.documentElement
            root.style.setProperty('--bg-color', darkMode ? '#1b1b24' : '#cccccd')
            root.style.setProperty('--text-color', darkMode ? '#cccccd' : '#1b1b24')
            root.setAttribute('data-theme', darkMode ? 'dark' : 'light')
            localStorage.setItem('darkMode', darkMode.toString())
        }
    }, [darkMode, hydrated])

    return (
        <div className="timeout-wrapper">
            <FloatingButtonGroup>
                <ToggleThemeButton darkMode={darkMode} setDarkMode={setDarkMode}/>
                <ToggleCursorButton/>
                <InstagramLinkButton/>
            </FloatingButtonGroup>
            <Twemoji options={{ folder: 'svg', ext: '.svg' }} className="twemoji-wrapper">
                <div>The page failed to load. 😵‍💫</div>
                <div>Please try again later.</div>
            </Twemoji>
        </div>
    )
}
