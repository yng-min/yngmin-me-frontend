export default function SetInitialThemeScript() {
    return (
        <>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        (function () {
                            const savedDarkMode = localStorage.getItem("darkMode");
                            const theme = savedDarkMode === "dark" || (savedDarkMode === null && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
                            const root = document.documentElement;
                            root.setAttribute("data-theme", theme);
                            root.style.setProperty("--bg-color", theme === "dark" ? "#1b1b24" : "#cccccd");
                            root.style.setProperty("--text-color", theme === "dark" ? "#cccccd" : "#1b1b24");
                        })();
                    `,
                }}
            />
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        :root {
                            --bg-color: #cccccd;
                            --text-color: #1b1b24;
                        }

                        [data-theme="dark"] {
                            --bg-color: #1b1b24;
                            --text-color: #cccccd;
                        }

                        body {
                            background-color: var(--bg-color);
                            color: var(--text-color);
                        }
                    `,
                }}
            />
        </>
    )
}
