import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

// Indique à Vue que <pnx-photo-viewer> est un élément personnalisé
app.config.compilerOptions.isCustomElement = (tag) => tag === 'pnx-photo-viewer';

// Importe le script du PhotoViewer
import '@panoramax/web-viewer';

app.use(createPinia())

app.mount('#app')
