import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/main.css'
import './assets/notification.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
