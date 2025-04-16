import React, { useEffect, useRef, useState } from 'react'

import { FaPause } from "react-icons/fa"

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

    const trackRef = useRef(null)
    const artistRef = useRef(null)
    const albumRef = useRef(null)

    useEffect(() => {
        const checkOverflow = (ref) =>
            ref.current && ref.current.scrollWidth > ref.current.clientWidth

        setIsOverflowing({
            track: checkOverflow(trackRef),
            artist: checkOverflow(artistRef),
            album: checkOverflow(albumRef),
        })
    }, [track])

    return (
        <div className="card">
            <img
                src={track.albumImage}
                alt={track.albumName}
                className="album-image"
            />
            <div className="track-info">
                <h4
                    className={`track-name ${isOverflowing.track ? 'long-text' : ''}`}
                    ref={trackRef}
                >
                    {track.trackName}
                    {track.explicit && <span className="explicit-mark">19</span>}
                </h4>
                <p
                    className={`artist-names ${isOverflowing.artist ? 'long-text' : ''}`}
                    ref={artistRef}
                >
                    {Array.isArray(track.artistNames)
                        ? track.artistNames.map((name, index) => (
                            <span key={index}>
                                {name}
                                {index < track.artistNames.length - 1 && ', '}
                            </span>
                        ))
                        : track.artistNames}
                </p>
                <p
                    className={`album-name ${isOverflowing.album ? 'long-text' : ''}`}
                    ref={albumRef}
                >
                    [{track.albumName}]
                </p>
                <div className="duration-bar">
                    <span className="start-time">0:00</span>
                    <div className="bar-container" onClick={() => window.open(`https://open.spotify.com/track/${track.spotifyId}`, '_blank')}>
                        <div className="bar-background">
                            <div className="bar-progress" />
                            <div className="play-button">
                                <FaPause size={10} color="#333" />
                            </div>
                        </div>
                    </div>
                    <span className="end-time">{formatDuration(track.durationMs)}</span>
                </div>
            </div>
        </div>
    )
}

export default SpotifyRecentCard
