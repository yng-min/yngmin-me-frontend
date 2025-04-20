'use client'

import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext({
    loadingComplete: false,
    setLoadingComplete: (value) => { }
})

export function LoadingProvider({ children }) {
    const [loadingComplete, setLoadingComplete] = useState(false)

    return (
        <LoadingContext.Provider value={{ loadingComplete, setLoadingComplete }}>
            {children}
        </LoadingContext.Provider>
    )
}

export const useLoading = () => useContext(LoadingContext)
