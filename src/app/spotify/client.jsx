'use client'

import { useEffect, useState, useRef } from 'react'

import useRemoveLoadingOverlay from '@/hooks/useRemoveLoadingOverlay'

import TimeoutPageWrapper from '@/components/TimeoutPageWrapper'
import AnimatedLayoutWrapper from '@/components/AnimatedLayoutWrapper'

import FloatingButtonGroup from '@/components/buttons/FloatingButtonGroup'
import ToggleThemeButton from '@/components/buttons/ToggleThemeButton'
import ToggleCursorButton from '@/components/buttons/ToggleCursorButton'
import InstagramLinkButton from '@/components/buttons/InstagramLinkButton'

import DropdownSelector from '@/components/dropdowns/DropdownSelector'

import SpotifyStatsFetcher from '@/components/spotify/SpotifyStats'
import SpotifyRecentFetcher from '@/components/spotify/SpotifyRecent'
import SpotifyRecentCard from '@/components/spotify/SpotifyRecentCard'

import SlotMachineNumber from '@/components/animations/SlotMachineNumber'

const Page = () => {
    const [darkMode, setDarkMode] = useState(false)
    const [hydrated, setHydrated] = useState(false)
    const [timedOut, setTimedOut] = useState(false)
    const [selectedPeriod, setSelectedPeriod] = useState('lifetime')

    const [spotifyStats, setSpotifyStats] = useState(null)
    const [extraStats, setExtraStats] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [spotifyRecent, setSpotifyRecent] = useState([])  // 최근 데이터 상태 추가
    const [currentIndex, setCurrentIndex] = useState(0) // 현재 인덱스를 추적

    const timeoutRef = useRef(null)
    useRemoveLoadingOverlay()

    useEffect(() => {
        timeoutRef.current = setTimeout(() => setTimedOut(true), 10000)
        return () => clearTimeout(timeoutRef.current)
    }, [])

    useEffect(() => {
        if (spotifyStats && timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [spotifyStats])

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode')
        if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true')
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (hydrated) {
            const root = document.documentElement
            root.style.setProperty('--bg-color', darkMode ? '#1b1b24' : '#cccccd')
            root.style.setProperty('--text-color', darkMode ? '#cccccd' : '#1b1b24')
            root.setAttribute('data-theme', darkMode ? 'dark' : 'light')
            localStorage.setItem('darkMode', darkMode.toString())
        }
    }, [darkMode, hydrated])

    // 최근 데이터를 로컬 스토리지에서 가져와 최대 10개 항목만 저장
    useEffect(() => {
        const recentData = JSON.parse(localStorage.getItem('recent')) || []
        setSpotifyRecent(recentData.slice(0, 10))  // 최근 10개만 가져오기
    }, [])

    const timeAgo = (timestamp) => {
        const now = new Date()
        const then = new Date(timestamp)

        const diffInMs = now - then
        const diffInMinutes = Math.floor(diffInMs / 1000 / 60)
        const diffInHours = Math.floor(diffInMinutes / 60)
        const diffInDays = Math.floor(diffInHours / 24)
        const diffInWeeks = Math.floor(diffInDays / 7)

        const yearDiff = now.getFullYear() - then.getFullYear()
        const monthDiff = now.getMonth() - then.getMonth() + yearDiff * 12
        const realYearDiff = Math.floor(monthDiff / 12)

        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes === 1) return '1 minute ago'
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
        if (diffInHours === 1) return '1 hour ago'
        if (diffInHours < 24) return `${diffInHours} hours ago`
        if (diffInDays === 1) return '1 day ago'
        if (diffInDays < 7) return `${diffInDays} days ago`
        if (diffInWeeks === 1) return '1 week ago'
        if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`
        if (monthDiff === 1) return '1 month ago'
        if (monthDiff < 12) return `${monthDiff} months ago`
        if (realYearDiff === 1) return '1 year ago'
        return `${realYearDiff} years ago`
    }

    const nextTrack = () => {
        if (currentIndex < spotifyRecent.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const prevTrack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const renderStatsBox = (label, count, durationMs, extraStats = null) => {
        const durationHours = Math.floor(durationMs / 1000 / 60 / 60)
        const durationMinutes = Math.floor(durationMs / 1000 / 60)

        return (
            <div className="stats-box">
                <div className="stat-item">
                    <SlotMachineNumber targetValue={count} />
                    <div className="stat-label">Streams</div>
                </div>
                <div className="stat-item">
                    <SlotMachineNumber targetValue={durationHours} />
                    <div className="stat-label">Hours Streamed</div>
                </div>
                <div className="stat-item">
                    <SlotMachineNumber targetValue={durationMinutes} />
                    <div className="stat-label">Minutes Streamed</div>
                </div>
                {extraStats && (
                    <>
                        <div className="stat-item">
                            <SlotMachineNumber targetValue={extraStats.differentTracks} />
                            <div className="stat-label">Different Tracks</div>
                        </div>
                        <div className="stat-item">
                            <SlotMachineNumber targetValue={extraStats.differentArtists} />
                            <div className="stat-label">Different Artists</div>
                        </div>
                        <div className="stat-item">
                            <SlotMachineNumber targetValue={extraStats.differentAlbums} />
                            <div className="stat-label">Different Albums</div>
                        </div>
                    </>
                )}
            </div>
        )
    }

    const renderStats = () => {
        if (!spotifyStats) return null

        const { years, total } = spotifyStats.items

        const periodStats = selectedPeriod === 'lifetime'
            ? total
            : years[selectedPeriod]

        if (!periodStats) {
            return <p>No corresponding data was found.</p>
        }

        return renderStatsBox(
            selectedPeriod,
            periodStats.count,
            periodStats.durationMs,
            extraStats?.[selectedPeriod] ?? null
        )
    }

    if (timedOut) {
        return (
            <div className="timeout-wrapper">
                <TimeoutPageWrapper />
            </div>
        )
    }

    return (
        <>
            <FloatingButtonGroup>
                <ToggleThemeButton darkMode={darkMode} setDarkMode={setDarkMode} />
                <ToggleCursorButton />
                <InstagramLinkButton />
            </FloatingButtonGroup>
            <AnimatedLayoutWrapper className="spotify-stats">
                <div className="stats-container">
                    <div className="stats-header">
                        <h2>
                            Spotify Stats
                            <span className="powered-by">
                                Powered by&nbsp;
                                <a
                                    className="statsfm"
                                    href="https://stats.fm"
                                    target="_blank"
                                    rel="noopener noreferrer external"
                                >stats.fm</a>
                            </span>
                        </h2>
                        {spotifyStats && (
                            <DropdownSelector
                                options={['lifetime', ...Object.keys(spotifyStats.items.years).sort((a, b) => Number(b) - Number(a))]}
                                selected={selectedPeriod}
                                onSelect={setSelectedPeriod}
                            />
                        )}
                    </div>
                    {spotifyStats ? renderStats() : (
                        <div className="loading-container">
                            <div className="spinner" />
                            <p>Loading...</p>
                        </div>
                    )}
                </div>
            </AnimatedLayoutWrapper>
            <SpotifyStatsFetcher
                setSpotifyStats={setSpotifyStats}
                setExtraStats={setExtraStats}
                setLastUpdated={setLastUpdated}
                setTimedOut={setTimedOut}
                range={selectedPeriod}
            />
            <SpotifyRecentFetcher
                setSpotifyRecent={setSpotifyRecent}
                setLastUpdated={setLastUpdated}
                setTimedOut={setTimedOut}
            />
            <div className="recent-wrapper">
                <div className="recent-header">
                    <h3>Recent Tracks</h3>
                    {spotifyRecent.length > 0 && (
                        <p className="track-time">
                            {`${timeAgo(spotifyRecent[currentIndex].endTime)}`}
                        </p>
                    )}
                </div>
                <div className="card-container" role="button">
                    {spotifyRecent.length > 0 && (
                        <SpotifyRecentCard track={spotifyRecent[currentIndex]} />
                    )}
                </div>
                <div className="buttons">
                    <button onClick={prevTrack} disabled={currentIndex === 0}>
                        ◀︎ Prev
                    </button>
                    <button
                        onClick={nextTrack}
                        disabled={currentIndex === spotifyRecent.length - 1}
                    >
                        Next ▶︎
                    </button>
                </div>
            </div>
        </>
    )
}

export default Page
