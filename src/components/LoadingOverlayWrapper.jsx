import { useEffect, useState } from 'react'
import Twemoji from 'react-twemoji'

import { useLoading } from '@/context/LoadingContext'

export default function LoadingOverlayWrapper() {
    const { loadingComplete } = useLoading()
    const [dotCount, setDotCount] = useState(1)
    const [isHidden, setIsHidden] = useState(false)
    const [isFadingOut, setIsFadingOut] = useState(false) // 애니메이션 상태 추가

    useEffect(() => {
        if (loadingComplete && !isFadingOut) {
            // 로딩 완료되면 애니메이션을 통해 오버레이 숨기기
            setIsFadingOut(true)
            setTimeout(() => {
                setIsHidden(true) // 애니메이션 후에 오버레이를 완전히 숨김
            }, 700) // 애니메이션 시간 (0.7초)
        }
    }, [loadingComplete, isFadingOut])

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount(prev => (prev % 3) + 1)
        }, 250)
        return () => clearInterval(interval)
    }, [])

    // isHidden이 true일 때 컴포넌트를 null로 반환
    if (isHidden) return null

    return (
        <>
            <div
                id="loading-overlay"
                className={`loading-overlay ${isFadingOut ? 'hide' : ''}`}
            ></div>
            <div
                id="loading-text"
                className={`loading-text ${isFadingOut ? 'hide' : ''}`}
            >
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
