<template>
    <div id="userLogin">
        <h2 class="title">用户登录</h2>
        <a-form
            style="max-width: 480px;margin: 0 auto"
            :model="formState"
            name="basic"
            :label-align="left"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
            autocomplete="off"
            @finish="handleSubmit"
        >
            <a-form-item
                label="账号"
                name="userAccount"
                :rules="[{ required: true, message: '请输入账号' }]"
            >
                <a-input v-model:value="formState.userAccount" placeholder="请输入账号"/>
            </a-form-item>

            <a-form-item
                label="密码"
                name="userPassword"
                :rules="[{ required: true, message: '请输入密码' },{min:8,message:'密码长度至少为8位'}]"
            >
                <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码"/>
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
                <a-button type="primary" html-type="submit">登录</a-button>
            </a-form-item>
        </a-form>
    </div>
</template>
<script lang="ts" setup>
import {reactive} from 'vue';
import {userLogin} from "@/api/user";
import {useLoginUserStore} from "@/store/useLoginUserStore";
import {message} from "ant-design-vue";
import router from "@/router";

interface FormState {
    userAccount: string;
    userPassword: string;
}

const formState = reactive<FormState>({
    userAccount:"",
    userPassword: "",
});
const onFinish = (values: any) => {
    console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

//获取全局登录状态
const loginUserStore = useLoginUserStore();
/**
 * @description: 提交表单
 * @author Chrng Fu
 */
const handleSubmit = async (formState:any)=>{
    const res = await userLogin(formState);

    if (res.data.code === 0 && res.data.data){
        await loginUserStore.fetchLoginUser();
        message.success("登录成功");
        router.push({
            path:"/",
            replace:true,
        })
    }else {
        message.error("登录失败");
    }
    console.log("success:",res.data.data);
}
</script>

<style scoped>
#userLogin .title{
    text-align: center;
    margin-bottom: 16px;
}
</style>