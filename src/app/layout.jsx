export const metadata = {
    title: 'yngmin.me',
    description: 'Hi There! 👋',
}

const themeScript = `
(function () {
    try {
        var saved = localStorage.getItem("darkMode");
        var isDark = saved === "true" || (saved === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } catch (e) {
        document.documentElement.setAttribute("data-theme", "light");
    }
})();
`

import RootLayout from './RootLayout'

export default function Layout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/ryu.ico" sizes="any"/>
                <link
                    rel="stylesheet"
                    as="style"
                    crossOrigin="anonymous"
                    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css"
                />
                <script
                    dangerouslySetInnerHTML={{ __html: themeScript }}
                />
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
                {/* 홈페이지에 맞는 Open Graph 메타태그 설정 */}
                <meta property="og:title" content={metadata.title} />
                <meta property="og:description" content={metadata.description} />
                <meta property="og:image" content="https://yngmin.me/og-thumbnail.png" />
                <meta property="og:url" content="https://yngmin.me" />
                {/* Twitter 카드용 (선택) */}
                <meta name="twitter:title" content={metadata.title} />
                <meta name="twitter:description" content={metadata.description} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://yngmin.me/og-thumbnail.png" />
            </head>
            <body>
                <RootLayout>{children}</RootLayout>
                <footer className="site-footer">
                    &copy; 2025 yngmin. All rights reserved.
                </footer>
            </body>
        </html>
    )
}
