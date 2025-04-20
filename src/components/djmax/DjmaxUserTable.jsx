'use client'

import { useEffect, useState, useRef } from 'react'
import '@/styles/djmax/DjmaxUserTable.css'

import useRemoveLoadingOverlay from '@/hooks/useRemoveLoadingOverlay'

import TimeoutPageWrapper from '@/components/TimeoutPageWrapper'
import StatBar from '@/components/tools/StatBar'

const usePageTimeout = (timeoutDuration = 10000, loadingComplete) => {
    const [timedOut, setTimedOut] = useState(false)
    const timeoutRef = useRef(null)

    useEffect(() => {
        // 데이터가 로딩되면 타임아웃을 취소
        if (!loadingComplete) {
            timeoutRef.current = setTimeout(() => setTimedOut(true), timeoutDuration)
        } else {
            clearTimeout(timeoutRef.current)
        }

        return () => clearTimeout(timeoutRef.current)
    }, [timeoutDuration, loadingComplete])

    return timedOut
}

const DjmaxUserTable = () => {
    const [performanceData, setPerformanceData] = useState(null)
    const [button, setButton] = useState('4')   // 기본값 설정
    const [board, setBoard] = useState('SC')    // 기본값 설정
    const [songImages, setSongImages] = useState({})  // 이미지 URL 저장할 상태
    const [loadingComplete, setLoadingComplete] = useState(false)  // 로딩 완료 여부 추적
    const timedOut = usePageTimeout(10000, loadingComplete) // 타임아웃 체크
    const removeLoadingOverlay = useRemoveLoadingOverlay()

    useEffect(() => {
        // 클라이언트 사이드에서만 window 객체 접근
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            setButton(urlParams.get('button') || '4')  // button 파라미터 없으면 '4'로 설정
            setBoard(urlParams.get('board') || 'SC')   // board 파라미터 없으면 'SC'로 설정
        }
    }, [])  // 페이지가 렌더링될 때 한번만 실행

    const LOCAL_STORAGE_KEY = `djmaxPerformance_${button}_${board}`
    const IMAGE_VERSION = '20250419'  // 이미지 전체 버전. 변경되면 캐시 우회

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 이미지 데이터 요청
                const response = await fetch('/api/djmax/djmaxSongImage')
                const songImageData = await response.json()

                if (songImageData && Array.isArray(songImageData)) {
                    const imageUrls = {}
                    songImageData.forEach(song => {
                        imageUrls[song.title] = `${song.imageUrl}?v=${IMAGE_VERSION}`
                    })
                    setSongImages(imageUrls)
                }

                const storedData = localStorage.getItem(LOCAL_STORAGE_KEY)

                if (storedData) {
                    try {
                        const parsed = JSON.parse(storedData)
                        const timeElapsed = new Date() - new Date(parsed.lastUpdated)
                        if (timeElapsed < 600000 && parsed?.data?.floors) {
                            setPerformanceData(parsed.data)
                        }
                    } catch (error) {
                        console.error('캐싱된 데이터 파싱 오류:', error)
                    }
                }
            } catch (error) {
                console.error('데이터 요청 오류:', error)
            }
        }
        fetchData()
    }, [LOCAL_STORAGE_KEY])  // removeLoadingOverlay는 여기서 사용하지 않음, 타이밍에 맞춰 처리됨

    // 타임아웃 처리: 데이터가 로딩되었으면 타임아웃 방지
    useEffect(() => {
        if (performanceData && performanceData.floors?.length > 0) {
            setLoadingComplete(true)
        }
    }, [performanceData])  // performanceData 변경 시 실행

    if (timedOut) {
        return (
            <div className="timeout-wrapper">
                <TimeoutPageWrapper />
            </div>
        )
    }

    // performanceData가 null이 아니고, floors가 존재하는지 확인
    if (!performanceData || !performanceData.floors) {
        return null  // 데이터 로딩 중에는 아무것도 렌더링하지 않음
    }

    const sortedFloors = [...performanceData.floors].sort((a, b) => b.floorNumber - a.floorNumber)
    const totalStats = {
        perfect: 0,
        maxCombo: 0,
        clear: 0,
        total: 0,
        over97: 0,
        over99: 0,
        over995: 0,
        over999: 0,
    }
    const numericScores = []

    sortedFloors.forEach(floor => {
        floor.patterns.forEach(pattern => {
            totalStats.total++

            if (pattern.score === '100.00' || pattern.score === '100.00%') {
                totalStats.perfect++
            }
            if (pattern.maxCombo === 1) {
                totalStats.maxCombo++
            }
            if (pattern.score !== '–' && pattern.score !== null && pattern.score !== undefined) {
                totalStats.clear++

                // score가 null 또는 undefined가 아니면 숫자로 변환
                const numericScore = parseFloat(pattern.score.replace('%', ''))
                if (!isNaN(numericScore)) {
                    numericScores.push(numericScore)

                    if (numericScore >= 97) totalStats.over97++
                    if (numericScore >= 99) totalStats.over99++
                    if (numericScore >= 99.5) totalStats.over995++
                    if (numericScore >= 99.9) totalStats.over999++
                }
            }
        })
    })

    const averageScore = numericScores.reduce((sum, s) => sum + s, 0) / numericScores.length

    return (
        <div className="djmax-user-table__wrapper">
            <div className="djmax-user-table_header">
                <h2>
                    DJMAX Achievement
                    <span className="powered-by">
                        Powered by&nbsp;
                        <a
                            className="v-archive"
                            href="https://v-archive.net"
                            target="_blank"
                            rel="noopener noreferrer external"
                        >
                            V-Archive
                        </a>
                    </span>
                </h2>
            </div>
            <div className="djmax-user-table_stats">
                <div className="stat-header">
                    <h3>{button}B {board}</h3>
                    <span className="score-summary">
                        AVG. {averageScore.toFixed(2)}%
                    </span>
                </div>
                <div className="djmax-user-table_overall">
                    <StatBar label="Perfect" value={totalStats.perfect} total={totalStats.total} color="rgba(238, 50, 51, 0.95)" />
                    <StatBar label="Max Combo" value={totalStats.maxCombo} total={totalStats.total} color="rgba(73, 237, 173, 0.75)" />
                    <StatBar label="Clear" value={totalStats.clear} total={totalStats.total} color="rgba(148, 232, 255, 0.75)" />
                    <div className="djmax-user-table_over-thresholds">
                        <StatBar label="Over 99.9%" value={totalStats.over999} total={totalStats.total} color="rgba(255, 60, 60, 0.6)" />
                        <StatBar label="Over 99%" value={totalStats.over99} total={totalStats.total} color="rgba(255, 155, 0, 0.6)" />
                        <StatBar label="Over 99.5%" value={totalStats.over995} total={totalStats.total} color="rgba(255, 105, 0, 0.6)" />
                        <StatBar label="Over 97%" value={totalStats.over97} total={totalStats.total} color="rgba(255, 196, 0, 0.6)" />
                    </div>
                </div>
            </div>

            <div className="djmax-user-table__container">
                {sortedFloors.map(floor => (
                    <div className="djmax-user-table__group" key={floor.floorNumber}>
                        <div className="djmax-user-table__difficulty">
                            SC{floor.floorNumber}
                        </div>
                        <div className="djmax-user-table__row">
                            {floor.patterns.map((pattern, index) => {
                                let scoreColor = ''
                                scoreColor = 'rgba(153, 153, 153, 0.5)' // 플레이하지 않음

                                if (pattern.score && pattern.score !== '–') {
                                    if (!pattern.score.includes('%')) {
                                        pattern.score += '%'
                                    }

                                    scoreColor = 'rgba(148, 232, 255, 0.5)' // 클리어
                                    if (pattern.score === '100.00%') {
                                        scoreColor = 'rgba(238, 50, 51, 0.95)' // 퍼펙트
                                    } else if (pattern.maxCombo === 1) {
                                        scoreColor = 'rgba(73, 237, 173, 0.75)' // 맥스콤보
                                    }
                                } else if (pattern.score === null) {
                                    pattern.score = '–'
                                }
                                if (pattern.score === '–%') {
                                    pattern.score = '–'
                                }

                                return (
                                    <div
                                        className="djmax-user-table__item"
                                        key={`${floor.floorNumber}-${index}`}
                                        role="button"
                                    >
                                        <div
                                            className="djmax-user-table__score"
                                            style={{ backgroundColor: scoreColor }}
                                        >
                                            {pattern.score}
                                        </div>
                                        <div className="djmax-user-table__image">
                                            <img
                                                src={songImages[pattern.title] || '/default-image.png'}
                                                alt={pattern.name}
                                            />
                                        </div>
                                        <div className="djmax-user-table__title">{pattern.name}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DjmaxUserTable
