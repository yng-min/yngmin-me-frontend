'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const DeviceContext = createContext({
	isMobile: false,
})

export function DeviceProvider({ children }) {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const userAgent = navigator.userAgent || /* navigator.vendor || */ window.opera
		const mobile = /android|iphone|ipad|mobile/i.test(userAgent)
		setIsMobile(mobile)
	}, [])

	return (
		<DeviceContext.Provider value={{ isMobile }}>
			{children}
		</DeviceContext.Provider>
	)
}

export function useDevice() {
	return useContext(DeviceContext)
}
