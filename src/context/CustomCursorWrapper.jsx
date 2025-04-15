'use client'

import { useCursor } from '@/context/CursorContext'
import CustomCursor from '@/components/cursors/CustomCursor'

export default function CustomCursorWrapper() {
    const { cursorEnabled } = useCursor()
    if (!cursorEnabled) return null
    return <CustomCursor/>
}
