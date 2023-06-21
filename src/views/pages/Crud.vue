<script setup >
import { FilterMatchMode } from 'primevue/api';
import { ref, reactive, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FgoAccountService } from '@/service/FgoAccountService';
const toast = useToast();

const products = ref(null);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const fgo_account = ref({});
const selectedProducts = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const statuses = ref([
    { label: '未登录', value: 'init' },
    { label: '正在运行', value: 'running' },
    { label: '已完成', value: 'finished' },
    { label: '异常终止', value: 'error' }
]);

const fgoAccountService = new FgoAccountService();
const pageConfig = reactive({
    first: 0,
    size: 10,
    total: 0
})
const loading = ref(false);
onBeforeMount(() => {
    initFilters();
});
onMounted(async () => {
    await onPage();
});
async function onPage() {
    loading.value = true;
    const data = await fgoAccountService.getFgoAccounts({
        rows: pageConfig.size,
        page: pageConfig.first / pageConfig.size + 1
    })
    loading.value = false;
    products.value = data.data
    pageConfig.total = data.total
}

async function onFileSelect(e) {
    loading.value = true;
    const file = e.files[0];
    const reader = new FileReader();
    let blob = await new Promise((resolve) => {
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.readAsText(file);
        loading.value = false;
    });
    // 卡号：e6ixr60s4密码：Y9gOK2
    // 卡号：nj4fnkjs密码：219223
    // 卡号：e914j3o4密码：346328

    const regexp = /卡号：(.*)密码：(.*)/;
    const data = blob.split('\n').map((item) => {
        const result = regexp.exec(item);
        if (result) {
            return {
                account: result[1],
                password: result[2]
            };
        }
    });
    fgoAccountService.importFgoAccount(data)

}
const openNew = () => {
    fgo_account.value = {};
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

const saveProduct = () => {
    submitted.value = true;
    if (fgo_account.value.name && fgo_account.value.name.trim() && fgo_account.value.price) {
        if (fgo_account.value.id) {
            fgo_account.value.inventoryStatus = fgo_account.value.inventoryStatus.value ? fgo_account.value.inventoryStatus.value : fgo_account.value.inventoryStatus;
            products.value[findIndexById(fgo_account.value.id)] = fgo_account.value;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        } else {
            fgo_account.value.id = createId();
            fgo_account.value.code = createId();
            fgo_account.value.image = 'product-placeholder.svg';
            fgo_account.value.inventoryStatus = fgo_account.value.inventoryStatus ? fgo_account.value.inventoryStatus.value : 'INSTOCK';
            products.value.push(fgo_account.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        }
        productDialog.value = false;
        fgo_account.value = {};
    }
};

const editProduct = (editProduct) => {
    fgo_account.value = { ...editProduct };
    productDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
    fgo_account.value = editProduct;
    deleteProductDialog.value = true;
};

const deleteProduct = () => {
    products.value = products.value.filter((val) => val.id !== fgo_account.value.id);
    deleteProductDialog.value = false;
    fgo_account.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const createId = () => {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="新建" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="刷新" icon="pi pi-refresh" class="p-button-success mr-2" @click="() => onPage({
                                rows: pageConfig.size,
                                page: pageConfig.page - 1
                            })" />

                        </div>
                    </template>
                    <template v-slot:end>
                        <Button label="设置" icon="pi pi-cog" class="p-button-success mr-2" @click="openNew" />
                        <FileUpload mode="basic" accept=".txt" :maxFileSize="1000000" label="导入" chooseLabel="导入"
                            class="mr-2 inline-block" customUpload @select="onFileSelect" />
                        <Button label="导出" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="products" dataKey="id" @page="onPage" :loading="loading"
                    responsiveLayout="scroll">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">FGO 账号管理</h5>
                            <Paginator @page="onPage" :rows="pageConfig.size" v-model:first="pageConfig.first"
                                :totalRecords="pageConfig.total"
                                template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                                currentPageReportTemplate="第 {first} ~ {last} (共 {totalRecords} 条)" />
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="搜索" />
                            </span>
                        </div>
                    </template>

                    <Column field="account" header="账号" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.account }}
                        </template>
                    </Column>
                    <Column field="status" header="状态" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span
                                :class="'fgo-badge status-' + (slotProps.data.status ? slotProps.data.status.toLowerCase() : '')">{{
                                    slotProps.data.status }}</span>
                        </template>
                    </Column>
                    <Column header="从者" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="'https://static.atlasacademy.io/JP/Faces/f_8001000_bordered.png'"
                                :alt="slotProps.data.image" class="shadow-2" width="50" />
                            <img :src="'https://static.atlasacademy.io/JP/Faces/f_1001000_bordered.png'"
                                :alt="slotProps.data.image" class="shadow-2" width="50" />
                            <img :src="'https://static.atlasacademy.io/JP/Faces/f_1002000_bordered.png'"
                                :alt="slotProps.data.image" class="shadow-2" width="50" />
                            <img :src="'https://static.atlasacademy.io/JP/Faces/f_1003000_bordered.png'"
                                :alt="slotProps.data.image" class="shadow-2" width="50" />
                        </template>
                    </Column>
                    <Column field="price" header="材料" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span v-for="i in slotProps.data.parsed_data['items']">
                                <Avatar :image="`https://static.atlasacademy.io/JP/Items/${i['itemId']}.png`" class="mr-2"
                                    size="large" v-badge="i['num']" />
                            </span>
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button label="编辑" text size="small" @click="editProduct(slotProps.data)" />
                            <Button label="删除" severity="danger" text size="small"
                                @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>


                <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="账号详情" :modal="true"
                    class="p-fluid">
                    <div class="field">
                        <label for="account">账号</label>
                        <InputText id="account" v-model.trim="fgo_account.account" required="true" autofocus
                            :class="{ 'p-invalid': submitted && !fgo_account.account }" />
                        <small class="p-invalid" v-if="submitted && !fgo_account.account">必须输入账号</small>
                    </div>
                    <div class="field">
                        <label for="password">密码</label>
                        <InputText id="password" v-model.trim="fgo_account.password" required="true"
                            :class="{ 'p-invalid': submitted && !fgo_account.password }" />
                        <small class="p-invalid" v-if="submitted && !fgo_account.password">必须输入密码</small>
                    </div>
                    <div class="field">
                        <label for="inventoryStatus" class="mb-3">状态</label>
                        <Dropdown id="inventoryStatus" v-model="fgo_account.status" :options="statuses" optionLabel="label"
                            placeholder="选择状态">
                            <template #value="slotProps">
                                <div v-if="slotProps.value && slotProps.value.value">
                                    <span :class="'fgo-badge status-' + slotProps.value.value">{{ slotProps.value.label
                                    }}</span>
                                </div>
                                <div v-else-if="slotProps.value && !slotProps.value.value">
                                    <span :class="'fgo-badge status-' + slotProps.value.toLowerCase()">{{
                                        slotProps.value }}</span>
                                </div>
                                <span v-else>
                                    {{ slotProps.placeholder }}
                                </span>
                            </template>
                        </Dropdown>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="fgo_account">Are you sure you want to delete <b>{{ fgo_account.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="fgo_account">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
