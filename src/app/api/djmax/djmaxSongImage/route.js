import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const response = await fetch('https://yngmin-me-backend.0min1320.workers.dev/api/songs')
        const songsDataRaw = await response.text()

        if (!songsDataRaw) {
            return NextResponse.json({ message: 'No songs found' }, { status: 404 })
        }

        const songsData = JSON.parse(songsDataRaw)
        const result = songsData.data.map((song) => ({
            title: song.title,
            imageUrl: `https://api.yngmin.me/covers/${encodeURIComponent(song.title)}.jpg`
        }))

        return new NextResponse(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600'
            }
        })
    } catch (err) {
        console.error('songs_data 파싱 오류:', err)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}
