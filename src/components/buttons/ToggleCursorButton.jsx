import { useEffect, useRef, useState } from 'react'

import { FaMousePointer, FaBan } from 'react-icons/fa'

import { useCursor } from '@/context/CursorContext'

export default function ToggleCursorButton() {
    const buttonRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)
    const animationFrameId = useRef(null)
    const scrollTimeoutRef = useRef(null)
    const { cursorEnabled, setCursorEnabled } = useCursor()

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

    useEffect(() => {
        const storedCursorEnabled = localStorage.getItem('cursorEnabled')
        if (storedCursorEnabled !== null) {
            setCursorEnabled(JSON.parse(storedCursorEnabled))
        }
    }, [setCursorEnabled])

    const toggleCursor = () => {
        const newCursorState = !cursorEnabled
        setCursorEnabled(newCursorState)

        localStorage.setItem('cursorEnabled', JSON.stringify(newCursorState))
    }

    return (
        <button
            ref={buttonRef}
            className={`cursor-toggle-button ${isVisible ? 'visible' : ''}`}
            onClick={toggleCursor}
            aria-label="Toggle Custom Cursor"
        >
            <div className="icon-wrapper">
                <FaMousePointer className="icon-mouse" />
                <FaBan
                    className={`icon-overlay ${cursorEnabled ? 'fade-in' : 'fade-out'}`}
                    style={{ width: '28px', height: '28px' }}
                />
            </div>
        </button>
    )
}
