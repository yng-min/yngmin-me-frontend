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
    const [isTrackLoading, setIsTrackLoading] = useState(false)  // 로딩 상태 추가

    const trackRef = useRef(null)
    const artistRef = useRef(null)
    const albumRef = useRef(null)

    useEffect(() => {
        if (track.spotifyId !== currentTrack.spotifyId) {
            // 상태가 변경되기 전에 애니메이션을 "숨김" 상태로 만들기
            setFadeState("hidden")
            setIsTrackLoading(true)  // 트랙 로딩 시작

            // 정보가 변경된 후에 애니메이션과 상태를 다시 보여주는 방식으로 변경
            const timeout = setTimeout(() => {
                setCurrentTrack(track)  // 새로운 track 정보로 상태 업데이트
                setIsTrackLoading(false)  // 로딩 끝난 상태로 업데이트
                setFadeState("visible")  // fade 상태를 보이게 설정
            }, 200)  // 딜레이 후 상태 변경

            return () => clearTimeout(timeout)  // cleanup
        }
    }, [track, currentTrack.spotifyId])

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
            <img
                src={currentTrack.albumImage}
                alt={currentTrack.albumName}
                className="album-image"
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
                            <div className="bar-progress" />
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
