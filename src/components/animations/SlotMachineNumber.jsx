import { useEffect, useState } from 'react'

const SlotMachineNumber = ({ targetValue }) => {
    const [currentValue, setCurrentValue] = useState('000') // 초기값을 적당히 설정 (3자리 숫자 예시)

    const formatNumber = (number) => {
        return new Intl.NumberFormat().format(number)
    }

    useEffect(() => {
        const targetDigits = targetValue.toString().split('').map(Number) // 목표 숫자 자릿수 배열
        const maxLength = targetDigits.length
        let currentDigits = Array(maxLength).fill(0) // 현재 숫자 (초기값은 모두 0)

        const randomizeDigits = () => {
            return Math.floor(Math.random() * 10)
        }

        let currentIndex = 0 // 첫 번째 자리부터 시작
        const interval = setInterval(() => {
            // 각 자리가 목표 숫자에 도달하면 그 자리부터 멈추고 목표값으로 변경
            currentDigits = currentDigits.map((digit, index) => {
                if (index < currentIndex) {
                    // 이미 목표 값에 도달한 자리
                    return targetDigits[index]
                } else if (index === currentIndex) {
                    // 현재 자리 숫자가 목표 숫자에 도달할 때까지 랜덤으로 변화
                    if (digit === targetDigits[index]) {
                        return targetDigits[index] // 목표 숫자에 도달했으면 고정
                    } else {
                        return (digit + 1) % 10 // 0부터 목표 숫자까지 올라감 (0부터 시작)
                    }
                } else {
                    // 아직 목표 숫자에 도달하지 않은 자리들은 계속 랜덤으로 변함
                    return randomizeDigits()
                }
            })

            // formatNumber를 적용하여 포맷된 숫자 업데이트
            setCurrentValue(formatNumber(currentDigits.join('')))

            // 현재 자리가 목표 숫자에 도달하면 그 다음 자리로 넘어감
            if (currentDigits[currentIndex] === targetDigits[currentIndex]) {
                currentIndex++ // 다음 자리를 목표로 넘어감
            }

            // 모든 자리가 목표 값에 도달하면 애니메이션 종료
            if (currentIndex >= maxLength) {
                clearInterval(interval)
                setCurrentValue(formatNumber(targetValue)) // 최종 목표 값 표시
            }
        }, 30) // 각 자리가 변화하는 간격 설정 (30ms)

        return () => clearInterval(interval) // 컴포넌트 언마운트 시 interval 정리
    }, [targetValue])

    return <span className="stat-number">{currentValue}</span>
}

export default SlotMachineNumber
