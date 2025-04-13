/**
 * Notion recordMap에서 비어 있는 텍스트 블록과 내용 없는 컬럼 블록 제거
 * @param {import('notion-types').ExtendedRecordMap} recordMap
 * @returns {import('notion-types').ExtendedRecordMap} filtered recordMap
 */

function isEmptyBlock(block) {
    if (!block) return true

    if (block.type === 'text') {
        return (
            !block.properties ||
            !block.properties.title ||
            block.properties.title[0][0].trim() === ''
        )
    }

    if (block.type === 'column') {
        return !block.content || block.content.length === 0
    }

    return false
}

export function filterEmptyBlocks(recordMap) {
    const filtered = { ...recordMap, block: { ...recordMap.block } }
    const blocks = filtered.block

    const blocksToDelete = new Set()

    for (const [key, value] of Object.entries(blocks)) {
        const block = value?.value
        if (!block) continue

        const isEmptyText = block.type === 'text' && isEmptyBlock(block)
        const isEmptyColumn =
            block.type === 'column' &&
            (!block.content || block.content.length === 0 ||
                block.content.every(id => isEmptyBlock(blocks[id]?.value)))

        if (isEmptyText || isEmptyColumn) {
            blocksToDelete.add(key)
        }
    }

    // column_list 내부에서도 제거
    for (const [key, value] of Object.entries(blocks)) {
        const block = value?.value
        if (!block || block.type !== 'column_list' || !block.content) continue

        block.content = block.content.filter(id => !blocksToDelete.has(id))

        if (block.content.length === 0) {
            blocksToDelete.add(key)
        }
    }

    for (const id of blocksToDelete) {
        delete filtered.block[id]
    }

    return filtered
}
