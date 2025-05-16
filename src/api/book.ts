import myAxios from "@/request";

/**
 * @description: 添加书籍
 * @param params
 */
export const addBook = async (params: any) => {
    return myAxios.request({
        url: "/book/add",
        method: "POST",
        data: params,
    });
};

/**
 * @description: 搜索书籍
 * @param params
 */
export const searchBook = async (bookName: any) => {
    return myAxios.request({
        url: "/book/search",
        method: "GET",
        params: {
            bookName,
        },
    });
};

/**
 * @description: 更新书籍
 * @param params
 */
export const updateBook = async (params: any) => {
    return myAxios.request({
        url: "/book/update",
        method: "PATCH",
        data: params,
    });
};

/**
 * @description: 删除书籍
 * @param params
 */
export const deleteBook = async (bookIsbn: any) => {
    return myAxios.request({
        url: "/book/delete",
        method: "DELETE",
        data: bookIsbn,
        // 关键点：要传递 JSON 格式的值
        headers: {
            "Content-Type": "application/json",
        },
    });
};