export const metadata = {
    title: 'yngmin.me - about me',
    description: 'hi there! 👋',
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
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description}/>
                <link rel="icon" href="./favicon.ico" sizes="any"/>
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
                <meta property="og:title" content={metadata.title}/>
                <meta property="og:description" content={metadata.description}/>
                {/* <meta property="og:image" content="https://yngmin.me/aboutme-thumbnail.png"/> */}
            </head>
            <body>
                <RootLayout>{children}</RootLayout>
            </body>
            <footer class="site-footer">
                &copy; 2025 yngmin. All rights reserved.
            </footer>
        </html>
    )
}
