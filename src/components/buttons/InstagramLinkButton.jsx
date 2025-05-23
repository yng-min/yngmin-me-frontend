import { useEffect, useRef, useState } from 'react'

import { FaInstagram } from 'react-icons/fa'

export default function InstagramLinkButton() {
    const buttonRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)
    const animationFrameId = useRef(null)
    const scrollTimeoutRef = useRef(null)
    const [instagramId, setInstagramId] = useState('')

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

    // config.json에서 인스타 ID 불러오기
    useEffect(() => {
        async function fetchConfig() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/config.json`)
                const data = await response.json()
                setInstagramId(data.instagramId)
            } catch (err) {
                console.error('config.json 로드 실패:', err)
            }
        }

        fetchConfig()
    }, [])

    return (
        <a
            ref={buttonRef}
            href={`https://www.instagram.com/${instagramId}`}
            className={`instagram-button ${isVisible ? 'visible' : ''}`}
            aria-label="Visit Instagram Profile"
            target="_blank"
            rel="noopener noreferrer"
        >
            <FaInstagram
                className="instagram-icon"
                style={{ width: '24px', height: '24px' }}
            />
        </a>
    )
}
