import React, { useEffect, useRef, useState } from 'react'
import { FaPause } from "react-icons/fa"
import ScrollingText from '@/components/animations/ScrollingText'

const formatDuration = (durationMs) => {
    const minutes = Math.floor(durationMs / 1000 / 60)
    const seconds = Math.floor((durationMs / 1000) % 60)
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}

const SpotifyRecentCard = ({ track }) => {
    const [isOverflowing, setIsOverflowing] = useState({
        track: false,
        artist: false,
        album: false,
    })

    const [fadeState, setFadeState] = useState("visible")
    const [currentTrack, setCurrentTrack] = useState(track)
    const [isTrackLoading, setIsTrackLoading] = useState(false)
    const [progressWidth, setProgressWidth] = useState(37) // 바의 초기 width 상태 설정

    const trackRef = useRef(null)
    const artistRef = useRef(null)
    const albumRef = useRef(null)

    useEffect(() => {
        if (track.spotifyId !== currentTrack.spotifyId) {
            setFadeState("hidden")

            const timeout = setTimeout(() => {
                setCurrentTrack(track)  // 트랙 변경
                setProgressWidth(Math.floor(Math.random() * 101)) // 트랙이 바뀔 때마다 progressWidth를 랜덤으로 설정
                setIsOverflowing({
                    track: false,
                    artist: false,
                    album: false,
                })
                setFadeState("visible")
            }, 200)

            return () => clearTimeout(timeout)
        }
    }, [track, currentTrack.spotifyId]) // track가 바뀔 때마다 실행

    useEffect(() => {
        if (isTrackLoading) return

        const refs = {
            track: trackRef,
            artist: artistRef,
            album: albumRef,
        }

        const tolerance = 1
        const frameIds = {}

        const checkOverflow = (key, ref) => {
            const el = ref?.current
            if (!el) return

            const scroll = el.scrollWidth
            const client = el.clientWidth
            const isOverflow = Math.ceil(scroll) > Math.ceil(client + tolerance)

            setIsOverflowing(prev => {
                if (prev[key] !== isOverflow) {
                    return { ...prev, [key]: isOverflow }
                }
                return prev
            })

            frameIds[key] = requestAnimationFrame(() => checkOverflow(key, ref))
        }

        document.fonts.ready.then(() => {
            Object.entries(refs).forEach(([key, ref]) => {
                frameIds[key] = requestAnimationFrame(() => checkOverflow(key, ref))
            })
        })

        return () => {
            Object.values(frameIds).forEach(id => cancelAnimationFrame(id))
        }
    }, [
        currentTrack.trackName,
        currentTrack.artistNames,
        currentTrack.albumName,
        currentTrack.spotifyId,
        isTrackLoading,
    ])

    const renderField = (text, isOverflow, ref, prefix = "", suffix = "") => (
        <div className="scroll-wrapper" ref={ref}>
            {isOverflow
                ? <ScrollingText key={text} text={`${prefix}${text}${suffix}`} />
                : `${prefix}${text}${suffix}`}
        </div>
    )

    return (
        <div className={`card card-transition ${fadeState === "hidden" ? "hidden" : ""}`}>
            <div className={`card-fade-overlay ${fadeState === "hidden" ? "active" : ""}`} />
            <img
                src={currentTrack.albumImage}
                alt={currentTrack.albumName}
                className="album-image"
                onClick={() =>
                    window.open(`https://open.spotify.com/track/${currentTrack.spotifyId}`, '_blank')
                }
            />

            <div className="track-info">
                <div className="track-name">
                    {renderField(currentTrack.trackName, isOverflowing.track, trackRef)}
                </div>

                <div className="artist-names">
                    {renderField(currentTrack.artistNames.join(', '), isOverflowing.artist, artistRef)}
                </div>

                <div className="album-name">
                    {renderField(currentTrack.albumName, isOverflowing.album, albumRef, "[", "]")}
                </div>

                <div className="duration-bar">
                    <span className="start-time">0:00</span>
                    <div
                        className="bar-container"
                        onClick={() =>
                            window.open(`https://open.spotify.com/track/${currentTrack.spotifyId}`, '_blank')
                        }
                    >
                        <div className="bar-background">
                            <div
                                className="bar-progress"
                                style={{ width: `${progressWidth}%` }} // progressWidth에 따라 width 변경
                            />
                            <div className="play-button">
                                <FaPause size={10} color="#333" />
                            </div>
                        </div>
                    </div>
                    <span className="end-time">{formatDuration(currentTrack.durationMs)}</span>
                </div>
            </div>
        </div>
    )
}

export default SpotifyRecentCard
