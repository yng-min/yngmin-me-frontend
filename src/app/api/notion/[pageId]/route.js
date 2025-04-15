export const runtime = 'edge'

export async function GET(req, { params }) {
    const { pageId } = params

    if (!pageId) {
        return new Response(JSON.stringify({ error: "pageId is required" }), { status: 400 })
    }

    try {
        const notionRes = await fetch(
            `https://notion-cloudflare-worker-1.0min1320.workers.dev/v1/page/${pageId}`,
            {
                headers: {
                    "x-account-id": process.env.ACCOUNT_ID,
                    "x-zone-id": process.env.ZONE_ID,
                },
            }
        )

        console.log(`pageId: ${pageId}`)

        if (!notionRes.ok) {
            return new Response(JSON.stringify({ error: "Failed to fetch Notion data" }), { status: 500 })
        }

        const data = await notionRes.json()
        return Response.json(data)
    } catch (error) {
        console.error("Error occurred during fetch:", error)
        return new Response(JSON.stringify({ error: "Failed to fetch Notion data" }), { status: 500 })
    }
}
