'use client'

import { useEffect, useState, useRef } from 'react'
import '@/styles/djmax/DjmaxUserTable.css'

import useRemoveLoadingOverlay from '@/hooks/useRemoveLoadingOverlay'

import TimeoutPageWrapper from '@/components/TimeoutPageWrapper'

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
        // 로컬 스토리지에서 데이터 불러오기 전에 API 호출
        const fetchData = async () => {
            try {
                // 이미지 데이터 요청
                const response = await fetch('/api/djmax/djmaxSongImage')
                const songImageData = await response.json()

                if (songImageData && Array.isArray(songImageData)) {
                    const imageUrls = {}
                    songImageData.forEach(song => {
                        // R2에서 제공되는 이미지 URL을 사용
                        imageUrls[song.title] = `${song.imageUrl}?v=${IMAGE_VERSION}`
                    })
                    setSongImages(imageUrls)  // 이미지 URL을 상태에 저장
                }

                // 로컬 스토리지에서 데이터 확인
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
                    } finally {
                        // 데이터 로딩이 끝났을 때 removeLoadingOverlay 호출
                        setLoadingComplete(true)  // 로딩 완료 상태 업데이트
                    }
                }

            } catch (error) {
                console.error("데이터 요청 오류:", error)
            }
        }
        fetchData()
    }, [LOCAL_STORAGE_KEY])  // removeLoadingOverlay는 여기서 사용하지 않음, 타이밍에 맞춰 처리됨

    // 타임아웃 처리: 데이터가 로딩되었으면 타임아웃 방지
    useEffect(() => {
        if (loadingComplete && removeLoadingOverlay) {
            removeLoadingOverlay()  // 로딩 오버레이 제거
        }
    }, [loadingComplete, removeLoadingOverlay])  // 로딩 완료 상태를 감지하여 오버레이 제거

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

    return (
        <div className="djmax-user-table__wrapper">
            <div className="djmax-user-table_header">
                <h2>
                    DJMAX Achievement (4B SC)
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

            <div className="djmax-user-table__container">
                {sortedFloors.map(floor => (
                    <div className="djmax-user-table__group" key={floor.floorNumber}>
                        <div className="djmax-user-table__difficulty">
                            SC{floor.floorNumber}
                        </div>
                        <div className="djmax-user-table__row">
                            {floor.patterns.map((pattern, index) => {
                                let scoreColor = ''

                                if (pattern.score && pattern.score !== '-') {
                                    if (!pattern.score.includes('%')) {
                                        pattern.score += '%'
                                    }

                                    scoreColor = 'rgba(148, 232, 255, 0.65)' // 기본 클리어

                                    if (pattern.score === '100.00%') {
                                        scoreColor = 'rgba(238, 50, 51, 0.9)' // 퍼펙트
                                    } else if (pattern.maxCombo === 1) {
                                        scoreColor = 'rgba(73, 237, 173, 0.8)' // 맥스콤보
                                    }
                                } else if (pattern.score === null) {
                                    pattern.score = '-'
                                }

                                if (pattern.score === '-%') {
                                    pattern.score = '-'
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
