import React, { useEffect, useRef, useState } from "react"
import styles from "./ScrollingText.module.css"

const ScrollingText = ({ text }) => {
    const wrapperRef = useRef(null)
    const textRef = useRef(null)

    const [position, setPosition] = useState(0)
    const [scrollWidth, setScrollWidth] = useState(0)

    const speed = 0.5
    const delay = 1000
    const gap = 80

    // 텍스트 너비 측정 로직 (폰트 로드 + ResizeObserver 대응)
    useEffect(() => {
        const span = textRef.current
        if (!span) return

        const measureWidth = () => {
            const totalWidth = span.offsetWidth + gap
            setScrollWidth(totalWidth)
        }

        // 폰트가 로드된 후 측정
        document.fonts.ready.then(measureWidth)

        // ResizeObserver로 텍스트 리사이즈 감지
        const observer = new ResizeObserver(measureWidth)
        observer.observe(span)

        return () => observer.disconnect()
    }, [text])

    // 스크롤 루프 (scrollWidth 설정된 후만 실행)
    useEffect(() => {
        if (!scrollWidth) return

        let animationId
        let timeoutId

        const loop = () => {
            let pos = 0

            const step = () => {
                pos += speed
                if (pos >= scrollWidth / 2) {
                // if (pos >= textRef.current.offsetWidth + gap) {
                    setPosition(0)
                    timeoutId = setTimeout(() => {
                        animationId = requestAnimationFrame(loop)
                    }, delay)
                } else {
                    setPosition(-pos)
                    animationId = requestAnimationFrame(step)
                }
            }

            timeoutId = setTimeout(() => {
                animationId = requestAnimationFrame(step)
            }, delay)
        }

        loop()

        return () => {
            cancelAnimationFrame(animationId)
            clearTimeout(timeoutId)
        }
    }, [scrollWidth])

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
