'use client'

import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
    const smallRef = useRef(null)
    const largeRef = useRef(null)

    const [isHovering, setIsHovering] = useState(false)
    const [isSmallClick, setIsSmallClick] = useState(false)
    const [isLargeClick, setIsLargeClick] = useState(false)
    const [isHolding, setIsHolding] = useState(false)

    const lastMousePosition = useRef({ x: 0, y: 0 })
    const largeOffset = useRef({ x: 0, y: 0 })
    const largeTimeoutRef = useRef(null)

    const holdTimeoutRef = useRef(null)
    const clickStartTime = useRef(0)
    const mouseDownActive = useRef(false)

    useEffect(() => {
        const moveCursor = (e) => {
            const { clientX, clientY } = e
            lastMousePosition.current = { x: clientX, y: clientY }

            if (smallRef.current) {
                smallRef.current.style.left = `${clientX}px`
                smallRef.current.style.top = `${clientY}px`
            }

            const moveLargeCursor = () => {
                const { x, y } = lastMousePosition.current
                const smoothFactor = 0.175

                largeOffset.current.x += (x - largeOffset.current.x) * smoothFactor
                largeOffset.current.y += (y - largeOffset.current.y) * smoothFactor

                if (largeRef.current) {
                    largeRef.current.style.left = `${largeOffset.current.x}px`
                    largeRef.current.style.top = `${largeOffset.current.y}px`
                }

                if (largeTimeoutRef.current) {
                    clearTimeout(largeTimeoutRef.current)
                }

                largeTimeoutRef.current = setTimeout(() => {
                    requestAnimationFrame(moveLargeCursor)
                }, 10)
            }

            moveLargeCursor()
        }

        const handleMouseOver = (e) => {
            const target = e.target
            if (
                target.closest('a') ||
                target.closest('button') ||
                target.closest('[role="button"]') ||
                target.closest('input') ||
                target.closest('textarea') ||
                target.closest('select')
            ) {
                setIsHovering(true)
            }
        }

        const handleMouseOut = () => {
            setIsHovering(false)
        }

        const handleMouseDown = () => {
            mouseDownActive.current = true
            clickStartTime.current = Date.now()

            holdTimeoutRef.current = setTimeout(() => {
                if (mouseDownActive.current) {
                    setIsHolding(true)
                    setIsSmallClick(true)
                }
            }, 250)
        }

        const handleMouseUp = () => {
            mouseDownActive.current = false
            clearTimeout(holdTimeoutRef.current)

            const clickDuration = Date.now() - clickStartTime.current

            if (clickDuration < 250) {
                setIsLargeClick(true)
                setTimeout(() => setIsLargeClick(false), 200)
            }

            setIsHolding(false)
            setIsSmallClick(false)  // 홀드 아니어도 무조건 해제
        }

        document.addEventListener('mousemove', moveCursor)
        document.addEventListener('mouseover', handleMouseOver)
        document.addEventListener('mouseout', handleMouseOut)
        document.addEventListener('mousedown', handleMouseDown)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', moveCursor)
            document.removeEventListener('mouseover', handleMouseOver)
            document.removeEventListener('mouseout', handleMouseOut)
            document.removeEventListener('mousedown', handleMouseDown)
            document.removeEventListener('mouseup', handleMouseUp)
            if (largeTimeoutRef.current) clearTimeout(largeTimeoutRef.current)
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current)
        }
    }, [])

    return (
        <>
            <div
                ref={largeRef}
                className={`custom-cursor large ${isLargeClick && !isHolding ? 'click' : ''} ${isHolding ? 'hold' : ''} ${isHovering ? 'fade-out' : 'fade-in'}`}
                style={{
                    width: isLargeClick ? '18px' : '26px',
                    height: isLargeClick ? '18px' : '26px',
                }}
            />
            <div
                ref={smallRef}
                className={`custom-cursor small ${isSmallClick ? 'click' : ''} ${isHovering && !isHolding ? 'enlarge' : ''} ${isHolding ? 'hold' : ''}`}
            />
        </>
    )
}
