'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { fetchDjmaxApi } from '@/lib/djmaxApi'

const DjmaxDataFetcher = () => {
    const searchParams = useSearchParams()
    const button = searchParams.get('button') || '4'
    const board = searchParams.get('board') || 'SC'

    const [djmaxArchiveNickname, setDjmaxArchiveNickname] = useState('')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/config.json`)
                const configData = await response.json()
                setDjmaxArchiveNickname(configData.djmaxArchiveNickname)
            } catch (err) {
                console.error('Failed to fetch config:', err)
            }
        }

        fetchConfig()
    }, [])

    useEffect(() => {
        // djmaxArchiveNickname이 비어 있으면 fetch를 하지 않음
        if (!djmaxArchiveNickname) return

        const localStorageKey = `djmaxPerformance_${button}_${board}`

        const fetchPerformanceData = async () => {
            try {
                const { data, error } = await fetchDjmaxApi(`${djmaxArchiveNickname}/board/${button}/${board}`)

                if (error) {
                    console.error('Failed to fetch DJMAX data:', error)
                    return
                }

                const payload = {
                    data,
                    lastUpdated: new Date().toISOString()
                }

                localStorage.setItem(localStorageKey, JSON.stringify(payload))
                setData(data)
                setLoading(false)
            } catch (err) {
                console.error('Unexpected error fetching DJMAX data:', err)
            }
        }

        const storedData = localStorage.getItem(localStorageKey)
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData)
                const timeElapsed = new Date() - new Date(parsed.lastUpdated)
                if (timeElapsed < 600000 /** 10분 */) {
                    setData(parsed.data)
                    setLoading(false)
                } else {
                    fetchPerformanceData()
                }
            } catch (err) {
                fetchPerformanceData()
            }
        } else {
            fetchPerformanceData()
        }
    }, [djmaxArchiveNickname, button, board]) // djmaxArchiveNickname을 의존성 배열에 추가하여, 설정되었을 때 데이터 가져오도록 함

    if (loading) return <div>Loading...</div>

    return (
        <div>
            {/* Render the data */}
        </div>
    )
}

export default DjmaxDataFetcher
