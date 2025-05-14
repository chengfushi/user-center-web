import myAxios from "@/request";

/**
 * 用户注册
 * @param params
 */
export const userRegister = async (params: any) => {
    return myAxios.request({
        url: "/user/register",
        method: "POST",
        data: params,
    });
};

/**
 * 用户登录
 * @param params
 */
export const userLogin = async (params: any) => {
    return myAxios.request({
        url: "/user/login",
        method: "POST",
        data: params,
    });
};

/**
 * 用户注销
 * @param params
 */
export const userLogout = async (params: any) => {
    return myAxios.request({
        url: "/user/logout",
        method: "POST",
        data: params,
    });
};

/**
 * 获取当前用户
 */
export const getCurrentUser = async () => {
    return myAxios.request({
        url: "/user/current",
        method: "GET",
    });
};

/**
 * 获取用户列表
 * @param username
 */
export const searchUsers = async (userName: any) => {
    return myAxios.request({
        url: "/user/search",
        method: "GET",
        params: {
            userName,
        },
    });
};

/**
 * 删除用户
 * @param id
 */
export const deleteUser = async (id: string) => {
    return myAxios.request({
        url: "/user/delete",
        method: "DELETE",
        data: id,
        // 关键点：要传递 JSON 格式的值
        headers: {
            "Content-Type": "application/json",
        },
    });
};
