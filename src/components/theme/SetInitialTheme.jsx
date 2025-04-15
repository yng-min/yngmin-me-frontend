'use client'

import { useEffect, useState } from 'react'

export default function SetInitialTheme({ children }) {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const darkMode = localStorage.getItem('darkMode')
        const root = document.documentElement

        const applyTheme = (theme) => {
            root.setAttribute('data-theme', theme)
            const themeVariables = {
                dark: {
                    '--bg-color': '#1b1b24',
                    '--text-color': '#cccccd',
                },
                light: {
                    '--bg-color': '#cccccd',
                    '--text-color': '#1b1b24',
                },
            }
            Object.entries(themeVariables[theme]).forEach(([key, value]) => {
                root.style.setProperty(key, value)
            })
        }

        applyTheme(darkMode === 'true' ? 'dark' : 'light')
        setIsReady(true)
    }, [])

    if (!isReady) return null

    return <div className="ready">{children}</div>
}
