<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const roadmaps = ref([]);
const deleteRoadmapDialog = ref(false);
const deleteRoadmapsDialog = ref(false);
const viewRoadmapDialog = ref(false);
const roadmap = ref({});
const selectedRoadmaps = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(() => {
    roadmaps.value = [
        {
            id: 1001,
            user: 'Alice Johnson',
            email: 'alice@devnexus.com',
            title: 'Frontend Developer Mastery',
            type: 'General',
            career: 'Frontend Engineer',
            created_at: '2025-01-10',
            status: 'Active',
            completed_tasks: 25,
            total_tasks: 40,
            progress: 62,
            generation_status: 'Success',
            nodes: ['HTML/CSS Basics', 'Vue.js Fundamentals', 'State Management']
        },
        {
            id: 1002,
            user: 'Bob Smith',
            email: 'bob@devnexus.com',
            title: 'DES3053: Software Testing',
            type: 'Academic',
            career: 'QA Engineer',
            created_at: '2025-02-15',
            status: 'Active',
            completed_tasks: 5,
            total_tasks: 30,
            progress: 16,
            generation_status: 'Success',
            nodes: ['Unit Testing', 'Integration Testing', 'Jest Basics']
        },
        {
            id: 1003,
            user: 'David Lee',
            email: 'david@devnexus.com',
            title: 'AWS Cloud Architect',
            type: 'General',
            career: 'Cloud Architect',
            created_at: '2025-03-01',
            status: 'Draft',
            completed_tasks: 0,
            total_tasks: 50,
            progress: 0,
            generation_status: 'Error',
            nodes: []
        },
        {
            id: 1004,
            user: 'Chris Evans',
            email: 'chris@devnexus.com',
            title: 'CS201: Data Structures',
            type: 'Academic',
            career: 'Backend Developer',
            created_at: '2024-11-20',
            status: 'Archived',
            completed_tasks: 20,
            total_tasks: 20,
            progress: 100,
            generation_status: 'Success',
            nodes: ['Arrays', 'Linked Lists', 'Trees', 'Graphs']
        },
        {
            id: 1005,
            user: 'Eva Green',
            email: 'eva@devnexus.com',
            title: 'UI/UX Principles',
            type: 'General',
            career: 'Product Designer',
            created_at: '2025-01-05',
            status: 'Active',
            completed_tasks: 12,
            total_tasks: 24,
            progress: 50,
            generation_status: 'Success',
            nodes: ['Color Theory', 'Typography', 'Figma Wireframing']
        }
    ];
});

function viewDetails(item) {
    roadmap.value = { ...item };
    viewRoadmapDialog.value = true;
}

function confirmDeleteRoadmap(item) {
    roadmap.value = item;
    deleteRoadmapDialog.value = true;
}

function deleteRoadmap() {
    roadmaps.value = roadmaps.value.filter((val) => val.id !== roadmap.value.id);
    deleteRoadmapDialog.value = false;
    roadmap.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Roadmap Deleted', life: 3000 });
}

function confirmDeleteSelected() {
    deleteRoadmapsDialog.value = true;
}

function deleteSelectedRoadmaps() {
    roadmaps.value = roadmaps.value.filter((val) => !selectedRoadmaps.value.includes(val));
    deleteRoadmapsDialog.value = false;
    selectedRoadmaps.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Roadmaps Deleted', life: 3000 });
}

function getStatusSeverity(status) {
    switch (status) {
        case 'Active': return 'success';
        case 'Draft': return 'info';
        case 'Archived': return 'secondary';
        default: return null;
    }
}

function getGenerationIcon(status) {
    return status === 'Success' ? 'pi pi-verified' : 'pi pi-exclamation-triangle';
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
                        <i class="pi pi-compass text-xs text-[#2c4c52]"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">AI_GENERATION_PROTOCOL_V1</span>
                    </div>
                    <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">Roadmap Governance</h2>
                </div>

                <div class="flex gap-3">
                    <Button label="EXPORT_CSV" icon="pi pi-download" class="y2k-button-secondary !hidden md:!flex" @click="dt.exportCSV($event)" />
                    <Button label="BULK_DELETE" icon="pi pi-trash" class="y2k-button-danger"
                            @click="confirmDeleteSelected" :disabled="!selectedRoadmaps || !selectedRoadmaps.length" />
                </div>
            </div>

            <div class="col-span-12">
                <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm overflow-hidden">

                    <DataTable
                        ref="dt"
                        v-model:selection="selectedRoadmaps"
                        :value="roadmaps"
                        dataKey="id"
                        :paginator="true"
                        :rows="10"
                        :filters="filters"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25]"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} protocols"
                        class="y2k-table"
                        responsiveLayout="scroll"
                    >
                        <template #header>
                            <div class="flex justify-between items-center mb-4">
                                <span class="font-mono text-xs font-bold text-[#4a7a82] uppercase">Live Tracking</span>
                                <IconField>
                                    <InputIcon>
                                        <i class="pi pi-search text-[#2c4c52]/50" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="SEARCH PROTOCOLS..." class="y2k-input !py-2 !text-xs !pl-8 !w-64" />
                                </IconField>
                            </div>
                        </template>

                        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>

                        <Column field="user" header="INITIATOR" sortable style="min-width: 14rem">
                            <template #body="slotProps">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#2c4c52]/10 flex items-center justify-center border border-[#2c4c52]/10">
                                        <span class="font-black text-[#2c4c52]">{{ slotProps.data.user.charAt(0) }}</span>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-[#2c4c52] text-sm">{{ slotProps.data.user }}</span>
                                        <span class="font-mono text-[10px] text-[#4a7a82]">{{ slotProps.data.email }}</span>
                                    </div>
                                </div>
                            </template>
                        </Column>

                        <Column field="title" header="PROTOCOL_TITLE" sortable style="min-width: 14rem">
                            <template #body="slotProps">
                                <div class="flex flex-col gap-1">
                                    <span class="font-bold text-[#2c4c52] leading-tight">{{ slotProps.data.title }}</span>
                                    <span class="font-mono text-[10px] text-[#7bc5cd] font-bold">ID: {{ slotProps.data.id }}</span>
                                </div>
                            </template>
                        </Column>

                        <Column field="type" header="TYPE" sortable style="min-width: 8rem">
                            <template #body="slotProps">
                                <span class="font-mono text-[10px] font-bold uppercase px-2 py-1 rounded border"
                                      :class="slotProps.data.type === 'Academic' ? 'bg-[#2c4c52] text-[#7bc5cd] border-[#2c4c52]' : 'bg-white text-[#4a7a82] border-[#2c4c52]/20'">
                                    {{ slotProps.data.type }}
                                </span>
                            </template>
                        </Column>

                        <Column field="generation_status" header="AI_STATUS" sortable style="min-width: 10rem">
                            <template #body="slotProps">
                                <div class="flex items-center gap-2">
                                    <i :class="[getGenerationIcon(slotProps.data.generation_status),
                                       slotProps.data.generation_status === 'Success' ? 'text-green-500' : 'text-red-500']"></i>
                                    <span class="font-bold text-xs"
                                          :class="slotProps.data.generation_status === 'Success' ? 'text-[#2c4c52]' : 'text-red-500'">
                                        {{ slotProps.data.generation_status === 'Success' ? 'OPTIMAL' : 'ERROR' }}
                                    </span>
                                </div>
                            </template>
                        </Column>

                        <Column field="progress" header="COMPLETION" sortable style="min-width: 12rem">
                            <template #body="slotProps">
                                <div class="w-full">
                                    <div class="flex justify-between text-[10px] mb-1 font-mono font-bold">
                                        <span class="text-[#4a7a82]">{{ slotProps.data.completed_tasks }}/{{ slotProps.data.total_tasks }} STEPS</span>
                                        <span class="text-[#2c4c52]">{{ slotProps.data.progress }}%</span>
                                    </div>
                                    <div class="h-1.5 w-full bg-[#2c4c52]/10 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full transition-all duration-500"
                                             :class="slotProps.data.generation_status === 'Error' ? 'bg-red-400' : 'bg-[#2c4c52]'"
                                             :style="{ width: slotProps.data.progress + '%' }"></div>
                                    </div>
                                </div>
                            </template>
                        </Column>

                        <Column field="status" header="STATUS" sortable style="min-width: 8rem">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" class="!font-mono !text-[10px] !font-bold" />
                            </template>
                        </Column>

                        <Column header="OPS" style="width: 8rem; text-align: center" :exportable="false">
                            <template #body="slotProps">
                                <div class="flex gap-1 justify-center">
                                    <Button icon="pi pi-eye" text rounded class="!text-[#2c4c52] !w-8 !h-8 hover:bg-[#2c4c52]/10"
                                            @click="viewDetails(slotProps.data)" v-tooltip.top="'Inspect Protocol'" />
                                    <Button icon="pi pi-trash" text rounded class="!text-red-500 !w-8 !h-8 hover:bg-red-50"
                                            @click="confirmDeleteRoadmap(slotProps.data)" v-tooltip.top="'Delete Node'" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="viewRoadmapDialog" :style="{ width: '600px' }" modal class="y2k-dialog">
            <template #header>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-[#2c4c52]/10 flex items-center justify-center text-[#2c4c52]">
                        <i class="pi pi-map text-lg"></i>
                    </div>
                    <div>
                        <span class="font-black text-[#2c4c52] uppercase text-lg block leading-none">{{ roadmap.title }}</span>
                        <span class="font-mono text-[10px] font-bold text-[#7bc5cd] uppercase">SYSTEM ID: {{ roadmap.id }}</span>
                    </div>
                </div>
            </template>

            <div class="flex flex-col gap-6 py-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-[#2c4c52]/5 p-4 rounded-xl border border-[#2c4c52]/10">
                        <span class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase mb-2 block">Generation Status</span>
                        <div class="flex items-center gap-2">
                            <i :class="[getGenerationIcon(roadmap.generation_status), roadmap.generation_status === 'Success' ? 'text-green-500' : 'text-red-500']"></i>
                            <span class="font-bold text-[#2c4c52] uppercase text-sm">{{ roadmap.generation_status }}</span>
                        </div>
                    </div>
                    <div class="bg-[#2c4c52]/5 p-4 rounded-xl border border-[#2c4c52]/10">
                        <span class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase mb-2 block">Student Status</span>
                        <Tag :value="roadmap.status" :severity="getStatusSeverity(roadmap.status)" class="!font-mono !text-[10px] !font-bold" />
                    </div>
                </div>

                <div class="flex items-center gap-4 p-4 border rounded-xl border-[#2c4c52]/20 bg-white">
                    <div class="w-12 h-12 rounded-full bg-[#2c4c52] flex items-center justify-center font-black text-xl text-[#7bc5cd]">
                        {{ roadmap.user ? roadmap.user.charAt(0) : 'U' }}
                    </div>
                    <div>
                        <div class="font-bold text-[#2c4c52]">{{ roadmap.user }}</div>
                        <div class="text-xs text-[#4a7a82] font-mono">{{ roadmap.email }}</div>
                        <div class="text-[10px] text-[#7bc5cd] mt-1 font-bold uppercase tracking-wide">{{ roadmap.career }}</div>
                    </div>
                </div>

                <div>
                    <div class="flex justify-between items-end mb-2">
                        <span class="font-bold text-[#2c4c52] text-sm uppercase">Completion Progress</span>
                        <span class="font-mono text-[#2c4c52] font-bold">{{ roadmap.progress }}%</span>
                    </div>
                    <div class="h-3 w-full bg-[#2c4c52]/10 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-[#7bc5cd] to-[#2c4c52] rounded-full"
                             :style="{ width: roadmap.progress + '%' }"></div>
                    </div>
                    <div class="text-center mt-2 text-[10px] text-[#4a7a82] font-mono uppercase">
                        {{ roadmap.completed_tasks }} completed out of {{ roadmap.total_tasks }} milestones
                    </div>
                </div>

                <div v-if="roadmap.nodes && roadmap.nodes.length">
                    <h5 class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase mb-3">Generated Modules</h5>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="node in roadmap.nodes" :key="node" class="px-3 py-1 bg-white rounded-md text-xs font-bold text-[#2c4c52] border border-[#2c4c52]/20 flex items-center gap-2">
                            <i class="pi pi-check-circle text-[#7bc5cd] text-[10px]"></i> {{ node }}
                        </span>
                        <span class="px-3 py-1 text-xs font-mono font-bold text-[#4a7a82]">+ {{ roadmap.total_tasks - roadmap.nodes.length }} MORE</span>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="pt-4 border-t border-[#2c4c52]/10 w-full flex justify-end">
                    <Button label="CLOSE REPORT" text class="!text-[#2c4c52] !font-bold !text-xs" @click="viewRoadmapDialog = false" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoadmapDialog" :style="{ width: '450px' }" header="Confirm Termination" modal class="y2k-dialog">
            <div class="flex items-start gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500 mt-1" />
                <div>
                    <span class="font-bold block text-[#2c4c52] mb-2">Delete Protocol?</span>
                    <p class="text-[#4a7a82] text-sm mb-1">
                        You are about to remove <b>{{ roadmap.title }}</b> owned by <b>{{ roadmap.user }}</b>.
                    </p>
                    <p class="text-red-500 text-xs font-mono uppercase">This will permanently delete user progress.</p>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-4">
                    <Button label="ABORT" text class="!text-[#2c4c52] !font-bold !text-xs" @click="deleteRoadmapDialog = false" />
                    <Button label="TERMINATE" severity="danger" class="!font-bold !text-xs" @click="deleteRoadmap" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoadmapsDialog" :style="{ width: '450px' }" header="Bulk Termination" modal class="y2k-dialog">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span class="text-[#2c4c52] text-sm">Are you sure you want to delete the selected roadmaps?</span>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-4">
                    <Button label="ABORT" text class="!text-[#2c4c52] !font-bold !text-xs" @click="deleteRoadmapsDialog = false" />
                    <Button label="TERMINATE ALL" severity="danger" class="!font-bold !text-xs" @click="deleteSelectedRoadmaps" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
/* Y2K Utilities */
.y2k-button-secondary {
    background: transparent !important;
    border: 2px solid rgba(44, 76, 82, 0.1) !important;
    color: #2c4c52 !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    font-size: 0.75rem !important;
}
.y2k-button-secondary:hover {
    background: rgba(44, 76, 82, 0.05) !important;
    border-color: #2c4c52 !important;
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
.y2k-button-danger:hover {
    background: rgba(239, 68, 68, 0.05) !important;
    border-color: #ef4444 !important;
}

.y2k-input {
    background: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(44, 76, 82, 0.15) !important;
    border-radius: 8px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
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
}
:deep(.y2k-table .p-datatable-tbody > tr:hover) {
    background: rgba(44, 76, 82, 0.02);
}
:deep(.y2k-table .p-datatable-tbody > tr > td) {
    border-bottom: 1px solid rgba(44, 76, 82, 0.05);
    padding: 1rem;
}
:deep(.y2k-table .p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}

/* Paginator */
:deep(.p-paginator) {
    background: transparent !important;
    border: none !important;
    margin-top: 1rem;
    font-family: monospace;
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
</style>
