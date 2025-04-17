import React, { useLayoutEffect, useRef, useState } from "react"

import styles from "./ScrollingText.module.css"

const ScrollingText = ({ text }) => {
    const wrapperRef = useRef(null)
    const textRef = useRef(null)

    const [position, setPosition] = useState(0)

    const speed = 0.35 // px per frame
    const delay = 1750 // ms
    const gap = 2.5 // rem

    const measureWidth = () => {
        const span = textRef.current
        const gap_px = gap * 16
        if (!span) return 0
        const width = span.offsetWidth + gap_px
        return width
    }

    useLayoutEffect(() => {
        const scrollWidth = measureWidth()
        if (scrollWidth === 0) return

        let animationId
        let timeoutId
        let pos = 0

        const step = () => {
            pos += speed
            if (pos >= scrollWidth / 2) {
                pos = 0
                setPosition(0)
                timeoutId = setTimeout(() => {
                    animationId = requestAnimationFrame(step)
                }, delay)
            } else {
                setPosition(-pos)
                animationId = requestAnimationFrame(step)
            }
        }

        timeoutId = setTimeout(() => {
            animationId = requestAnimationFrame(step)
        }, delay)

        return () => {
            cancelAnimationFrame(animationId)
            clearTimeout(timeoutId)
        }
    }, [text])

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <div
                className={styles.text}
                ref={textRef}
                style={{ transform: `translateX(${position}px)` }}
            >
                <span>{text}</span>
                <span className={styles.gap} />
                <span>{text}</span>
            </div>
        </div>
    )
}

export default ScrollingText
