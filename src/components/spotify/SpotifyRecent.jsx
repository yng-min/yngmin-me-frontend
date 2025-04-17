import { useEffect, useState } from 'react'

const SpotifyRecentFetcher = ({ setSpotifyRecent, setLastUpdated, setTimedOut }) => {
    const [spotifyId, setSpotifyId] = useState('')

    useEffect(() => {
        async function fetchConfig() {
            try {
                const response = await fetch('/config.json')
                const data = await response.json()
                setSpotifyId(data.spotifyId)
            } catch (err) {
                console.error('Failed to fetch config:', err)
                setTimedOut(true)
            }
        }
        fetchConfig()
    }, [setTimedOut])

    useEffect(() => {
        if (!spotifyId) return

        const fetchRecentData = async () => {
            try {
                const response = await fetch(`https://api.stats.fm/api/v1/users/${spotifyId}/streams/recent?limit=50`)

                const recentData = await response.json()
                if (!response.ok || recentData.items.length === 0) {
                    throw new Error('Failed to fetch recent data')
                }

                // 필요한 데이터만 추출
                const processedData = recentData.items.map(item => ({
                    trackName: item.track.name,
                    artistNames: item.track.artists.map(artist => artist.name), // 모든 아티스트 이름 저장
                    albumName: item.track.albums[0]?.name,  // 첫 번째 앨범
                    albumImage: item.track.albums[0]?.image,
                    endTime: item.endTime,
                    spotifyPreview: item.track.spotifyPreview,
                    explicit: item.track.explicit,
                    durationMs: item.track.durationMs,
                    spotifyId: item.track.externalIds.spotify[0], // Spotify ID
                }))

                const combinedData = {
                    recentStats: processedData,
                    lastUpdated: new Date().toISOString()
                }

                // 로컬 스토리지에 저장
                localStorage.setItem('spotifyRecentData', JSON.stringify(combinedData))

                setSpotifyRecent(combinedData.recentStats)
                setLastUpdated(combinedData.lastUpdated)
            } catch (err) {
                console.error('Failed to fetch Spotify recent stats:', err)
                setTimedOut(true)
            }
        }

        const storedData = localStorage.getItem('spotifyRecentData')
        if (storedData) {
            const parsed = JSON.parse(storedData)
            const timeElapsed = new Date() - new Date(parsed.lastUpdated)
            if (timeElapsed < 1800000 /** 30분 */) {
                setSpotifyRecent(parsed.recentStats)
                setLastUpdated(parsed.lastUpdated)
            } else {
                fetchRecentData()
            }
        } else {
            fetchRecentData()
        }
    }, [spotifyId, setSpotifyRecent, setLastUpdated, setTimedOut])

    return null
}

export default SpotifyRecentFetcher
