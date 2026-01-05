<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';
import Skeleton from 'primevue/skeleton'; // <--- Added Import

const toast = useToast();
const loading = ref(true);
const userDialog = ref(false);
const deleteUserDialog = ref(false);
const userForm = ref({});
const selectedUser = ref(null);
const submitted = ref(false);

// --- Mock Data ---
const users = ref([
    { id: 101, name: 'Alex Nexus', email: 'alex@devnexus.com', role: 'Student', status: 'ACTIVE', avatar: 'pi-user' },
    { id: 102, name: 'Sarah Tech', email: 'sarah@university.edu', role: 'Instructor', status: 'PENDING', avatar: 'pi-briefcase' },
    { id: 103, name: 'Jordan Byte', email: 'jordan@devnexus.com', role: 'Student', status: 'BANNED', avatar: 'pi-user' },
    { id: 104, name: 'Kim Cloud', email: 'kim@aws-partner.com', role: 'Admin', status: 'ACTIVE', avatar: 'pi-shield' },
    { id: 105, name: 'Chris System', email: 'chris@sysadmin.net', role: 'Admin', status: 'ACTIVE', avatar: 'pi-cog' }
]);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: { value: null, matchMode: FilterMatchMode.EQUALS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const roleOptions = ['Student', 'Instructor', 'Admin'];
const statusOptions = ['ACTIVE', 'PENDING', 'BANNED'];

onMounted(() => {
    // Simulate network delay
    loading.value = true;
    setTimeout(() => { loading.value = false; }, 1500); // Increased slightly to show effect
});

// --- Actions ---
const openNew = () => {
    userForm.value = { status: 'ACTIVE', role: 'Student' };
    submitted.value = false;
    userDialog.value = true;
};

const editUser = (user) => {
    userForm.value = { ...user };
    userDialog.value = true;
};

const confirmDeleteUser = (user) => {
    selectedUser.value = user;
    deleteUserDialog.value = true;
};

const deleteUser = () => {
    users.value = users.value.filter(val => val.id !== selectedUser.value.id);
    deleteUserDialog.value = false;
    selectedUser.value = null;
    toast.add({ severity: 'success', summary: 'Node Removed', detail: 'User deleted from registry', life: 3000 });
};

const saveUser = () => {
    submitted.value = true;

    if (userForm.value.name?.trim()) {
        if (userForm.value.id) {
            const index = users.value.findIndex(u => u.id === userForm.value.id);
            users.value[index] = userForm.value;
            toast.add({ severity: 'success', summary: 'Record Updated', detail: 'User parameters modified', life: 3000 });
        } else {
            users.value.push({
                ...userForm.value,
                id: Math.floor(Math.random() * 1000),
                avatar: 'pi-user' // Default
            });
            toast.add({ severity: 'success', summary: 'New Node', detail: 'User initialized in registry', life: 3000 });
        }
        userDialog.value = false;
        userForm.value = {};
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'ACTIVE': return 'success';
        case 'PENDING': return 'warn';
        case 'BANNED': return 'danger';
        default: return 'info';
    }
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#7bc5cd] rounded-full blur-[120px] opacity-15 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4">

            <div class="col-span-12 flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                        <i class="pi pi-users text-xs text-[#2c4c52]"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">DATABASE_REGISTRY_V1</span>
                    </div>
                    <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">User Directory</h2>
                </div>

                <div class="flex gap-3">
                    <Button label="EXPORT DATA" icon="pi pi-download" class="y2k-button-secondary !hidden md:!flex" />
                    <Button label="INITIALIZE USER" icon="pi pi-plus" class="y2k-button-primary" @click="openNew" />
                </div>
            </div>

            <div v-if="loading" class="col-span-12">
                <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm overflow-hidden">

                    <div class="flex flex-col md:flex-row gap-4 justify-between mb-8">
                        <Skeleton width="16rem" height="2.5rem" borderRadius="8px"></Skeleton>
                        <div class="flex gap-2">
                            <Skeleton width="8rem" height="2.5rem" borderRadius="8px"></Skeleton>
                            <Skeleton width="8rem" height="2.5rem" borderRadius="8px"></Skeleton>
                        </div>
                    </div>

                    <div class="flex justify-between items-center mb-6 pb-4 border-b border-[#2c4c52]/10 px-4">
                        <Skeleton width="25%" height="0.8rem"></Skeleton>
                        <Skeleton width="20%" height="0.8rem"></Skeleton>
                        <Skeleton width="15%" height="0.8rem"></Skeleton>
                        <Skeleton width="15%" height="0.8rem"></Skeleton>
                        <Skeleton width="10%" height="0.8rem"></Skeleton>
                    </div>

                    <div class="space-y-6 px-4">
                        <div v-for="n in 5" :key="n" class="flex justify-between items-center">
                            <div class="flex items-center gap-3 w-[25%]">
                                <Skeleton shape="circle" size="2.5rem"></Skeleton>
                                <div class="w-full">
                                    <Skeleton width="70%" height="0.9rem" class="mb-2"></Skeleton>
                                    <Skeleton width="40%" height="0.6rem"></Skeleton>
                                </div>
                            </div>
                            <Skeleton width="20%" height="0.8rem"></Skeleton>
                            <Skeleton width="15%" height="1.8rem" borderRadius="4px"></Skeleton>
                            <Skeleton width="15%" height="1.5rem" borderRadius="12px"></Skeleton>
                            <div class="flex gap-2 w-[10%] justify-center">
                                <Skeleton shape="circle" size="2rem"></Skeleton>
                                <Skeleton shape="circle" size="2rem"></Skeleton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="col-span-12">
                <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm overflow-hidden">

                    <DataTable :value="users" v-model:filters="filters"
                        :globalFilterFields="['name', 'email', 'role']"
                        class="y2k-table" responsiveLayout="scroll" :rows="10" :paginator="true"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[10, 20, 50]"
                        currentPageReportTemplate="Displaying {first} to {last} of {totalRecords} nodes">

                        <template #header>
                            <div class="flex flex-col md:flex-row gap-4 justify-between mb-4">
                                <div class="flex gap-2 items-center">
                                    <IconField>
                                        <InputIcon>
                                            <i class="pi pi-search text-[#2c4c52]/50" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" placeholder="SEARCH DATABASE..." class="y2k-input !py-2 !text-xs !pl-8 !w-64" />
                                    </IconField>
                                </div>

                                <div class="flex gap-2">
                                     <Select v-model="filters['role'].value" :options="roleOptions" placeholder="ALL ROLES"
                                            class="y2k-dropdown !text-xs !w-32" showClear />
                                     <Select v-model="filters['status'].value" :options="statusOptions" placeholder="ALL STATUS"
                                            class="y2k-dropdown !text-xs !w-32" showClear />
                                </div>
                            </div>
                        </template>

                        <Column field="name" header="IDENTITY_MATRIX" sortable>
                            <template #body="slotProps">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#2c4c52]/10 flex items-center justify-center border border-[#2c4c52]/10">
                                        <i :class="['pi text-[#2c4c52] text-lg', slotProps.data.avatar]"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-[#2c4c52] text-sm">{{ slotProps.data.name }}</span>
                                        <span class="font-mono text-[10px] text-[#4a7a82] tracking-tight">ID: {{ slotProps.data.id }}</span>
                                    </div>
                                </div>
                            </template>
                        </Column>

                        <Column field="email" header="UPLINK_ADDRESS" sortable>
                            <template #body="slotProps">
                                <span class="font-mono text-xs text-[#2c4c52]/80 font-medium">{{ slotProps.data.email }}</span>
                            </template>
                        </Column>

                        <Column field="role" header="ACCESS_LEVEL" sortable>
                            <template #body="slotProps">
                                <span class="font-black text-xs uppercase tracking-wide px-2 py-1 rounded border"
                                      :class="slotProps.data.role === 'Admin' ? 'bg-[#2c4c52] text-[#7bc5cd] border-[#2c4c52]' : 'bg-white text-[#2c4c52] border-[#2c4c52]/20'">
                                    {{ slotProps.data.role }}
                                </span>
                            </template>
                        </Column>

                        <Column field="status" header="NODE_STATUS" sortable>
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)"
                                     class="!font-mono !text-[10px] !font-bold" />
                            </template>
                        </Column>

                        <Column header="OPERATIONS" headerStyle="width: 8rem; text-align: center" bodyStyle="text-align: center">
                            <template #body="slotProps">
                                <div class="flex gap-1 justify-center">
                                    <Button icon="pi pi-pencil" text rounded class="!text-[#2c4c52] !w-8 !h-8 hover:bg-[#2c4c52]/10"
                                            @click="editUser(slotProps.data)" />
                                    <Button icon="pi pi-trash" text rounded class="!text-red-500 !w-8 !h-8 hover:bg-red-50"
                                            @click="confirmDeleteUser(slotProps.data)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="userDialog" modal :style="{ width: '450px' }" class="y2k-dialog">
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-id-card text-[#2c4c52]"></i>
                    <span class="font-black text-[#2c4c52] uppercase text-lg">System Entry</span>
                </div>
            </template>

            <div class="flex flex-col gap-4 py-2">
                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Full Name</label>
                    <InputText v-model="userForm.name" required autofocus class="w-full y2k-input" />
                    <small class="text-red-500 font-mono text-[10px]" v-if="submitted && !userForm.name">Name is required.</small>
                </div>

                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Email Address</label>
                    <InputText v-model="userForm.email" required class="w-full y2k-input" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Access Role</label>
                        <Select v-model="userForm.role" :options="roleOptions" placeholder="Select Role" class="w-full y2k-dropdown" />
                    </div>
                    <div class="space-y-1">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">System Status</label>
                        <Select v-model="userForm.status" :options="statusOptions" placeholder="Select Status" class="w-full y2k-dropdown" />
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex gap-2 justify-end pt-4 border-t border-[#2c4c52]/10">
                    <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold !text-xs" @click="userDialog = false" />
                    <Button label="SAVE ENTRY" class="y2k-button-primary !text-xs !py-2" @click="saveUser" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Confirm Termination" modal class="y2k-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-amber-500 text-3xl" />
                <span class="text-[#2c4c52] text-sm font-medium">Are you sure you want to remove <b class="text-[#7bc5cd]">{{ selectedUser?.name }}</b> from the registry?</span>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-4">
                    <Button label="ABORT" text class="!text-[#2c4c52] !font-bold !text-xs" @click="deleteUserDialog = false" />
                    <Button label="CONFIRM DELETION" severity="danger" class="!font-bold !text-xs" @click="deleteUser" />
                </div>
            </template>
        </Dialog>

    </div>
</template>

<style scoped>
/* Y2K Utilities (Consistent with Theme) */
.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 4px 15px rgba(44, 76, 82, 0.3);
}
.y2k-button-primary:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

.y2k-button-secondary {
    background: transparent !important;
    border: 2px solid rgba(44, 76, 82, 0.1) !important;
    color: #2c4c52 !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    font-size: 0.75rem !important;
}

.y2k-input {
    background: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(44, 76, 82, 0.15) !important;
    border-radius: 8px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
}

:deep(.y2k-dropdown) {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 1px solid rgba(44, 76, 82, 0.15) !important;
    border-radius: 8px !important;
}

/* DataTable Customization */
:deep(.y2k-table .p-datatable-header) {
    background: transparent;
    border: none;
    padding: 0 0 1rem 0;
}
:deep(.y2k-table .p-datatable-thead > tr > th) {
    background: transparent;
    font-family: monospace;
    font-size: 0.7rem;
    font-weight: 900;
    color: #4a7a82;
    border-bottom: 2px solid rgba(44, 76, 82, 0.1);
    padding: 1rem;
}
:deep(.y2k-table .p-datatable-tbody > tr) {
    background: transparent;
    transition: background-color 0.2s;
}
:deep(.y2k-table .p-datatable-tbody > tr:hover) {
    background: rgba(44, 76, 82, 0.02);
}
:deep(.y2k-table .p-datatable-tbody > tr > td) {
    border-bottom: 1px solid rgba(44, 76, 82, 0.05);
    padding: 1rem;
}

/* Paginator */
:deep(.p-paginator) {
    background: transparent !important;
    border: none !important;
    margin-top: 1rem;
    font-family: monospace;
}
:deep(.p-paginator-page.p-highlight) {
    background: #2c4c52 !important;
    color: #7bc5cd !important;
    border-radius: 50%;
}

/* Dialogs */
:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer) {
    background: #fdfdfd !important;
    color: #2c4c52;
}
</style>
