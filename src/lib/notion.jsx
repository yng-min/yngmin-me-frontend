// src/lib/notion.ts
import { NotionAPI } from 'notion-client'

const notion = new NotionAPI()

export async function getRecordMapFromRaw(rawData) {
    const pageId = Object.keys(rawData)[0]
    if (!pageId) throw new Error('유효한 pageId 없음')

    // notion-client는 실제 Notion API를 호출하므로 직접 쓰면 안 됨
    // 대신, recordMap 형식으로 수동 가공
    // 임시방편: 그냥 rawData를 notion-client가 이해할 수 있도록 형식 맞춰주는 처리만 해도 OK

    // react-notion-x는 block이 있는 객체를 기준으로 렌더링함
    return {
        block: rawData,
        collection: {},
        collection_view: {},
        notion_user: {},
        space: {},
    }
}
