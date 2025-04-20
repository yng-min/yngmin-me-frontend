'use client'

import { useEffect, useState } from 'react'

import AnimatedLayoutWrapper from '@/components/AnimatedLayoutWrapper'

import FloatingButtonGroup from '@/components/buttons/FloatingButtonGroup'
import ToggleThemeButton from '@/components/buttons/ToggleThemeButton'
import ToggleCursorButton from '@/components/buttons/ToggleCursorButton'
import InstagramLinkButton from '@/components/buttons/InstagramLinkButton'

import DjmaxDataFetcher from '@/components/djmax/DjmaxDataFetcher'
import DjmaxUserTable from '@/components/djmax/DjmaxUserTable'

const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(false)
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode')
        if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true')
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

    return [darkMode, setDarkMode]
}

const DjmaxPerformancePage = () => {
    const [djmaxPerformance, setDjmaxPerformance] = useState(null)
    const [darkMode, setDarkMode] = useDarkMode()

    return (
        <>
            <FloatingButtonGroup>
                <ToggleThemeButton darkMode={darkMode} setDarkMode={setDarkMode} />
                <ToggleCursorButton />
                <InstagramLinkButton />
            </FloatingButtonGroup>
            <AnimatedLayoutWrapper className="djmax-performance">
                <DjmaxDataFetcher setDjmaxPerformance={setDjmaxPerformance} />
                <DjmaxUserTable performanceData={djmaxPerformance} />
            </AnimatedLayoutWrapper>
        </>
    )
}

export default DjmaxPerformancePage
