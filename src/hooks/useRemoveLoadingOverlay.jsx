'use client'

import { useEffect } from 'react'

export default function useRemoveLoadingOverlay() {
	useEffect(() => {
		const overlay = document.getElementById('loading-overlay')
		const text = document.getElementById('loading-text')

		if (overlay && text) {
			overlay.classList.remove('show')
			text.classList.remove('show')
			overlay.classList.add('hide')
			text.classList.add('hide')

			setTimeout(() => {
				overlay.style.display = 'none'
				text.style.display = 'none'
			}, 700)
		}
	}, [])
}
