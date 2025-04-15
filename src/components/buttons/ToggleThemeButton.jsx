import { useEffect, useRef, useState } from 'react'
import { FaSun, FaMoon } from 'react-icons/fa'

export default function ToggleThemeButton({ darkMode, setDarkMode }) {
    const buttonRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)
    const animationFrameId = useRef(null)
    const scrollTimeoutRef = useRef(null)

    // 진입 애니메이션
    useEffect(() => {
        setTimeout(() => setIsVisible(true), 200)
    }, [])

    // 스크롤 애니메이션
    useEffect(() => {
        const button = buttonRef.current
        if (!button) return

        let lastScrollY = window.scrollY
        let displayedOffset = 0
        const minScrollDelta = 1
        let restoring = false

        const animate = () => {
            const targetY = window.scrollY
            const delta = targetY - lastScrollY

            if (Math.abs(delta) >= minScrollDelta) {
                // 사용자가 스크롤 중일 때
                restoring = false
                displayedOffset += (-delta - displayedOffset) * 1.5
                displayedOffset = Math.max(-500, Math.min(500, displayedOffset))
                lastScrollY = targetY
            } else {
                // 스크롤 멈췄을 때 복원 애니메이션
                if (!restoring) restoring = true
                displayedOffset *= 0.8
                if (Math.abs(displayedOffset) < 0.5) {
                    displayedOffset = 0
                }
            }

            button.style.setProperty('--scroll-offset', `${displayedOffset}px`)

            // offset이 0이 될 때까지 계속 호출
            if (displayedOffset !== 0 || Math.abs(delta) >= minScrollDelta) {
                animationFrameId.current = requestAnimationFrame(animate)
            } else {
                animationFrameId.current = null
            }
        }

        const handleScroll = () => {
            if (animationFrameId.current === null) {
                animate()
            }

            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }

            scrollTimeoutRef.current = setTimeout(() => {
                if (animationFrameId.current === null) {
                    animate()
                }
            }, 100)
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }
            cancelAnimationFrame(animationFrameId.current)
            animationFrameId.current = null
        }
    }, [])

    const toggleTheme = () => {
        const html = document.documentElement

        const overlay = document.createElement('div')
        overlay.className = 'theme-fade-overlay'
        document.body.appendChild(overlay)

        setDarkMode(prev => !prev)

        html.classList.remove('light', 'dark')
        html.classList.add(darkMode ? 'light' : 'dark')

        requestAnimationFrame(() => {
            overlay.classList.add('fade-out')
            setTimeout(() => {
                document.body.removeChild(overlay)
            }, 300)
        })
    }

    return (
        <button
            ref={buttonRef}
            className={`theme-toggle-button ${isVisible ? 'visible' : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
        >
            {
                darkMode ? (
                    <FaSun
                        className="icon-sun"
                        style={{ width: '24px', height: '24px' }}
                    />
                ) : <FaMoon className="icon-moon"/>
            }
        </button>
    )
}