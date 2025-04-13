'use client'

import { useEffect } from 'react'
import '@/styles/globals.css'
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'

import Header from '@/components/Header'
import AnimatedLayoutWrapper from '@/components/AnimatedLayoutWrapper'
import LoadingOverlayWrapper from '@/components/LoadingOverlayWrapper'

import { DeviceProvider, useDevice } from '@/context/DeviceContext'
import { CursorProvider } from '@/context/CursorContext'
import CustomCursorWrapper from '@/context/CustomCursorWrapper'

export default function RootLayout({ children }) {
    useEffect(() => {
        const handleRightClick = (e) => {
            e.preventDefault()
        }

        document.body.addEventListener('contextmenu', handleRightClick)
        return () => {
            document.body.removeEventListener('contextmenu', handleRightClick)
        }
    }, [])

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        html[data-theme="dark"] {
                            background-color: #1b1b24;
                            color: #cccccd;
                        }
                        html[data-theme="light"] {
                            background-color: #cccccd;
                            color: #1b1b24;
                        }
                    `,
                }}
            />
            <DeviceProvider>
                <CursorProvider>
                    <RootLayoutContent>{children}</RootLayoutContent>
                </CursorProvider>
            </DeviceProvider>
        </>
    )
}

function RootLayoutContent({ children }) {
    const { isMobile } = useDevice()

    return (
        <>
            <LoadingOverlayWrapper/>
            {!isMobile && <CustomCursorWrapper/>}
            <Header/>
            <div className="light-overlay blossom1"></div>
            <div className="light-overlay blossom2"></div>
            <div className="dark-overlay moon"></div>
            <div className="dark-overlay sky"></div>
            <main className="notion-main-content">
                <AnimatedLayoutWrapper>{children}</AnimatedLayoutWrapper>
            </main>
        </>
    )
}
