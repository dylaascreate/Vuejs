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
    return status === 'Success' ? 'pi pi-verified' : 'pi pi-exclamation-circle';
}
</script>

<template>
    <div>
        <div class="card border border-surface-200 dark:border-surface-700 shadow-sm">
            <Toolbar class="mb-6 !bg-transparent !border-none !p-0">
                <template #start>
                    <div class="flex flex-col">
                        <div class="flex items-center gap-2 mb-1">
                            <i class="pi pi-map text-2xl text-primary"></i>
                            <h4 class="m-0 font-bold text-xl text-surface-900 dark:text-surface-0">Roadmap Governance</h4>
                        </div>
                        <span class="text-muted-color text-sm">Monitor generation health, AI status, and student progress.</span>
                    </div>
                </template>

                <template #end>
                    <div class="flex gap-2">
                        <Button label="Export" icon="pi pi-download" severity="secondary" outlined @click="dt.exportCSV($event)" />
                        <Button label="Bulk Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedRoadmaps || !selectedRoadmaps.length" />
                    </div>
                </template>
            </Toolbar>

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
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} roadmaps"
                class="p-datatable-sm"
                stripedRows
                :pt="{
                    headerRow: { class: 'bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-0' }
                }"
            >
                <template #header>
                    <div class="flex justify-end mb-2">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search User, Title, or ID" class="w-64" />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>

                <Column field="user" header="User" sortable style="min-width: 14rem">
                    <template #body="slotProps">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {{ slotProps.data.user.charAt(0) }}
                            </div>
                            <div class="flex flex-col">
                                <span class="font-bold text-sm text-surface-900 dark:text-surface-0">{{ slotProps.data.user }}</span>
                                <span class="text-xs text-muted-color">{{ slotProps.data.email }}</span>
                            </div>
                        </div>
                    </template>
                </Column>

                <Column field="title" header="Roadmap" sortable style="min-width: 14rem">
                    <template #body="slotProps">
                        <div class="flex flex-col gap-1">
                            <span class="font-bold text-surface-800 dark:text-surface-100">{{ slotProps.data.title }}</span>
                            <span class="text-xs text-muted-color flex items-center gap-1">
                                <i class="pi pi-hashtag text-[10px]"></i> {{ slotProps.data.id }}
                            </span>
                        </div>
                    </template>
                </Column>

                <Column field="type" header="Type" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.type"
                             :severity="slotProps.data.type === 'Academic' ? 'warn' : 'info'"
                             class="!text-xs" />
                    </template>
                </Column>

                <Column field="generation_status" header="AI Status" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <div class="flex items-center gap-2 px-2 py-1 rounded-md w-fit"
                             :class="slotProps.data.generation_status === 'Success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
                            <i :class="[getGenerationIcon(slotProps.data.generation_status), slotProps.data.generation_status === 'Success' ? 'text-green-500' : 'text-red-500']"></i>
                            <span :class="['text-sm font-bold', slotProps.data.generation_status === 'Success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300']">
                                {{ slotProps.data.generation_status === 'Success' ? 'Generated' : 'Failed' }}
                            </span>
                        </div>
                    </template>
                </Column>

                <Column field="progress" header="Completion" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <div class="w-full">
                            <div class="flex justify-between text-xs mb-1.5">
                                <span class="text-muted-color">{{ slotProps.data.completed_tasks }}/{{ slotProps.data.total_tasks }} Steps</span>
                                <span class="font-bold text-primary">{{ slotProps.data.progress }}%</span>
                            </div>
                            <ProgressBar :value="slotProps.data.progress" :showValue="false" style="height: 6px"
                                :class="[
                                    'rounded-full',
                                    slotProps.data.generation_status === 'Error' ? 'opacity-50' : ''
                                ]"
                                :pt="{
                                    value: { class: 'bg-primary' }
                                }"
                            />
                        </div>
                    </template>
                </Column>

                <Column field="status" header="Status" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
                    </template>
                </Column>

                <Column :exportable="false" style="width: 8rem" header="Actions">
                    <template #body="slotProps">
                        <div class="flex gap-1">
                            <Button icon="pi pi-eye" text rounded severity="info" @click="viewDetails(slotProps.data)" v-tooltip.top="'View Details'" />
                            <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDeleteRoadmap(slotProps.data)" v-tooltip.top="'Delete'" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="viewRoadmapDialog" :style="{ width: '600px' }" :modal="true" class="p-fluid">
            <template #header>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <i class="pi pi-map text-xl"></i>
                    </div>
                    <div>
                        <span class="font-bold text-xl block">{{ roadmap.title }}</span>
                        <span class="text-sm text-muted-color">ID: {{ roadmap.id }}</span>
                    </div>
                </div>
            </template>

            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-surface-50 dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                        <span class="text-xs font-bold text-muted-color uppercase mb-1 block">Generation Status</span>
                        <div class="flex items-center gap-2">
                            <i :class="[getGenerationIcon(roadmap.generation_status), roadmap.generation_status === 'Success' ? 'text-green-500' : 'text-red-500']"></i>
                            <span class="font-bold">{{ roadmap.generation_status }}</span>
                        </div>
                    </div>
                    <div class="bg-surface-50 dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                        <span class="text-xs font-bold text-muted-color uppercase mb-1 block">Student Status</span>
                        <Tag :value="roadmap.status" :severity="getStatusSeverity(roadmap.status)" />
                    </div>
                </div>

                <div class="flex items-center gap-4 p-4 border rounded-xl border-surface-200 dark:border-surface-700">
                    <div class="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center font-bold text-xl text-surface-600">
                        {{ roadmap.user ? roadmap.user.charAt(0) : 'U' }}
                    </div>
                    <div>
                        <div class="font-bold text-lg">{{ roadmap.user }}</div>
                        <div class="text-sm text-muted-color">{{ roadmap.email }}</div>
                        <div class="text-xs text-primary mt-1 font-bold">{{ roadmap.career }}</div>
                    </div>
                </div>

                <div>
                    <div class="flex justify-between items-end mb-2">
                        <span class="font-bold text-lg">Completion Progress</span>
                        <span class="font-mono text-primary font-bold">{{ roadmap.progress }}%</span>
                    </div>
                    <ProgressBar :value="roadmap.progress" style="height: 12px" class="rounded-full" />
                    <div class="text-center mt-2 text-sm text-muted-color">
                        {{ roadmap.completed_tasks }} completed out of {{ roadmap.total_tasks }} milestones
                    </div>
                </div>

                <div v-if="roadmap.nodes && roadmap.nodes.length">
                    <h5 class="font-bold text-sm text-muted-color uppercase mb-3">Generated Modules</h5>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="node in roadmap.nodes" :key="node" class="px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-md text-sm border border-surface-200 dark:border-surface-700">
                            <i class="pi pi-check-circle text-green-500 text-xs mr-1"></i> {{ node }}
                        </span>
                        <span class="px-3 py-1 text-sm text-muted-color">+ {{ roadmap.total_tasks - roadmap.nodes.length }} more</span>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Close" icon="pi pi-times" text @click="viewRoadmapDialog = false" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoadmapDialog" :style="{ width: '450px' }" header="Confirm Removal" :modal="true">
            <div class="flex items-start gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500 mt-1" />
                <div>
                    <span class="font-bold block text-lg mb-2">Delete Roadmap?</span>
                    <p class="text-muted-color mb-1">
                        You are about to remove <b>{{ roadmap.title }}</b> owned by <b>{{ roadmap.user }}</b>.
                    </p>
                    <p class="text-red-500 text-sm">This will permanently delete user progress and cannot be undone.</p>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="deleteRoadmapDialog = false" />
                <Button label="Delete Permanently" icon="pi pi-trash" severity="danger" @click="deleteRoadmap" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoadmapsDialog" :style="{ width: '450px' }" header="Bulk Removal" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span>Are you sure you want to delete the selected roadmaps?</span>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="deleteRoadmapsDialog = false" />
                <Button label="Delete All" icon="pi pi-trash" severity="danger" @click="deleteSelectedRoadmaps" />
            </template>
        </Dialog>
    </div>
</template>
