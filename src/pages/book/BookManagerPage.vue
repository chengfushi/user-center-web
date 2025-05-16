<template>
    <div id="bookManage">
        <div class="search">
            <a-input-search
                style="max-width: 320px;margin-bottom: 20px"
                v-model:value="searchValue"
                placeholder="输入书名搜索"
                enter-button="搜索"
                size="large"
                @search="onSearch"
            />
        </div>

        <!-- 管理员才显示添加书籍表单 -->
        <div class="add" style="margin-bottom: 20px" v-if="isAdmin">
            <a-form
                :model="formState"
                name="add_book_form"
                layout="inline"
                autocomplete="off"
                @finish="onFinish"
                @finishFailed="onFinishFailed"
            >
                <a-form-item
                    label="ISBN"
                    name="bookIsbn"
                    :rules="[{ required: true, message: '请输入ISBN!' }]"
                >
                    <a-input v-model:value="formState.bookIsbn"/>
                </a-form-item>

                <a-form-item
                    label="书名"
                    name="bookName"
                    :rules="[{ required: true, message: '请输入书名!' }]"
                >
                    <a-input v-model:value="formState.bookName"/>
                </a-form-item>

                <a-form-item
                    label="价格"
                    name="bookPrice"
                    :rules="[{ required: true, message: '请输入价格!' }]"
                >
                    <a-input-number v-model:value="formState.bookPrice" :min="0"/>
                </a-form-item>

                <a-form-item
                    label="出版日期"
                    name="publishDate"
                    :rules="[{ required: true, message: '请选择出版日期!' }]"
                >
                    <a-date-picker v-model:value="formState.publishDate"/>
                </a-form-item>

                <a-form-item>
                    <a-button :disabled="disabled" type="primary" html-type="submit">添加书籍</a-button>
                </a-form-item>
            </a-form>
        </div>

        <div class="table">
            <a-table :columns="isAdmin ? columns : userColumns" :data-source="data">
                <template #bodyCell="{ column, record }">
                    <!-- 管理员操作列 -->
                    <template v-if="column.dataIndex === 'action' && isAdmin">
                        <a-button @click="openEditModal(record)">编辑</a-button>
                        <a-button danger @click="doDelete(record.bookIsbn)">删除</a-button>
                    </template>

                    <!-- 普通用户购买操作列 -->
                    <template v-else-if="column.dataIndex === 'purchase' && !isAdmin">
                        <div class="purchase-controls">
                            <a-input-number
                                v-model:value="record.purchaseQuantity"
                                :min="1"
                                :max="99"
                                @change="(value) => updateTotalPrice(record, value)"
                            />
                            <div class="total-price">总价: ¥{{ record.totalPrice || 0 }}</div>
                            <a-button style="max-width: 100px" type="primary" @click="purchaseBook(record)">购买
                            </a-button>
                        </div>
                    </template>
                    <template v-else-if="column.dataIndex === 'publishDate'">
                        {{ record.publishDate ? record.publishDate.format("YYYY-MM-DD") : '' }}
                    </template>
                </template>
            </a-table>
        </div>

        <!-- 编辑模态框 -->
        <a-modal
            :visible="editModalVisible"
            title="编辑书籍"
            @cancel="closeEditModal"
            @ok="saveEditBook"
        >
            <a-form
                :model="editFormState"
                name="edit_book_form"
                :layout="formLayout"
                autocomplete="off"
            >
                <a-form-item
                    label="ISBN"
                    name="bookIsbn"
                    :rules="[{ required: true, message: '请输入ISBN!' }]"
                >
                    <a-input v-model:value="editFormState.bookIsbn" disabled/>
                </a-form-item>

                <a-form-item
                    label="书名"
                    name="bookName"
                    :rules="[{ required: true, message: '请输入书名!' }]"
                >
                    <a-input v-model:value="editFormState.bookName"/>
                </a-form-item>

                <a-form-item
                    label="价格"
                    name="bookPrice"
                    :rules="[{ required: true, message: '请输入价格!' }]"
                >
                    <a-input-number v-model:value="editFormState.bookPrice" :min="0"/>
                </a-form-item>

                <a-form-item
                    label="出版日期"
                    name="publishDate"
                    :rules="[{ required: true, message: '请选择出版日期!' }]"
                >
                    <a-date-picker v-model:value="editFormState.publishDate"/>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 普通用户购物车 -->
        <div v-if="!isAdmin && cartItems.length > 0" class="cart-container">
            <h3>购物车</h3>
            <div class="cart-items">
                <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
                    <span>{{ item.bookName }} × {{ item.quantity }}</span>
                    <span class="cart-item-price">¥{{ item.totalPrice }}</span>
                </div>
            </div>
            <div class="cart-total">
                <span>总计</span>
                <span class="cart-total-price">¥{{ cartTotalPrice }}</span>
            </div>
            <a-button type="primary" @click="checkout">结算</a-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {SmileOutlined, DownOutlined} from '@ant-design/icons-vue';
import {addBook, searchBook, updateBook, deleteBook} from "@/api/book";
import {reactive, ref, onMounted, computed} from "vue";
import {message} from "ant-design-vue";
import dayjs from "dayjs";
import {useLoginUserStore} from "@/store/useLoginUserStore";

interface FormState {
    bookIsbn: string;
    bookName: string;
    bookPrice: number;
    publishDate: dayjs.Dayjs | null;
}

// 添加书籍表单
const formState = reactive<FormState>({
    bookIsbn: '',
    bookName: '',
    bookPrice: 0,
    publishDate: null,
});

// 编辑书籍表单
const editFormState = reactive<FormState>({
    bookIsbn: '',
    bookName: '',
    bookPrice: 0,
    publishDate: null,
});

const editModalVisible = ref(false);

const formLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const onFinish = async (values: any) => {
    try {
        // 转换日期格式
        const formattedValues = {
            ...values,
            publishDate: values.publishDate ? values.publishDate.format('YYYY-MM-DD') : '',
        };

        const res = await addBook(formattedValues);
        if (res.data.code === 0) {
            message.success("添加成功");
            // 重置表单
            Object.keys(formState).forEach(key => {
                formState[key as keyof FormState] =
                    key === 'bookPrice' ? 0 :
                        key === 'publishDate' ? null : '';
            });
            // 刷新数据
            fetchData();
        } else {
            message.error("添加失败: " + res.data.message);
        }
    } catch (error) {
        console.error("添加书籍出错:", error);
        message.error("添加失败");
    }
};

const onFinishFailed = (errorInfo: any) => {
    console.log('表单验证失败:', errorInfo);
};

const disabled = computed(() => {
    return !(formState.bookIsbn && formState.bookName && formState.bookPrice && formState.publishDate);
});

const searchValue = ref("");

// 执行搜索获取数据
const onSearch = () => {
    fetchData(searchValue.value)
}

const doDelete = async (bookIsbn: string) => {
    if (!bookIsbn) {
        return;
    }
    const res = await deleteBook(bookIsbn);
    if (res.data.code === 0) {
        message.success("删除成功");
        fetchData(); // 刷新数据
    } else {
        message.error("删除失败");
    }
}

// 打开编辑模态框
const openEditModal = (record: any) => {
    // 复制数据到编辑表单
    editFormState.bookIsbn = record.bookIsbn;
    editFormState.bookName = record.bookName;
    editFormState.bookPrice = record.bookPrice;
    editFormState.publishDate = record.publishDate;

    editModalVisible.value = true;
}

// 关闭编辑模态框
const closeEditModal = () => {
    editModalVisible.value = false;
}

// 保存编辑的书籍
const saveEditBook = async () => {
    try {
        // 转换日期格式
        const formattedValues = {
            ...editFormState,
            publishDate: editFormState.publishDate ? editFormState.publishDate.format('YYYY-MM-DD') : '',
        };

        const res = await updateBook(formattedValues);
        if (res.data.code === 0) {
            message.success("更新成功");
            closeEditModal();
            fetchData(); // 刷新数据
        } else {
            message.error("更新失败: " + res.data.message);
        }
    } catch (error) {
        console.error("更新书籍出错:", error);
        message.error("更新失败: 网络错误");
    }
}

// 获取用户信息
const loginUserStore = useLoginUserStore();
const isAdmin = computed(() => loginUserStore.loginUser.userRole === 1);

// 管理员表格列配置
const columns = [
    {
        title: "ISBN",
        dataIndex: "bookIsbn",
    },
    {
        title: '书名',
        dataIndex: 'bookName',
    },
    {
        title: '价格',
        dataIndex: 'bookPrice',
    },
    {
        title: '出版时间',
        dataIndex: 'publishDate',
    },
    {
        title: '操作',
        dataIndex: 'action',
    }
];

// 普通用户表格列配置
const userColumns = [
    {
        title: "ISBN",
        dataIndex: "bookIsbn",
    },
    {
        title: '书名',
        dataIndex: 'bookName',
    },
    {
        title: '价格(¥)',
        dataIndex: 'bookPrice',
    },
    {
        title: '出版时间',
        dataIndex: 'publishDate',
    },
    {
        title: '购买',
        dataIndex: 'purchase',
    }
];

const data = ref([]);

const fetchData = async (bookName = "") => {
    try {
        const res = await searchBook(bookName);
        if (res.data.data) {
            data.value = res.data.data.map((item: any) => ({
                ...item,
                publishDate: item.publishDate ? dayjs(item.publishDate) : null,
                purchaseQuantity: 1, // 初始购买数量为1
                totalPrice: item.bookPrice // 初始总价等于单价
            }));
        } else {
            message.error("获取书籍列表失败");
            data.value = [];
        }
    } catch (error) {
        console.error("获取书籍列表出错:", error);
        message.error("获取书籍列表失败: 网络错误");
        data.value = [];
    }
}

// 更新总价格
const updateTotalPrice = (record: any, quantity: number) => {
    record.totalPrice = quantity * record.bookPrice;
};

// 购物车功能
const cartItems = ref([]);

/**
 * 购买书籍 - 添加到购物车
 * @param record 书籍记录
 */
const purchaseBook = (record: any) => {
    // 检查是否已在购物车中
    const index = cartItems.value.findIndex(item => item.bookIsbn === record.bookIsbn);
    if (index !== -1) {
        // 如果已存在，增加数量
        cartItems.value[index].quantity += record.purchaseQuantity;
        cartItems.value[index].totalPrice += record.totalPrice;
    } else {
        // 如果不存在，添加到购物车
        cartItems.value.push({
            bookIsbn: record.bookIsbn,
            bookName: record.bookName,
            price: record.bookPrice,
            quantity: record.purchaseQuantity,
            totalPrice: record.totalPrice
        });
    }
    message.success(`已将《${record.bookName}》${record.purchaseQuantity}本加入购物车`);
};

// 计算购物车总价
const cartTotalPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.totalPrice, 0);
});

// 结算功能
const checkout = () => {
    if (cartItems.value.length === 0) {
        message.warning("购物车为空");
        return;
    }
    // 这里可以调用实际的结算API
    message.success(`结算成功，共支付 ¥${cartTotalPrice.value}`);
    // 清空购物车
    cartItems.value = [];
};

// 初始化加载数据
fetchData();

</script>

<style scoped>
.purchase-controls {
    display: flex;
    flex-direction: row; /* 改为行布局实现横向排列 */
    align-items: center; /* 垂直方向居中对齐元素，可按需调整 */
    gap: 10px; /* 调整元素间的间距，可按需修改数值 */
}

.total-price {
    font-weight: bold;
    color: #ff4d4f;
    margin: 5px 0;
}

.cart-container {
    margin-top: 20px;
    padding: 16px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background-color: #fafafa;
}

.cart-items {
    margin-bottom: 10px;
}

.cart-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.cart-item-price {
    font-weight: bold;
}

.cart-total {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    margin-bottom: 16px;
}

.cart-total-price {
    color: #ff4d4f;
}
</style>
