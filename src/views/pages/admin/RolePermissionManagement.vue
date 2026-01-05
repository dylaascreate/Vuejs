<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';

const toast = useToast();
const op = ref(); // OverlayPanel Reference

// --- Mock Data ---
const roles = ref([
    { name: 'Admin', code: 'ADM', permissions: ['FULL_SYSTEM_ACCESS', 'USER_MANAGEMENT', 'ROADMAP_EDIT'], users: 3 },
    { name: 'Instructor', code: 'INST', permissions: ['COURSE_MANAGEMENT', 'ROADMAP_VIEW', 'STUDENT_ANALYSIS'], users: 12 },
    { name: 'Student', code: 'STUD', permissions: ['ROADMAP_GENERATE', 'COURSE_VIEW', 'PORTFOLIO_BUILD'], users: 1520 }
]);

const userRoles = ref([
    { id: 1001, name: 'Alice Johnson', email: 'alice@university.edu', currentRole: 'Student' },
    { id: 1002, name: 'Bob Smith', email: 'bob@devnexus.com', currentRole: 'Instructor' },
    { id: 1003, name: 'Charlie Admin', email: 'admin@devnexus.com', currentRole: 'Admin' },
    { id: 1004, name: 'David Lee', email: 'david@student.com', currentRole: 'Student' },
    { id: 1005, name: 'Eva Green', email: 'eva@university.edu', currentRole: 'Student' }
]);

// Mock Audit Logs
const auditLogs = ref([
    { date: '2025-03-10 14:30', action: 'ROLE_CHANGE', detail: 'Changed from Student to Instructor', admin: 'Charlie Admin' },
    { date: '2025-03-08 09:15', action: 'PERMISSION_GRANT', detail: 'Granted ROADMAP_EDIT access', admin: 'System' },
    { date: '2025-02-20 11:00', action: 'ACCOUNT_CREATED', detail: 'User registered via email', admin: 'Self' }
]);

const availablePermissions = ref([
    'FULL_SYSTEM_ACCESS', 'USER_MANAGEMENT', 'ROADMAP_EDIT', 'ROADMAP_VIEW',
    'ROADMAP_GENERATE', 'COURSE_MANAGEMENT', 'COURSE_VIEW',
    'STUDENT_ANALYSIS', 'PORTFOLIO_BUILD', 'SYSTEM_OVERRIDE'
]);

const roleOptions = ref(['Admin', 'Instructor', 'Student']);

// --- State ---
const permissionDialog = ref(false);
const roleEditorDialog = ref(false);
const selectedRole = ref({});
const selectedUser = ref({}); // For Logs
const roleForm = ref({ name: '', code: '', permissions: [] });
const isEditing = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    currentRole: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// --- Actions ---

// 1. Logs Overlay Toggle
const toggleLogs = (event, user) => {
    selectedUser.value = user;
    op.value.toggle(event);
};

// 2. View Permissions
const openPermissions = (role) => {
    selectedRole.value = { ...role };
    permissionDialog.value = true;
};

// 3. Open Editor (Create New)
const openNewRoleDialog = () => {
    isEditing.value = false;
    roleForm.value = { name: '', code: '', permissions: [] };
    roleEditorDialog.value = true;
};

// 4. Open Editor (Edit Existing)
const openEditRoleDialog = () => {
    isEditing.value = true;
    roleForm.value = {
        name: selectedRole.value.name,
        code: selectedRole.value.code,
        permissions: [...selectedRole.value.permissions]
    };
    permissionDialog.value = false;
    roleEditorDialog.value = true;
};

const saveRole = () => {
    if (isEditing.value) {
        const index = roles.value.findIndex(r => r.code === roleForm.value.code);
        if (index !== -1) {
            roles.value[index] = { ...roles.value[index], ...roleForm.value };
            toast.add({ severity: 'success', summary: 'Protocols Updated', detail: 'Role capabilities modified', life: 3000 });
        }
    } else {
        roles.value.push({
            ...roleForm.value,
            users: 0,
            code: roleForm.value.code.toUpperCase()
        });
        roleOptions.value.push(roleForm.value.name);
        toast.add({ severity: 'success', summary: 'System Expanded', detail: 'New Role Definition Created', life: 3000 });
    }
    roleEditorDialog.value = false;
};

const updateRoleAssignment = (user) => {
    toast.add({ severity: 'success', summary: 'Access Updated', detail: `${user.name} reassigned to ${user.currentRole}`, life: 3000 });
};

const getSeverity = (perm) => {
    return perm.includes('FULL') ? 'danger' : 'secondary';
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">
        <div class="absolute inset-0 z-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4">

            <div class="col-span-12 mb-2">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                    <i class="pi pi-shield text-xs"></i>
                    <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">SECURITY_PROTOCOL_V1</span>
                </div>
                <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">Access Control</h2>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm h-full flex flex-col gap-4">
                    <h4 class="font-black text-xl text-[#2c4c52] uppercase mb-2">Defined Roles</h4>

                    <div v-for="role in roles" :key="role.code"
                         class="p-4 bg-white/60 border border-white rounded-2xl hover:border-[#7bc5cd] transition-all cursor-pointer group"
                         @click="openPermissions(role)">
                        <div class="flex justify-between items-start mb-3">
                            <span class="font-black text-lg group-hover:text-[#7bc5cd] transition-colors uppercase">{{ role.name }}</span>
                            <span class="font-mono text-[10px] bg-[#2c4c52] text-[#7bc5cd] px-2 py-1 rounded">{{ role.code }}</span>
                        </div>
                        <div class="flex flex-wrap gap-1 mb-3">
                            <Tag v-for="p in role.permissions.slice(0, 2)" :key="p" :value="p" :severity="getSeverity(p)" class="!text-[9px] !bg-[#2c4c52]/5" />
                            <Tag v-if="role.permissions.length > 2" :value="`+${role.permissions.length - 2} MORE`" severity="secondary" class="!text-[9px]" />
                        </div>
                        <div class="text-xs font-bold text-[#4a7a82]">ASSIGNED_USERS: {{ role.users }}</div>
                    </div>

                    <Button label="DEFINE NEW ROLE" icon="pi pi-plus" class="y2k-button-secondary !mt-auto" @click="openNewRoleDialog" />
                </div>
            </div>

            <div class="col-span-12 lg:col-span-8">
                <div class="card p-0 overflow-hidden shadow-sm bg-white/40 border border-white/60">

                    <DataTable :value="userRoles" v-model:filters="filters" dataKey="id"
                               :globalFilterFields="['name', 'email']"
                               class="y2k-table" responsiveLayout="scroll">

                        <template #header>
                            <div class="p-6 pb-4">
                                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h4 class="font-black text-xl text-[#2c4c52] uppercase">User Permissions Mapping</h4>
                                        <p class="text-xs font-mono text-[#4a7a82] uppercase">Monitor and reassign system access levels</p>
                                    </div>

                                    <div class="flex gap-2">
                                        <Select v-model="filters['currentRole'].value" :options="roleOptions" placeholder="Filter Role"
                                                class="y2k-dropdown !w-40 !text-xs" :showClear="true" />

                                        <IconField>
                                            <InputIcon>
                                                <i class="pi pi-search" />
                                            </InputIcon>
                                            <InputText v-model="filters['global'].value" placeholder="Search User" class="y2k-input !py-2 !text-xs" />
                                        </IconField>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <Column field="name" header="USER_IDENTITY" sortable class="font-bold"></Column>
                        <Column field="email" header="ADDRESS" class="text-sm text-[#4a7a82] font-mono"></Column>

                        <Column field="currentRole" header="ACTIVE_ROLE" style="min-width: 12rem">
                            <template #body="slotProps">
                                <Select v-model="slotProps.data.currentRole" :options="roleOptions"
                                        class="w-full y2k-dropdown !text-xs !font-bold"
                                        @change="updateRoleAssignment(slotProps.data)" />
                            </template>
                        </Column>

                        <Column header="ACTIONS" headerStyle="width: 5rem">
                            <template #body="slotProps">
                                <Button icon="pi pi-history" text rounded severity="secondary"
                                        v-tooltip.top="'View Audit Log'"
                                        @click="toggleLogs($event, slotProps.data)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>

        <OverlayPanel ref="op" :showCloseIcon="true" class="y2k-overlay !w-96">
            <div class="flex items-center gap-2 mb-4 pb-2 border-b border-[#2c4c52]/10">
                <i class="pi pi-history text-[#2c4c52]"></i>
                <div>
                    <span class="font-black text-[#2c4c52] uppercase block text-sm">Audit Log</span>
                    <span class="text-xs text-[#4a7a82]">{{ selectedUser.name }}</span>
                </div>
            </div>

            <div class="flex flex-col gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                <div v-for="(log, index) in auditLogs" :key="index" class="relative pl-4 border-l-2 border-[#7bc5cd]/30 pb-2">
                    <div class="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-[#7bc5cd]"></div>
                    <div class="text-[10px] font-mono text-[#4a7a82] mb-1">{{ log.date }}</div>
                    <div class="font-bold text-xs text-[#2c4c52]">{{ log.action }}</div>
                    <div class="text-xs text-[#2c4c52]/80 leading-tight mb-1">{{ log.detail }}</div>
                    <div class="text-[10px] bg-[#2c4c52]/5 text-[#2c4c52] px-1 rounded w-fit">By: {{ log.admin }}</div>
                </div>
            </div>
        </OverlayPanel>

        <Dialog v-model:visible="permissionDialog" modal :header="`${selectedRole.name} Permissions`" :style="{ width: '30vw' }" class="y2k-dialog">
            <div class="space-y-4 py-4">
                <div v-for="perm in selectedRole.permissions" :key="perm" class="flex items-center gap-3 p-3 bg-[#2c4c52]/5 border border-white rounded-xl">
                    <i class="pi pi-check-circle text-green-500"></i>
                    <span class="font-mono text-xs font-bold uppercase">{{ perm }}</span>
                </div>
            </div>
            <template #footer>
                <Button label="EDIT_CAPABILITIES" class="y2k-button-primary !text-xs" @click="openEditRoleDialog" />
            </template>
        </Dialog>

        <Dialog v-model:visible="roleEditorDialog" modal :header="isEditing ? 'Modify Role Capabilities' : 'Define New Role'" :style="{ width: '500px' }" class="y2k-dialog">
            <div class="flex flex-col gap-4 py-2">
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Role Name</label>
                        <InputText v-model="roleForm.name" placeholder="e.g. Moderator" class="w-full y2k-input" />
                    </div>
                    <div class="space-y-1">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Role Code</label>
                        <InputText v-model="roleForm.code" placeholder="MOD" class="w-full y2k-input" :disabled="isEditing" />
                    </div>
                </div>

                <div class="border-t border-[#2c4c52]/10 pt-3">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase mb-3 block">System Capabilities</label>
                    <div class="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        <div v-for="perm in availablePermissions" :key="perm"
                             class="flex items-center gap-2 p-2 rounded-lg hover:bg-[#2c4c52]/5 transition-colors cursor-pointer"
                             @click="roleForm.permissions.includes(perm)
                                ? roleForm.permissions = roleForm.permissions.filter(p => p !== perm)
                                : roleForm.permissions.push(perm)">

                            <Checkbox :modelValue="roleForm.permissions" :value="perm" :inputId="perm" class="pointer-events-none" />
                            <label :for="perm" class="text-sm font-medium cursor-pointer flex-1 pointer-events-none">{{ perm }}</label>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-2">
                    <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold !text-xs" @click="roleEditorDialog = false" />
                    <Button :label="isEditing ? 'SAVE CHANGES' : 'CREATE ROLE'" class="y2k-button-primary !text-xs" @click="saveRole" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
/* Y2K & Component Styles */
.y2k-button-secondary {
    background: transparent !important;
    border: 2px solid #2c4c52 !important;
    color: #2c4c52 !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
}
.y2k-button-secondary:hover {
    background: #2c4c52 !important;
    color: #7bc5cd !important;
}

.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 10px 20px -5px rgba(44, 76, 82, 0.4);
    transition: all 0.3s ease;
}
.y2k-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -5px rgba(44, 76, 82, 0.5);
    filter: brightness(1.1);
}

.y2k-input {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 1px solid rgba(44, 76, 82, 0.2) !important;
    border-radius: 8px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
}

:deep(.y2k-table .p-datatable-thead > tr > th) {
    background: transparent;
    font-family: monospace;
    font-size: 0.7rem;
    font-weight: 900;
    color: #4a7a82;
    border-bottom: 2px solid rgba(44, 76, 82, 0.1);
}

:deep(.y2k-dropdown) {
    background: rgba(255, 255, 255, 0.5) !important;
    border: none !important;
    border-radius: 8px !important;
}

/* Dialog & Overlay Styles */
:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer),
:deep(.y2k-overlay .p-overlaypanel-content) {
    background: #f0fdfc !important;
    border-color: #2c4c52 !important;
    color: #2c4c52;
}
:deep(.y2k-dialog .p-dialog-title) {
    font-weight: 900;
    text-transform: uppercase;
}
:deep(.y2k-overlay) {
    border: 2px solid #7bc5cd !important;
    border-radius: 12px;
    box-shadow: 0 10px 30px -5px rgba(44,76,82,0.2) !important;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(44, 76, 82, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(44, 76, 82, 0.2);
    border-radius: 10px;
}
</style>
