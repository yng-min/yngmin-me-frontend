import { useEffect, useState } from 'react'

const SpotifyStatsFetcher = ({ setSpotifyStats, setExtraStats, setLastUpdated, setTimedOut, startYear, endYear, range }) => {
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

        const convertYearToTimestamp = (year) => {
            const startOfYear = new Date(year, 0, 1).getTime()
            const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999).getTime()
            return { startOfYear, endOfYear }
        }

        const fetchStats = async () => {
            try {
                const dateRes = await fetch(`https://api.stats.fm/api/v1/users/${spotifyId}/streams/stats/dates?range=lifetime&timeZone=Asia%2FSeoul`)
                const fullRes = await fetch(`https://api.stats.fm/api/v1/users/${spotifyId}/streams/stats?range=lifetime`)

                if (!dateRes.ok || !fullRes.ok) throw new Error('HTTP error on one or both requests')

                const [dateData, fullData] = await Promise.all([dateRes.json(), fullRes.json()])
                const yearsData = dateData?.items?.years ?? {}

                const yearRequests = Object.keys(yearsData).map(async (year) => {
                    const { startOfYear, endOfYear } = convertYearToTimestamp(year)
                    const yearDateRes = await fetch(`https://api.stats.fm/api/v1/users/${spotifyId}/streams/stats/dates?after=${startOfYear}&before=${endOfYear}&timeZone=Asia%2FSeoul`)
                    const yearFullRes = await fetch(`https://api.stats.fm/api/v1/users/${spotifyId}/streams/stats?after=${startOfYear}&before=${endOfYear}`)

                    if (!yearDateRes.ok || !yearFullRes.ok) {
                        console.error(`Failed to fetch data for year ${year}`)
                        return null
                    }

                    const [yearDateData, yearFullData] = await Promise.all([yearDateRes.json(), yearFullRes.json()])
                    return { year, dateData: yearDateData, fullData: yearFullData }
                })

                const yearDataResponses = await Promise.all(yearRequests)

                const years = {}
                const perYearExtraStats = {}

                yearDataResponses.forEach((entry) => {
                    if (!entry) return
                    const { year, dateData, fullData } = entry

                    years[year] = {
                        count: fullData.items?.count ?? 0,
                        durationMs: fullData.items?.durationMs ?? 0
                    }

                    perYearExtraStats[year] = {
                        differentTracks: fullData?.items?.cardinality?.tracks ?? 0,
                        differentArtists: fullData?.items?.cardinality?.artists ?? 0,
                        differentAlbums: fullData?.items?.cardinality?.albums ?? 0
                    }
                })

                const combinedData = {
                    spotifyStats: {
                        ...dateData,
                        items: {
                            total: {
                                count: fullData?.items?.count ?? 0,
                                durationMs: fullData?.items?.durationMs ?? 0
                            },
                            years
                        }
                    },
                    extraStats: {
                        lifetime: {
                            differentTracks: fullData?.items?.cardinality?.tracks ?? 0,
                            differentArtists: fullData?.items?.cardinality?.artists ?? 0,
                            differentAlbums: fullData?.items?.cardinality?.albums ?? 0
                        },
                        ...perYearExtraStats
                    },
                    lastUpdated: new Date().toISOString()
                }

                localStorage.setItem('spotifyStats', JSON.stringify(combinedData))

                setSpotifyStats(combinedData.spotifyStats)
                setExtraStats(combinedData.extraStats)
                setLastUpdated(combinedData.lastUpdated)
            } catch (err) {
                console.error('Failed to fetch Spotify stats:', err)
                setTimedOut(true)
            }
        }

        const storedData = localStorage.getItem('spotifyStats')
        if (storedData) {
            const parsed = JSON.parse(storedData)
            const timeElapsed = new Date() - new Date(parsed.lastUpdated)
            if (timeElapsed < 600000 /** 10분 */) {
                setSpotifyStats(parsed.spotifyStats)
                setExtraStats(parsed.extraStats)
                setLastUpdated(parsed.lastUpdated)
            } else {
                fetchStats()
            }
        } else {
            fetchStats()
        }
    }, [spotifyId, setSpotifyStats, setExtraStats, setLastUpdated, setTimedOut, startYear, endYear, range])

    return null
}

export default SpotifyStatsFetcher
