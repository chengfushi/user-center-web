import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import HomePage from "@/pages/HomePage.vue";
import UserLoginPage from "@/pages/user/UserLoginPage.vue";
import UserRegisterPage from "@/pages/user/UserRegisterPage.vue";
import UserManagerPage from "@/pages/admin/UserManagerPage.vue";
import BookManagerPage from "@/pages/book/BookManagerPage.vue";
import MessageViewPage from "@/pages/message/MessageViewPage.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: HomePage
    },
    {
        path: '/user/login',
        name: 'login',
        component: UserLoginPage,
    },
    {
        path: '/user/register',
        name: 'register',
        component: UserRegisterPage,
    },
    {
        path: '/admin/userManage',
        component: UserManagerPage,
    },
    {
        path:'/book/bookManage',
        component: BookManagerPage,
    },
    {
        path:'/message',
        component:MessageViewPage,
    }

]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
