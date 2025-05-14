import { defineStore } from 'pinia'
import {ref} from "vue";
import {getCurrentUser} from "@/api/user";

export const useLoginUserStore = defineStore('loginUser', () => {
    const loginUser = ref<any>({
        userName:"未登录",
    });

    //远程获取用户登录信息
    async function fetchLoginUser(){
        const res = await getCurrentUser();
        if (res.data.code == 0 && res.data.data){
            loginUser.value = res.data.data;
        }
    }

    function setLoginUser(newloginUser:any ):void{
        loginUser.value = newloginUser;
    }

    return {loginUser,fetchLoginUser,setLoginUser}
})