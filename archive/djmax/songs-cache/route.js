import { NextResponse } from 'next/server'

export async function GET(req, { env }) {
    try {
        // KV에서 저장된 곡 데이터 가져오기
        const songsData = await env.djmax_db.get("yngmin.me-djmax-db")

        if (!songsData) {
            return NextResponse.json({ error: "No songs found in KV" }, { status: 500 })
        }

        const parsedData = JSON.parse(songsData)

        // 곡 데이터에 대해 이미지 URL을 R2에서 가져옴
        const songsWithImages = await Promise.all(parsedData.data.map(async (song) => {
            const imageUrl = `https://b4b120d3b5945ebff8ccc66c21a986f8.r2.cloudflarestorage.com/yngmin-me-djmax-songs-images/covers/${song.title}.jpg`

            // R2에서 이미지가 존재하는지 체크
            const imageResponse = await fetch(imageUrl, { method: 'HEAD' })

            // 이미지가 없으면 기본 이미지 사용
            const validImageUrl = imageResponse.ok ? imageUrl : '/default-image.png'

            return {
                ...song,
                imageUrl: validImageUrl,
            }
        }))

        return NextResponse.json(songsWithImages)

    } catch (e) {
        console.error("Error fetching songs:", e)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
