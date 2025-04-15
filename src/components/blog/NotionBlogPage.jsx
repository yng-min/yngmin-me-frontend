'use client'

import { NotionRenderer } from 'react-notion-x'
import { useEffect, useState, useRef } from 'react'
import { getRecordMapFromRaw } from '@/lib/notion'
import { filterEmptyBlocks } from '@/lib/filterEmptyBlocks'

import Twemoji from 'react-twemoji'
import dynamic from 'next/dynamic'

import useRemoveLoadingOverlay from '@/hooks/useRemoveLoadingOverlay'

import TimeoutPageWrapper from '@/components/TimeoutPageWrapper'
import AnimatedLayoutWrapper from '@/components/AnimatedLayoutWrapper'
import FloatingButtonGroup from '@/components/buttons/FloatingButtonGroup'
import ToggleThemeButton from '@/components/buttons/ToggleThemeButton'
import ToggleCursorButton from '@/components/buttons/ToggleCursorButton'
import InstagramLinkButton from '@/components/buttons/InstagramLinkButton'

const Code = dynamic(() =>
    import('react-notion-x/build/third-party/code').then(m => m.Code),
    { ssr: false }
)
const Collection = dynamic(() =>
    import('react-notion-x/build/third-party/collection').then(m => m.Collection),
    { ssr: false }
)

export default function NotionBlogPage({ pageId }) {
    const [recordMap, setRecordMap] = useState(null)
    const [darkMode, setDarkMode] = useState(false)
    const [timedOut, setTimedOut] = useState(false)
    const [hydrated, setHydrated] = useState(false)
    const timeoutRef = useRef(null)

    useRemoveLoadingOverlay()

    // 다크모드 설정
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode')
        if (savedDarkMode !== null) {
            const parsed = savedDarkMode === 'true'
            if (parsed !== darkMode) setDarkMode(parsed)
        }
    }, [])

    // 테마 스타일 동기화
    useEffect(() => {
        if (hydrated) {
            const root = document.documentElement
            root.style.setProperty('--bg-color', darkMode ? '#1b1b24' : '#cccccd')
            root.style.setProperty('--text-color', darkMode ? '#cccccd' : '#1b1b24')
            root.setAttribute('data-theme', darkMode ? 'dark' : 'light')
            localStorage.setItem('darkMode', darkMode.toString())
        }
    }, [darkMode, hydrated])

    // 데이터 패칭
    useEffect(() => {
        async function fetchData() {
            const normalizedPageId = pageId.replace(/-/g, '')
            const notionApiUrl = `https://notion-cloudflare-worker-1.0min1320.workers.dev/v1/page/${normalizedPageId}`

            try {
                const res = await fetch(`/api/notion/${normalizedPageId}`)
                // const res = await fetch(notionApiUrl)
                const rawData = await res.json()
                const mapped = await getRecordMapFromRaw(rawData)
                const cleaned = filterEmptyBlocks(mapped)

                if (!cleaned || !cleaned.block) {
                    console.error('Invalid Notion data:', cleaned)
                    setTimedOut(true)
                    return
                }

                setRecordMap(cleaned)
            } catch (err) {
                console.error('Failed to fetch Notion data:', err)
                setTimedOut(true)
            }
        }

        fetchData()
    }, [pageId])

    // 타임아웃 처리
    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            setTimedOut(true)
        }, 10000)

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    // 데이터 로딩 완료 시 타임아웃 해제
    useEffect(() => {
        if (recordMap && timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [recordMap])

    // 로딩 오버레이 처리
    useEffect(() => {
        if (recordMap || timedOut) {
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
        }
    }, [recordMap, timedOut])

    // 타임아웃 화면 처리
    if (timedOut) {
        return (
            <div className="timeout-wrapper">
                <TimeoutPageWrapper/>
            </div>
        )
    }

    return (
        <>
            <FloatingButtonGroup>
                <ToggleThemeButton darkMode={darkMode} setDarkMode={setDarkMode}/>
                <ToggleCursorButton/>
                <InstagramLinkButton/>
            </FloatingButtonGroup>
            <AnimatedLayoutWrapper className="notion">
                <Twemoji options={{ folder: 'svg', ext: '.svg' }} className="twemoji-wrapper">
                    {recordMap && (
                        <NotionRenderer
                            recordMap={recordMap}
                            fullPage={true}
                            darkMode={darkMode}
                            components={{ Code, Collection }}
                            disableHeader={true}
                        />
                    )}
                </Twemoji>
            </AnimatedLayoutWrapper>
        </>
    )
}
