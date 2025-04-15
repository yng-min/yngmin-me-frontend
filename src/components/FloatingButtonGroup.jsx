import React, { useState, useEffect, useRef } from 'react'
import { useDevice } from '@/context/DeviceContext'

import InstagramLinkButton from '@/components/InstagramLinkButton'
import ToggleCursorButton from '@/components/ToggleCursorButton'
import ToggleThemeButton from '@/components/ToggleThemeButton'
import GroupButton from '@/components/GroupButton'

export default function FloatingButtonGroup() {
    const [hydrated, setHydrated] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const { isMobile } = useDevice()
    const [isHovered, setIsHovered] = useState(false)

    const hoverAreaRef = useRef(null)
    const BUTTON_HEIGHT = 48 // 각 버튼 높이
    const BUTTON_GAP = 16

    const visibleButtonCount = isMobile ? 2 : 3 // Instagram + 테마 + 커서 (모바일이면 커서 없음)
    const hoverHeight = isHovered
        ? 48 + visibleButtonCount * (BUTTON_HEIGHT + BUTTON_GAP) // GroupButton 포함
        : 48

    useEffect(() => {
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

    // 마우스가 hover area를 벗어나면 상태 false로
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!hoverAreaRef.current) return
            const bounds = hoverAreaRef.current.getBoundingClientRect()
            if (
                e.clientX < bounds.left ||
                e.clientX > bounds.right ||
                e.clientY < bounds.top ||
                e.clientY > bounds.bottom
            ) {
                setIsHovered(false)
            }
        }

        if (isHovered) {
            document.addEventListener('mousemove', handleMouseMove)
        } else {
            document.removeEventListener('mousemove', handleMouseMove)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [isHovered])

    return (
        <div
            ref={hoverAreaRef}
            onMouseEnter={() => setIsHovered(true)}
            onClick={() => setIsHovered(true)}
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 999,
                width: '48px',
                height: `${hoverHeight}px`,
                transition: 'height 0.3s ease',
                pointerEvents: 'auto',
            }}
        >
            {/* GroupButton: 기본 상태 */}
            <div
                style={{
                    opacity: isHovered ? 0 : 1,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: isHovered ? 'none' : 'auto',
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                }}
            >
                <GroupButton/>
            </div>

            {/* 서브 버튼들 */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: isHovered ? '0' : '8000px',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    alignItems: 'flex-end',
                    gap: '16px',
                    opacity: isHovered ? 1 : 0,
                    pointerEvents: isHovered ? 'auto' : 'none',
                    transition: `opacity 0.3s ease, right 0s ease ${isHovered ? '0s' : '0.3s'}`,
                }}
            >
                <ToggleThemeButton darkMode={darkMode} setDarkMode={setDarkMode}/>
                {!isMobile && <ToggleCursorButton/>}
                <InstagramLinkButton/>
            </div>
        </div>
    )
}
