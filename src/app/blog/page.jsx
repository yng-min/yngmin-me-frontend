export const runtime = 'edge';
export const dynamic = "force-dynamic"
export const metadata = {
    title: "yngmin.me - blog",
    description: "제 생각이나 지식을 공유합니다."
}

import Client from "./client"

export default function AboutPage() {
    return (
        <main>
            <Client />
        </main>
    )
}
