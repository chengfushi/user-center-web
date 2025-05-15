import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import { useLoginUserStore } from '@/store/useLoginUserStore'; // 确保正确导入

const pinia = createPinia()

const app = createApp(App).use(pinia).use(Antd).use(router);

// 在应用启动时恢复用户状态
const loginUserStore = useLoginUserStore();
const storedUserString = localStorage.getItem('loginUser');
if (storedUserString) {
    const storedUser = JSON.parse(storedUserString);
    loginUserStore.setLoginUser(storedUser);
}

app.mount('#app');