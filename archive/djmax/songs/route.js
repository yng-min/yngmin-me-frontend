import { NextResponse } from "next/server";

// R2 및 KV 네임스페이스 연결
const SONGS_KV = KV.songs_db;
const R2_BUCKET = R2.songs_images;

const fetchAndStoreSongs = async () => {
    const res = await fetch("https://v-archive.net/db/songs.json");
    if (!res.ok) throw new Error("Failed to fetch songs data");

    const data = await res.json();

    // 곡 데이터 KV 저장
    await SONGS_KV.put("songs_data", JSON.stringify(data), {
        expirationTtl: 24 * 60 * 60,  // 24시간 캐시
    });

    // 이미지 저장
    await Promise.all(data.map(async (song) => {
        const imageUrl = song.image_url;
        const imageRes = await fetch(imageUrl);
        if (imageRes.ok) {
            const imageBuffer = await imageRes.arrayBuffer();
            const imageKey = `covers/${song.id}.jpg`; // 곡 ID로 이미지 키 생성
            await R2_BUCKET.put(imageKey, imageBuffer);
        }
    }));
};

export async function GET(req) {
    try {
        // 1일 주기로만 fetch 되도록 처리 (Scheduler 또는 최초 요청 시)
        const needsUpdate = true;  // 현재는 단순화하여 항상 업데이트 진행
        if (needsUpdate) {
            await fetchAndStoreSongs();
        }

        return NextResponse.json({ message: "Songs and images updated." });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
