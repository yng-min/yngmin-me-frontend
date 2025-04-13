'use client'

import { useEffect, useState } from 'react'
import Twemoji from 'react-twemoji'

export default function LoadingOverlayWrapper() {
    const [dotCount, setDotCount] = useState(1)

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount(prev => (prev % 3) + 1)
        }, 250)

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <div id="loading-overlay" className="loading-overlay show"></div>
            <div id="loading-text" className="loading-text show">
                <div className="spinner"></div>
                <Twemoji options={{ folder: 'svg', ext: '.svg' }} className="twemoji-wrapper">
                    <div style={{ fontSize: '1rem' }}>
                        Loading{".".repeat(dotCount)} 😋
                    </div>
                </Twemoji>
            </div>
        </>
    )
}
