export default defineNuxtPlugin(() => {
    const script = document.createElement('script')
    script.src = '/cborg.min.js'
    script.async = false
    document.head.appendChild(script)
})