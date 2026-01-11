<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue'; // Import watch
import { storeToRefs } from 'pinia';
import { useSkillStore } from '@/stores/skill';

const toast = useToast();
const dt = ref();
const skillStore = useSkillStore();

const { skills, loading } = storeToRefs(skillStore);

const skillDialog = ref(false);
const deleteSkillDialog = ref(false);
const deleteSkillsDialog = ref(false);
const skill = ref({});
const selectedSkills = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const domains = ref([
    { label: 'Software Engineering & Development', value: 'Engineering' },
    { label: 'Data Science, AI & Machine Learning', value: 'Data-AI' },
    { label: 'Infrastructure, Cloud & DevOps', value: 'Infrastructure' },
    { label: 'Cybersecurity & Information Security', value: 'Security' },
    { label: 'Product, Business & Management', value: 'Product' },
    { label: 'User Experience (UX) & Design', value: 'Design' },
]);

const statuses = ref([
    { label: 'Active', value: 'Active' },
    { label: 'Deprecated', value: 'Deprecated' },
    { label: 'Draft', value: 'Draft' }
]);

onMounted(() => {
    skillStore.fetchSkills();
});

// --- Helper: Auto-generate Slug ---
// Watch for Name changes to auto-fill slug if it's a NEW entry
watch(() => skill.value.name, (newVal) => {
    if (!skill.value.id && newVal) {
        skill.value.slug = newVal
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});

function openNew() {
    skill.value = { status: 'Active' };
    submitted.value = false;
    skillDialog.value = true;
}

function hideDialog() {
    skillDialog.value = false;
    submitted.value = false;
}

async function saveSkill() {
    submitted.value = true;

    if (skill?.value.name?.trim() && skill?.value.domain) {
        try {
            if (skill.value.id) {
                await skillStore.updateSkill(skill.value.id, skill.value);
                toast.add({ severity: 'success', summary: 'System Update', detail: 'Skill Parameters Modified', life: 3000 });
            } else {
                await skillStore.createSkill(skill.value);
                toast.add({ severity: 'success', summary: 'New Node', detail: 'Skill Added to Matrix', life: 3000 });
            }

            skillDialog.value = false;
            skill.value = {};
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Operation Failed', detail: 'Could not save skill.', life: 3000 });
        }
    }
}

function editSkill(item) {
    skill.value = { ...item };
    skillDialog.value = true;
}

function confirmDeleteSkill(item) {
    skill.value = item;
    deleteSkillDialog.value = true;
}

async function deleteSkill() {
    try {
        await skillStore.deleteSkill(skill.value.id);
        deleteSkillDialog.value = false;
        skill.value = {};
        toast.add({ severity: 'success', summary: 'Node Removed', detail: 'Skill Deleted', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete skill.', life: 3000 });
    }
}

function confirmDeleteSelected() {
    deleteSkillsDialog.value = true;
}

async function deleteSelectedSkills() {
    try {
        const promises = selectedSkills.value.map(s => skillStore.deleteSkill(s.id));
        await Promise.all(promises);
        deleteSkillsDialog.value = false;
        selectedSkills.value = null;
        toast.add({ severity: 'success', summary: 'Batch Removal', detail: 'Skills Deleted', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Some skills could not be deleted.', life: 3000 });
    }
}

function getStatusSeverity(status) {
    switch (status) {
        case 'Active': return 'success';
        case 'Draft': return 'info';
        case 'Deprecated': return 'danger';
        default: return null;
    }
}
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
                        <i class="pi pi-bolt text-xs text-[#2c4c52]"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">SKILL_MATRIX_REGISTRY_V1</span>
                    </div>
                    <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">Skill Management</h2>
                </div>
                <div class="flex gap-3">
                    <Button label="EXPORT_DATA" icon="pi pi-download" class="y2k-button-secondary !hidden md:!flex" @click="dt.exportCSV($event)" />
                    <Button label="NEW_SKILL" icon="pi pi-plus" class="y2k-button-primary" @click="openNew" />
                </div>
            </div>

            <div class="col-span-12">
                <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm overflow-hidden">
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex gap-2">
                             <Button label="DELETE_SELECTED" icon="pi pi-trash" class="y2k-button-danger !text-[10px]"
                                    @click="confirmDeleteSelected" :disabled="!selectedSkills || !selectedSkills.length" />
                        </div>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search text-[#2c4c52]/50" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="SEARCH MATRIX..." class="y2k-input !py-2 !text-xs !pl-8 !w-64" />
                        </IconField>
                    </div>

                    <DataTable
                        ref="dt"
                        v-model:selection="selectedSkills"
                        :value="skills"
                        :loading="loading"
                        dataKey="id"
                        :paginator="true"
                        :rows="10"
                        :filters="filters"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25]"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                        class="y2k-table"
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>

                        <Column field="name" header="SKILL_IDENTITY" sortable style="min-width: 14rem">
                            <template #body="slotProps">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded bg-[#2c4c52] flex items-center justify-center text-[#7bc5cd] font-black text-sm">
                                        {{ slotProps.data.name.charAt(0) }}
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-[#2c4c52] text-sm">{{ slotProps.data.name }}</span>
                                        <span class="text-[10px] text-[#4a7a82] font-mono">{{ slotProps.data.slug }}</span>
                                    </div>
                                </div>
                            </template>
                        </Column>

                        <Column field="domain" header="DOMAIN_CATEGORY" sortable style="min-width: 12rem">
                            <template #body="slotProps">
                                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase border"
                                    :class="{
                                        'bg-blue-50 text-blue-600 border-blue-200': slotProps.data.domain === 'Engineering',
                                        'bg-purple-50 text-purple-600 border-purple-200': slotProps.data.domain === 'Data-AI',
                                        'bg-orange-50 text-orange-600 border-orange-200': slotProps.data.domain === 'Infrastructure',
                                        'bg-red-50 text-red-600 border-red-200': slotProps.data.domain === 'Security',
                                        'bg-teal-50 text-teal-600 border-teal-200': slotProps.data.domain === 'Product',
                                        'bg-pink-50 text-pink-600 border-pink-200': slotProps.data.domain === 'Design',
                                        'bg-gray-50 text-gray-600 border-gray-200': !['Engineering','Data-AI','Infrastructure','Security','Product','Design'].includes(slotProps.data.domain)
                                    }">
                                    {{ slotProps.data.domain }}
                                </span>
                            </template>
                        </Column>

                        <Column field="description" header="DESCRIPTION" sortable style="min-width: 20rem">
                            <template #body="slotProps">
                                <span class="text-xs text-[#4a7a82] font-medium truncate block max-w-[20rem]">{{ slotProps.data.description }}</span>
                            </template>
                        </Column>

                        <Column field="status" header="STATUS" sortable style="min-width: 10rem">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" class="!font-mono !text-[10px] !font-bold" />
                            </template>
                        </Column>

                        <Column header="OPS" :exportable="false" style="min-width: 10rem; text-align: center">
                            <template #body="slotProps">
                                <div class="flex gap-1 justify-center">
                                    <Button icon="pi pi-pencil" text rounded class="!text-[#2c4c52] !w-8 !h-8 hover:bg-[#2c4c52]/10"
                                            @click="editSkill(slotProps.data)" />
                                    <Button icon="pi pi-trash" text rounded class="!text-red-500 !w-8 !h-8 hover:bg-red-50"
                                            @click="confirmDeleteSkill(slotProps.data)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="skillDialog" :style="{ width: '450px' }" modal class="y2k-dialog">
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-sliders-h text-[#2c4c52]"></i>
                    <span class="font-black text-[#2c4c52] uppercase text-lg">Skill Parameters</span>
                </div>
            </template>

            <div class="flex flex-col gap-5 py-2">
                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Skill Name</label>
                    <InputText v-model.trim="skill.name" required autofocus class="w-full y2k-input" :class="{ '!border-red-500': submitted && !skill.name }" />
                    <small v-if="submitted && !skill.name" class="text-red-500 text-[10px] font-bold">REQUIRED FIELD</small>
                </div>

                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Slug (Identifier)</label>
                    <InputText v-model.trim="skill.slug" class="w-full y2k-input" placeholder="auto-generated-if-blank" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Domain</label>
                        <Select v-model="skill.domain" :options="domains" optionLabel="label" optionValue="value" placeholder="SELECT..." class="w-full y2k-dropdown"
                                :class="{ '!border-red-500': submitted && !skill.domain }" />
                    </div>
                    <div class="space-y-1">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Status</label>
                        <Select v-model="skill.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="SELECT..." class="w-full y2k-dropdown" />
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Description</label>
                    <Textarea v-model="skill.description" rows="3" class="w-full y2k-input" />
                </div>
            </div>

            <template #footer>
                <div class="flex gap-2 justify-end pt-4 border-t border-[#2c4c52]/10">
                    <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold !text-xs" @click="hideDialog" />
                    <Button label="SAVE ENTRY" class="y2k-button-primary !text-xs !py-2" @click="saveSkill" :loading="loading" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteSkillDialog" :style="{ width: '450px' }" header="Confirm Removal" modal class="y2k-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span class="text-[#2c4c52] text-sm">Are you sure you want to delete <b class="text-[#7bc5cd]">{{ skill.name }}</b>?</span>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-4">
                    <Button label="ABORT" text class="!text-[#2c4c52] !font-bold !text-xs" @click="deleteSkillDialog = false" />
                    <Button label="CONFIRM DELETION" severity="danger" class="!font-bold !text-xs" @click="deleteSkill" :loading="loading" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteSkillsDialog" :style="{ width: '450px' }" header="Bulk Removal" modal class="y2k-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span class="text-[#2c4c52] text-sm">Delete selected skills from the matrix?</span>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-4">
                    <Button label="ABORT" text class="!text-[#2c4c52] !font-bold !text-xs" @click="deleteSkillsDialog = false" />
                    <Button label="CONFIRM DELETION" severity="danger" class="!font-bold !text-xs" @click="deleteSelectedSkills" :loading="loading" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
/* (Same styles as previous - truncated for brevity) */
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
.y2k-button-danger {
    background: transparent !important;
    border: 2px solid rgba(239, 68, 68, 0.2) !important;
    color: #ef4444 !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    font-size: 0.75rem !important;
}
.y2k-input, :deep(.y2k-input) {
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
    padding: 0;
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
}
:deep(.y2k-table .p-datatable-tbody > tr:hover) {
    background: rgba(44, 76, 82, 0.02);
}
:deep(.y2k-table .p-datatable-tbody > tr > td) {
    border-bottom: 1px solid rgba(44, 76, 82, 0.05);
    padding: 1rem;
}
/* Dialogs */
:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer) {
    background: #fdfdfd !important;
    color: #2c4c52;
}
:deep(.y2k-dialog .p-dialog-header) {
    border-bottom: 1px solid rgba(44, 76, 82, 0.05);
}
/* Paginator */
:deep(.p-paginator) {
    background: transparent !important;
    border: none !important;
    margin-top: 1rem;
    font-family: monospace;
}
</style>
