'use client'

import { useEffect, useState, useRef } from 'react'
import '@/styles/djmax/DjmaxUserTable.css'

import TimeoutPageWrapper from '@/components/TimeoutPageWrapper'
import StatBar from '@/components/tools/StatBar'

import { useLoading } from '@/context/LoadingContext'

const usePageTimeout = (timeoutDuration = 10000, loadingComplete) => {
    const [timedOut, setTimedOut] = useState(false)
    const timeoutRef = useRef(null)

    useEffect(() => {
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
    const [button, setButton] = useState('4')
    const [board, setBoard] = useState('SC')
    const [songImages, setSongImages] = useState({})

    const { loadingComplete, setLoadingComplete } = useLoading()
    const timedOut = usePageTimeout(10000, loadingComplete)

    useEffect(() => {
        if (performanceData?.floors?.length > 0) {
            setLoadingComplete(true)
        }
    }, [performanceData])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            setButton(urlParams.get('button') || '4')
            setBoard(urlParams.get('board') || 'SC')
        }
    }, [])

    const LOCAL_STORAGE_KEY = `djmaxPerformance_${button}_${board}`
    const IMAGE_VERSION = '20250419'

    useEffect(() => {
        let retryCount = 0
        const maxRetries = 3
        const retryDelay = 500 // 0.5초

        const fetchData = async () => {
            try {
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
                            return
                        }
                    } catch (error) {
                        console.error('캐싱된 데이터 파싱 오류:', error)
                    }
                }

                // 여기서 서버로 새 데이터 요청
                const dataResponse = await fetch(`/api/djmax/performance?button=${button}&board=${board}`)
                const newData = await dataResponse.json()

                if (newData?.floors) {
                    setPerformanceData(newData)
                    localStorage.setItem(
                        LOCAL_STORAGE_KEY,
                        JSON.stringify({ data: newData, lastUpdated: new Date().toISOString() })
                    )
                } else {
                    throw new Error('데이터에 floors가 없음')
                }
            } catch (error) {
                console.error(`데이터 요청 오류 (${retryCount + 1}/${maxRetries}):`, error)
                if (retryCount < maxRetries) {
                    retryCount++
                    setTimeout(fetchData, retryDelay)
                }
            }
        }

        fetchData()
    }, [LOCAL_STORAGE_KEY])

    useEffect(() => {
        const isValid = performanceData?.floors?.length > 0
        if (isValid) {
            setLoadingComplete(true)
        }
    }, [performanceData])

    if (timedOut) {
        return (
            <div className="timeout-wrapper">
                <TimeoutPageWrapper />
            </div>
        )
    }

    if (!performanceData || !performanceData.floors) {
        return null
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

    const calculateAverageScore = (patterns) => {
        const numericScores = patterns
            .map(pattern => {
                if (pattern.score) {
                    return parseFloat(pattern.score.replace('%', ''));
                }
                return NaN; // score가 없으면 NaN으로 처리
            })
            .filter(score => !isNaN(score));

        const average = numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length;
        return isNaN(average) ? 0 : average; // NaN일 경우 0으로 반환
    }

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
                        <StatBar label="Over 99.9%" value={totalStats.over999} total={totalStats.clear} color="rgba(255, 60, 60, 0.6)" />
                        <StatBar label="Over 99%" value={totalStats.over99} total={totalStats.clear} color="rgba(255, 155, 0, 0.6)" />
                        <StatBar label="Over 99.5%" value={totalStats.over995} total={totalStats.clear} color="rgba(255, 105, 0, 0.6)" />
                        <StatBar label="Over 97%" value={totalStats.over97} total={totalStats.clear} color="rgba(255, 196, 0, 0.6)" />
                    </div>
                </div>
            </div>

            <div className="djmax-user-table__container">
                {sortedFloors.map(floor => {
                    const avgScore = calculateAverageScore(floor.patterns)

                    return (
                        <div className="djmax-user-table__group" key={floor.floorNumber}>
                            <div className="djmax-user-table__difficulty">
                                SC{floor.floorNumber}
                                <span className="djmax-user-table__avg-rate">
                                    AVG.<br />
                                    {typeof avgScore === 'number' ? `${avgScore.toFixed(2)}%` : '0.00%'}
                                </span>
                            </div>
                            <div className="djmax-user-table__row">
                                {floor.patterns.map((pattern, index) => {
                                    let scoreColor = 'rgba(153, 153, 153, 0.5)'

                                    if (pattern.score && pattern.score !== '–') {
                                        if (!pattern.score.includes('%')) {
                                            pattern.score += '%'
                                        }

                                        scoreColor = 'rgba(148, 232, 255, 0.5)'
                                        if (pattern.score === '100.00%') {
                                            scoreColor = 'rgba(238, 50, 51, 0.95)'
                                        } else if (pattern.maxCombo === 1) {
                                            scoreColor = 'rgba(73, 237, 173, 0.75)'
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
                                                {pattern.scFloor && !isNaN(Number(pattern.scFloor)) && pattern.scFloor !== "" && (
                                                    <span className="djmax-user-table__sc-floor">
                                                        {pattern.scFloor}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="djmax-user-table__title">{pattern.name}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default DjmaxUserTable
