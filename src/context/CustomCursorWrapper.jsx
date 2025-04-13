'use client'

import { useCursor } from '@/context/CursorContext'
import CustomCursor from '@/components/CustomCursor'

export default function CustomCursorWrapper() {
    const { cursorEnabled } = useCursor()
    if (!cursorEnabled) return null
    return <CustomCursor/>
}
