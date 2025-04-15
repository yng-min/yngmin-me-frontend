export const runtime = 'edge'

export const metadata = {
    title: "yngmin.me - blog",
    description: "제 생각이나 지식을 공유합니다."
}

import NotionBlogPage from '@/components/blog/NotionBlogPage'

export default function BlogPostPage({ params }) {
    return <NotionBlogPage pageId={params.pageId} />
}
