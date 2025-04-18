export const fetchDjmaxApi = async (endpoint) => {
    try {
        const res = await fetch(`https://v-archive.net/api/archive/${endpoint}`)
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        return { data, error: null }
    } catch (err) {
        return { data: null, error: err.message }
    }
}
