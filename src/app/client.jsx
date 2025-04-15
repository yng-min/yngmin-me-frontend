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
    import('react-notion-x/build/third-party/code').then(m => m.Code)
)
const Collection = dynamic(() =>
    import('react-notion-x/build/third-party/collection').then(m => m.Collection)
)

export default function Page() {
    const [recordMap, setRecordMap] = useState(null)
    const [hydrated, setHydrated] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [notionApiUrl, setNotionApiUrl] = useState('')
    const [timedOut, setTimedOut] = useState(false)
    const timeoutRef = useRef(null)

    useRemoveLoadingOverlay()

    // 다크모드 초기값 설정
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode')
        if (savedDarkMode !== null) {
            const parsed = savedDarkMode === 'true'
            setDarkMode(parsed)
        }
        setHydrated(true)
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

    // config.json 가져오기
    useEffect(() => {
        async function fetchConfig() {
            try {
                const response = await fetch('/config.json')
                const data = await response.json()
                setNotionApiUrl(data.notionApiUrl_home)
            } catch (err) {
                console.error('Failed to fetch config:', err)
                setTimedOut(true)
            }
        }
        fetchConfig()
    }, [])

    // 노션 데이터 가져오기
    useEffect(() => {
        if (!notionApiUrl) return

        async function fetchData() {
            try {
                const res = await fetch(`/api/notion/${notionApiUrl}`)
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
    }, [notionApiUrl])

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

    // 외부 링크 속성 변경
    useEffect(() => {
        const links = document.querySelectorAll('a[target="_blank"]')
        links.forEach(link => {
            link.setAttribute('target', '_self')
        })
    }, [recordMap])

    // 로딩 오버레이 제거
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

    // 렌더링 분기
    if (timedOut) {
        return (
            <div className="timeout-wrapper">
                <TimeoutPageWrapper />
            </div>
        )
    }

    return (
        <>
            <FloatingButtonGroup>
                <ToggleThemeButton darkMode={darkMode} setDarkMode={setDarkMode} />
                <ToggleCursorButton />
                <InstagramLinkButton />
            </FloatingButtonGroup>
            <AnimatedLayoutWrapper className="notion">
                <Twemoji options={{ folder: 'svg', ext: '.svg' }} className="twemoji-wrapper">
                    {recordMap && recordMap.block ? (
                        <NotionRenderer
                            recordMap={recordMap}
                            fullPage={true}
                            darkMode={darkMode}
                            components={{ Code, Collection }}
                            disableHeader={true}
                        />
                    ) : null}
                </Twemoji>
            </AnimatedLayoutWrapper>
        </>
    )
}
