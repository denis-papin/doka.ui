import { createRouter, createWebHistory } from 'vue-router'
import SearchResult from '../components/SearchResult.vue'
import UploadPage from '../components/UploadPage.vue'

const routes = [
    { path: '/search', component: SearchResult },
    { path: '/upload', component: UploadPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router