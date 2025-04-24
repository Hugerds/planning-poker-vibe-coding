import { createApp } from 'vue'
import './style.css' // Re-adicionando a importação dos estilos globais
import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .mount('#app')