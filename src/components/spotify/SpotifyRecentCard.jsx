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

    const trackRef = useRef(null)
    const artistRef = useRef(null)
    const albumRef = useRef(null)

    // 트랙 변경 감지 → 애니메이션 전환
    useEffect(() => {
        if (
            track.spotifyId !== currentTrack.spotifyId
        ) {
            setFadeState("hidden") // 페이드 아웃 시작

            const timeout = setTimeout(() => {
                setCurrentTrack(track) // 데이터 갱신
                setFadeState("visible") // 페이드 인 시작
            }, 200) // transition 시간과 맞춤

            return () => clearTimeout(timeout)
        }
    }, [track])

    // 텍스트 오버플로우 체크
    useEffect(() => {
        const checkOverflow = (ref) => {
            if (!ref?.current) return false
            return ref.current.scrollWidth > ref.current.clientWidth
        }

        const delayCheckOverflow = () => {
            setTimeout(() => {
                setIsOverflowing({
                    track: checkOverflow(trackRef),
                    artist: checkOverflow(artistRef),
                    album: checkOverflow(albumRef),
                })
            }, 150)
        }

        delayCheckOverflow()

        return () => { }
    }, [currentTrack.trackName, currentTrack.artistNames, currentTrack.albumName])

    return (
        <div className={`card card-transition ${fadeState === "hidden" ? "hidden" : ""}`}>
            <img
                src={currentTrack.albumImage}
                alt={currentTrack.albumName}
                className="album-image"
            />

            <div className="track-info">
                <div className="track-name">
                    <div className="scroll-wrapper" ref={trackRef}>
                        {isOverflowing.track ? (
                            <ScrollingText text={currentTrack.trackName} />
                        ) : (
                            currentTrack.trackName
                        )}
                    </div>
                </div>

                <div className="artist-names">
                    <div className="scroll-wrapper" ref={artistRef}>
                        {isOverflowing.artist ? (
                            <ScrollingText text={currentTrack.artistNames.join(', ')} />
                        ) : (
                            currentTrack.artistNames.join(', ')
                        )}
                    </div>
                </div>

                <div className="album-name">
                    <div className="scroll-wrapper" ref={albumRef}>
                        {isOverflowing.album ? (
                            <ScrollingText text={`[${currentTrack.albumName}]`} />
                        ) : (
                            `[${currentTrack.albumName}]`
                        )}
                    </div>
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
