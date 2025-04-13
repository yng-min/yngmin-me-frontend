'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useDevice } from './DeviceContext'

const CursorContext = createContext({
    cursorEnabled: true,
    setCursorEnabled: () => { },
})

export function CursorProvider({ children }) {
    const { isMobile } = useDevice()
    const [cursorEnabled, setCursorEnabled] = useState(true)

    useEffect(() => {
        if (isMobile) {
            setCursorEnabled(false)
        }
    }, [isMobile])

    useEffect(() => {
        if (cursorEnabled) {
            document.body.classList.add('custom-cursor-enabled')
        } else {
            document.body.classList.remove('custom-cursor-enabled')
        }
    }, [cursorEnabled])

    return (
        <CursorContext.Provider value={{ cursorEnabled, setCursorEnabled }}>
            {children}
        </CursorContext.Provider>
    )
}

export function useCursor() {
    return useContext(CursorContext)
}
