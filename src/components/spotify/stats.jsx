import React, { useEffect, useState } from "react"

const StreamStats = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("https://api.stats.fm/api/v1/users/m92jlmff2u6soqqcp3ltqfuzb/streams/stats/dates?range=lifetime&timeZone=Asia%2FSeoul")
                if (!res.ok) {
                    throw new Error(`HTTP error: ${res.status}`)
                }
                const result = await res.json()
                setData(result)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) return <div>로딩 중...</div>
    if (error) return <div>에러 발생: {error}</div>
    if (!data) return <div>데이터 없음</div>

    return (
        <div>
            <h2>스트리밍 통계 (lifetime)</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    )
}

export default StreamStats
