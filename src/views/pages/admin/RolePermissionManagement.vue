<script setup>
import { ref } from 'vue';
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
    { id: 1001, name: 'Alice Johnson', email: 'alice@university.edu', currentRole: 'Student', avatar: 'pi-user' },
    { id: 1002, name: 'Bob Smith', email: 'bob@devnexus.com', currentRole: 'Instructor', avatar: 'pi-briefcase' },
    { id: 1003, name: 'Charlie Admin', email: 'admin@devnexus.com', currentRole: 'Admin', avatar: 'pi-shield' },
    { id: 1004, name: 'David Lee', email: 'david@student.com', currentRole: 'Student', avatar: 'pi-user' },
    { id: 1005, name: 'Eva Green', email: 'eva@university.edu', currentRole: 'Student', avatar: 'pi-user' }
]);

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
const selectedUser = ref({});
const roleForm = ref({ name: '', code: '', permissions: [] });
const isEditing = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    currentRole: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// --- Actions ---
const toggleLogs = (event, user) => {
    selectedUser.value = user;
    op.value.toggle(event);
};

const openPermissions = (role) => {
    selectedRole.value = { ...role };
    permissionDialog.value = true;
};

const openNewRoleDialog = () => {
    isEditing.value = false;
    roleForm.value = { name: '', code: '', permissions: [] };
    roleEditorDialog.value = true;
};

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
    return perm.includes('FULL') || perm.includes('EDIT') ? 'danger' : 'secondary';
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#7bc5cd] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4 max-w-[1600px] mx-auto">

            <div class="col-span-12 mb-2">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                    <i class="pi pi-shield text-xs text-[#2c4c52]"></i>
                    <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">SECURITY_PROTOCOL_V1</span>
                </div>
                <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">Access Control</h2>
            </div>

            <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm h-full flex flex-col gap-4 relative overflow-hidden">
                    <div class="absolute -right-10 -top-10 w-32 h-32 bg-[#7bc5cd]/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div class="flex justify-between items-end mb-2">
                         <h4 class="font-black text-xl text-[#2c4c52] uppercase relative z-10">Defined Roles</h4>
                         <span class="font-mono text-xs font-bold text-[#4a7a82] uppercase">{{ roles.length }} Active</span>
                    </div>

                    <div class="flex flex-col gap-3 relative z-10">
                        <div v-for="role in roles" :key="role.code"
                             class="p-5 bg-white/60 border border-white rounded-2xl hover:border-[#7bc5cd] hover:shadow-[0_4px_20px_-5px_rgba(123,197,205,0.4)] transition-all cursor-pointer group flex flex-col gap-3"
                             @click="openPermissions(role)">

                            <div class="flex justify-between items-start">
                                <div>
                                    <span class="block font-black text-lg text-[#2c4c52] group-hover:text-[#7bc5cd] transition-colors uppercase leading-none mb-1">{{ role.name }}</span>
                                    <span class="font-mono text-[10px] text-[#4a7a82] uppercase font-bold tracking-wider">CODE: {{ role.code }}</span>
                                </div>
                                <div class="w-8 h-8 rounded-full bg-[#2c4c52]/5 flex items-center justify-center group-hover:bg-[#2c4c52] transition-colors">
                                    <i class="pi pi-cog text-[#2c4c52] text-xs group-hover:text-[#7bc5cd]"></i>
                                </div>
                            </div>

                            <div class="h-px w-full bg-[#2c4c52]/10"></div>

                            <div class="flex flex-wrap gap-1">
                                <span v-for="p in role.permissions.slice(0, 3)" :key="p"
                                      class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#2c4c52]/5 text-[#2c4c52] border border-[#2c4c52]/10">
                                    {{ p.split('_')[0] }}
                                </span>
                                <span v-if="role.permissions.length > 3" class="text-[9px] font-mono font-bold px-1.5 py-0.5 text-[#4a7a82]">
                                    +{{ role.permissions.length - 3 }}
                                </span>
                            </div>

                            <div class="flex justify-between items-center mt-1">
                                <div class="text-[10px] font-bold text-[#7bc5cd] bg-[#7bc5cd]/10 px-2 py-0.5 rounded-full uppercase">
                                    {{ role.users }} Users Assigned
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button label="DEFINE NEW ROLE" icon="pi pi-plus" class="y2k-button-secondary !mt-auto w-full" @click="openNewRoleDialog" />
                </div>
            </div>

            <div class="col-span-12 lg:col-span-8">
                <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm h-full flex flex-col">

                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h4 class="font-black text-xl text-[#2c4c52] uppercase leading-none mb-1">User Matrix</h4>
                            <p class="text-xs font-mono text-[#4a7a82] uppercase">Monitor and reassign system access levels</p>
                        </div>

                        <div class="flex gap-2">
                            <Select v-model="filters['currentRole'].value" :options="roleOptions" placeholder="Filter Role"
                                    class="y2k-dropdown !w-40 !text-xs" :showClear="true" />

                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search text-[#2c4c52]/50" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="SEARCH IDENTITY..." class="y2k-input !py-2 !text-xs !pl-8" />
                            </IconField>
                        </div>
                    </div>

                    <DataTable :value="userRoles" v-model:filters="filters" dataKey="id"
                               :globalFilterFields="['name', 'email']"
                               class="y2k-table flex-1" responsiveLayout="scroll">

                        <Column field="name" header="USER_IDENTITY" class="!py-4">
                            <template #body="{ data }">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-[#2c4c52]/10 flex items-center justify-center">
                                        <i :class="['pi text-[#2c4c52]', data.avatar]"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-[#2c4c52] text-sm">{{ data.name }}</div>
                                        <div class="text-[10px] font-mono text-[#4a7a82]">{{ data.email }}</div>
                                    </div>
                                </div>
                            </template>
                        </Column>

                        <Column field="currentRole" header="ASSIGNED_ROLE" style="min-width: 12rem">
                            <template #body="slotProps">
                                <div class="relative">
                                    <Select v-model="slotProps.data.currentRole" :options="roleOptions"
                                            class="w-full y2k-dropdown-cell !text-xs !font-bold"
                                            @change="updateRoleAssignment(slotProps.data)" />
                                </div>
                            </template>
                        </Column>

                        <Column header="AUDIT" headerStyle="width: 5rem; text-align: center" bodyStyle="text-align: center">
                            <template #body="slotProps">
                                <Button icon="pi pi-history" text rounded
                                        class="!w-8 !h-8 !text-[#2c4c52]/40 hover:!text-[#2c4c52] hover:bg-[#2c4c52]/5"
                                        v-tooltip.top="'View Logs'"
                                        @click="toggleLogs($event, slotProps.data)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>

        <OverlayPanel ref="op" :showCloseIcon="true" class="y2k-overlay !w-96 !bg-white/90 !backdrop-blur-xl">
            <div class="flex items-center gap-2 mb-4 pb-2 border-b border-[#2c4c52]/10">
                <i class="pi pi-history text-[#2c4c52]"></i>
                <div>
                    <span class="font-black text-[#2c4c52] uppercase block text-sm">Audit Log</span>
                    <span class="text-xs text-[#4a7a82] font-mono">{{ selectedUser.name }}</span>
                </div>
            </div>

            <div class="flex flex-col gap-0 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div v-for="(log, index) in auditLogs" :key="index" class="relative pl-6 pb-6 border-l border-[#2c4c52]/10 last:pb-0 last:border-0 group">
                    <div class="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#7bc5cd] group-hover:bg-[#7bc5cd] transition-colors"></div>
                    <div class="text-[9px] font-mono font-bold text-[#7bc5cd] mb-0.5 uppercase">{{ log.date }}</div>
                    <div class="font-bold text-xs text-[#2c4c52] mb-0.5">{{ log.action }}</div>
                    <div class="text-xs text-[#4a7a82] leading-tight mb-2">{{ log.detail }}</div>
                    <div class="text-[9px] bg-[#2c4c52]/5 text-[#2c4c52] px-1.5 py-0.5 rounded w-fit font-mono">BY: {{ log.admin }}</div>
                </div>
            </div>
        </OverlayPanel>

        <Dialog v-model:visible="permissionDialog" modal :header="`${selectedRole.name} Permissions`" :style="{ width: '30vw' }" :breakpoints="{ '960px': '75vw', '641px': '90vw' }" class="y2k-dialog">
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-lock text-[#2c4c52]"></i>
                    <span class="font-black text-[#2c4c52] uppercase text-lg">{{ selectedRole.name }} Capabilities</span>
                </div>
            </template>
            <div class="py-4 space-y-2">
                <div v-for="perm in selectedRole.permissions" :key="perm" class="flex items-center gap-3 p-3 bg-white border border-[#2c4c52]/10 rounded-xl">
                    <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                         <i class="pi pi-check text-[10px] text-green-600 font-bold"></i>
                    </div>
                    <span class="font-mono text-xs font-bold text-[#2c4c52] uppercase">{{ perm }}</span>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end pt-4 border-t border-[#2c4c52]/10">
                    <Button label="MODIFY CAPABILITIES" class="y2k-button-primary !text-xs !py-2" @click="openEditRoleDialog" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="roleEditorDialog" modal :style="{ width: '500px' }" class="y2k-dialog">
            <template #header>
                <span class="font-black text-[#2c4c52] uppercase text-lg">{{ isEditing ? 'Edit Configuration' : 'New Role Definition' }}</span>
            </template>

            <div class="flex flex-col gap-6 py-2">
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Role Name</label>
                        <InputText v-model="roleForm.name" placeholder="e.g. Moderator" class="w-full y2k-input" />
                    </div>
                    <div class="space-y-1">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Role Code</label>
                        <InputText v-model="roleForm.code" placeholder="MOD" class="w-full y2k-input !uppercase" :disabled="isEditing" />
                    </div>
                </div>

                <div class="bg-[#2c4c52]/5 p-4 rounded-xl border border-[#2c4c52]/10">
                    <label class="font-mono text-[10px] font-bold text-[#2c4c52] uppercase mb-3 block border-b border-[#2c4c52]/10 pb-2">System Permissions</label>
                    <div class="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        <div v-for="perm in availablePermissions" :key="perm"
                             class="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer group"
                             @click="roleForm.permissions.includes(perm)
                                ? roleForm.permissions = roleForm.permissions.filter(p => p !== perm)
                                : roleForm.permissions.push(perm)">

                            <div class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                                 :class="roleForm.permissions.includes(perm) ? 'bg-[#2c4c52] border-[#2c4c52]' : 'bg-white border-[#2c4c52]/30'">
                                <i v-if="roleForm.permissions.includes(perm)" class="pi pi-check text-[8px] text-[#7bc5cd] font-bold"></i>
                            </div>
                            <span class="text-xs font-bold text-[#2c4c52] font-mono uppercase transition-opacity"
                                  :class="roleForm.permissions.includes(perm) ? 'opacity-100' : 'opacity-60'">{{ perm }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex gap-2 justify-end pt-4 border-t border-[#2c4c52]/10">
                    <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold !text-xs" @click="roleEditorDialog = false" />
                    <Button :label="isEditing ? 'SAVE CHANGES' : 'CREATE ROLE'" class="y2k-button-primary !text-xs !py-2" @click="saveRole" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
/* Y2K Button Variants */
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
    border: 2px dashed rgba(44, 76, 82, 0.2) !important;
    color: #2c4c52 !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    font-size: 0.75rem !important;
}
.y2k-button-secondary:hover {
    border-color: #2c4c52 !important;
    background: rgba(44, 76, 82, 0.05) !important;
}

/* Inputs & Dropdowns */
.y2k-input {
    background: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(44, 76, 82, 0.15) !important;
    border-radius: 8px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
}
.y2k-input:focus {
    border-color: #7bc5cd !important;
    box-shadow: 0 0 0 2px rgba(123, 197, 205, 0.2) !important;
}

:deep(.y2k-dropdown) {
    background: rgba(255, 255, 255, 0.5) !important;
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
    border-radius: 9999px !important;
}

:deep(.y2k-dropdown-cell) {
    background: transparent !important;
    border: none !important;
}

/* DataTable Overrides */
:deep(.y2k-table .p-datatable-header) {
    background: transparent;
    border: none;
}
:deep(.y2k-table .p-datatable-thead > tr > th) {
    background: transparent;
    font-family: monospace;
    font-size: 0.7rem;
    font-weight: 900;
    color: #4a7a82;
    border-bottom: 1px solid rgba(44, 76, 82, 0.1);
    padding: 1rem 1rem 0.5rem 1rem;
}
:deep(.y2k-table .p-datatable-tbody > tr) {
    background: transparent;
}
:deep(.y2k-table .p-datatable-tbody > tr > td) {
    border-bottom: 1px solid rgba(44, 76, 82, 0.05);
    padding: 1rem;
}
:deep(.y2k-table .p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}

/* Dialog & Overlay Styles */
:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer) {
    background: #fdfdfd !important;
    color: #2c4c52;
}
:deep(.y2k-dialog .p-dialog-header) {
    border-bottom: 1px solid rgba(44, 76, 82, 0.05);
}

:deep(.y2k-overlay .p-overlaypanel-content) {
    background: transparent !important;
    padding: 1.25rem;
}
:deep(.y2k-overlay) {
    border: 1px solid rgba(44, 76, 82, 0.1) !important;
    border-radius: 16px;
    box-shadow: 0 20px 50px -10px rgba(44,76,82,0.15) !important;
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(44, 76, 82, 0.1);
    border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(44, 76, 82, 0.2);
}
</style>
