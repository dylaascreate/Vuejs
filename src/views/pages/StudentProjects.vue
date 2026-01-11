<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { storeToRefs } from 'pinia';
import { useProjectStore } from '@/stores/project'; // [1] Import Store
import Skeleton from 'primevue/skeleton';

const toast = useToast();
const confirm = useConfirm();
const projectStore = useProjectStore(); // [2] Init Store

// --- State ---
// [3] Bind projects from store state
const { userProjects: projects, isLoading } = storeToRefs(projectStore);

const projectDialog = ref(false);
const previewDialog = ref(false);
const deleteDialog = ref(false);
const project = ref({});
const selectedProject = ref({});
const submitted = ref(false);

const categories = ref(['Personal', 'Paid']);

// --- Lifecycle ---
onMounted(() => {
    projectStore.fetchUserProjects();
});

// --- Actions ---
const openNew = () => {
    project.value = { skills: [], tools: [], category: 'Personal' };
    submitted.value = false;
    projectDialog.value = true;
};

const hideDialog = () => {
    projectDialog.value = false;
    submitted.value = false;
};

const saveProject = async () => {
    submitted.value = true;

    if (project.value.title && project.value.about) {
        try {
            if (project.value.id) {
                // [4] Update via Store
                await projectStore.updateProject(project.value.id, project.value);
                toast.add({ severity: 'success', summary: 'System Update', detail: 'Project Protocol Updated', life: 3000 });
            } else {
                // [5] Create via Store
                await projectStore.createProject(project.value);
                toast.add({ severity: 'success', summary: 'System Entry', detail: 'New Project Initialized', life: 3000 });
            }
            projectDialog.value = false;
            project.value = {};
        } catch (error) {
            console.error(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save project.', life: 3000 });
        }
    }
};

const editProject = (proj) => {
    // Clone the object to avoid direct mutation of store state before save
    project.value = JSON.parse(JSON.stringify(proj));
    projectDialog.value = true;
};

const confirmDelete = (proj) => {
    project.value = proj;
    deleteDialog.value = true;
};

const deleteProject = async () => {
    try {
        // [6] Delete via Store
        await projectStore.deleteProject(project.value.id);
        deleteDialog.value = false;
        project.value = {};
        toast.add({ severity: 'success', summary: 'File Deleted', detail: 'Project Removed from Database', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete project.', life: 3000 });
    }
};

const openPreview = (proj) => {
    selectedProject.value = { ...proj };
    previewDialog.value = true;
};

const formatCurrency = (value) => {
    if (!value) return '';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'MYR' });
};

const getCategoryClass = (category) => {
    return category === 'Paid'
        ? 'bg-[#2c4c52] text-[#7bc5cd] border border-[#2c4c52]'
        : 'bg-white text-[#4a7a82] border border-[#2c4c52]/20';
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>
        <div class="absolute top-10 right-0 w-[40vw] h-[40vw] bg-[#7bc5cd] rounded-full blur-[120px] opacity-20 pointer-events-none animate-pulse"></div>
        <div class="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#a7e2e8] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4 max-w-7xl mx-auto">

            <div class="col-span-12 flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                        <i class="pi pi-folder-open text-xs text-[#2c4c52]"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">PROJECT_DATABASE_V1</span>
                    </div>
                    <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">
                        My <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#7bc5cd] to-[#5d9ca4]">Builds</span>
                    </h2>
                    <p class="text-[#4a7a82] font-medium text-sm mt-1 max-w-lg">
                        Archive your development milestones. Track paid commissions and open-source contributions.
                    </p>
                </div>
                <Button label="INITIALIZE PROJECT" icon="pi pi-plus" class="y2k-button-primary !py-2 !px-4 !text-xs" @click="openNew" :loading="isLoading" />
            </div>

            <div class="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                <template v-if="isLoading">
                    <div v-for="i in 6" :key="i" class="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 h-full flex flex-col gap-4">
                        <div class="flex justify-between items-start mb-2">
                            <Skeleton size="3rem" borderRadius="1rem" class="bg-white/20"></Skeleton>
                            <Skeleton width="4rem" height="1.5rem" borderRadius="1rem" class="bg-white/20"></Skeleton>
                        </div>
                        <div class="space-y-3 flex-1">
                            <Skeleton width="80%" height="1.5rem" class="bg-white/20"></Skeleton>
                            <div class="space-y-2">
                                <Skeleton width="100%" height="0.6rem" class="bg-white/20"></Skeleton>
                                <Skeleton width="100%" height="0.6rem" class="bg-white/20"></Skeleton>
                                <Skeleton width="60%" height="0.6rem" class="bg-white/20"></Skeleton>
                            </div>
                        </div>
                        <div class="flex gap-2 mt-4">
                            <Skeleton width="3rem" height="1.2rem" borderRadius="4px" class="bg-white/20"></Skeleton>
                            <Skeleton width="3rem" height="1.2rem" borderRadius="4px" class="bg-white/20"></Skeleton>
                        </div>
                        <div class="flex justify-between items-center pt-4 border-t border-[#2c4c52]/5 mt-auto">
                            <div class="flex gap-2">
                                <Skeleton shape="circle" size="2rem" class="bg-white/20"></Skeleton>
                                <Skeleton shape="circle" size="2rem" class="bg-white/20"></Skeleton>
                                <Skeleton shape="circle" size="2rem" class="bg-white/20"></Skeleton>
                            </div>
                            <Skeleton width="4rem" height="1rem" class="bg-white/20"></Skeleton>
                        </div>
                    </div>
                </template>

                <template v-else>
                    <div v-for="proj in projects" :key="proj.id"
                         class="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(44,76,82,0.1)] transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full">

                        <div class="h-1 bg-gradient-to-r from-[#7bc5cd] via-[#2c4c52] to-[#7bc5cd] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div class="p-6 flex flex-col flex-1">
                            <div class="flex justify-between items-start mb-4">
                                <div class="p-3 bg-[#e0f2f1] rounded-2xl text-[#2c4c52] border border-[#2c4c52]/5">
                                    <i class="pi pi-code text-xl"></i>
                                </div>
                                <span class="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider" :class="getCategoryClass(proj.category)">
                                    {{ proj.category }}
                                </span>
                            </div>

                            <h3 class="text-xl font-black text-[#2c4c52] mb-2 leading-tight">{{ proj.title }}</h3>
                            <p class="text-xs font-medium text-[#4a7a82] mb-6 line-clamp-3 leading-relaxed flex-1">{{ proj.about }}</p>

                            <div class="flex flex-wrap gap-2 mb-6"
                                v-if="(proj.skills && proj.skills.length) || (proj.tools && proj.tools.length)">

                                <span v-for="(skill, i) in (Array.isArray(proj.skills) ? proj.skills : [])"
                                    :key="'skill-' + i"
                                    class="text-[10px] font-bold px-2 py-1 rounded bg-white/50 border border-[#2c4c52]/10 text-[#2c4c52] uppercase tracking-wide">
                                    {{ skill }}
                                </span>

                                <span v-for="(tool, i) in (Array.isArray(proj.tools) ? proj.tools : [])"
                                    :key="'tool-' + i"
                                    class="text-[10px] font-bold px-2 py-1 rounded bg-[#7bc5cd]/10 border border-[#7bc5cd]/20 text-[#2c4c52] uppercase tracking-wide">
                                    {{ tool }}
                                </span>

                            </div>

                            <div class="flex items-center justify-between pt-4 border-t border-[#2c4c52]/10 mt-auto">
                                <div class="flex gap-1">
                                    <Button icon="pi pi-eye" text rounded class="!w-8 !h-8 !text-[#2c4c52] hover:bg-[#2c4c52]/10" @click="openPreview(proj)" v-tooltip.bottom="'View Details'" />
                                    <Button icon="pi pi-pencil" text rounded class="!w-8 !h-8 !text-[#2c4c52] hover:bg-[#2c4c52]/10" @click="editProject(proj)" v-tooltip.bottom="'Edit'" />
                                    <Button icon="pi pi-trash" text rounded class="!w-8 !h-8 !text-red-500 hover:bg-red-50" @click="confirmDelete(proj)" v-tooltip.bottom="'Delete'" />
                                </div>
                                <span v-if="proj.category === 'Paid'" class="font-mono font-bold text-[#2c4c52] text-sm">
                                    {{ formatCurrency(proj.value) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </template>

                <div v-if="!isLoading && projects.length === 0" class="col-span-12 text-center py-20 bg-white/30 backdrop-blur-sm rounded-3xl border border-dashed border-[#2c4c52]/20">
                    <div class="w-16 h-16 bg-[#2c4c52]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-folder-open text-2xl text-[#2c4c52]/40"></i>
                    </div>
                    <p class="font-mono text-[#2c4c52]/50 font-bold uppercase">NO_PROJECTS_FOUND</p>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="projectDialog" :style="{ width: '500px' }" :modal="true" class="y2k-dialog font-sans">
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-pencil text-[#2c4c52]"></i>
                    <span class="font-black text-[#2c4c52] uppercase tracking-tight text-xl">Project Parameters</span>
                </div>
            </template>

            <div class="flex flex-col gap-5 pt-4">
                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Project Title</label>
                    <InputText v-model.trim="project.title" required="true" class="y2k-input w-full" placeholder="e.g. Neural Network UI" autofocus />
                    <small class="text-red-500 font-bold text-[10px]" v-if="submitted && !project.title">REQUIRED_FIELD</small>
                </div>

                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Live Link</label>
                    <InputText v-model.trim="project.link" class="y2k-input w-full" placeholder="https://" />
                </div>

                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Description</label>
                    <Textarea v-model="project.about" rows="3" class="y2k-input w-full" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-1">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Classification</label>
                        <SelectButton v-model="project.category" :options="categories"
                            :pt="{
                                button: ({ context }) => ({
                                    class: context.active
                                        ? 'bg-[#2c4c52] text-[#7bc5cd] font-bold border border-[#2c4c52] text-xs py-2'
                                        : 'bg-white text-[#4a7a82] border border-[#2c4c52]/10 hover:bg-[#2c4c52]/5 text-xs py-2'
                                })
                            }"
                        />
                    </div>
                    <div v-if="project.category === 'Paid'" class="space-y-1">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Value (MYR)</label>
                        <InputNumber v-model="project.value" mode="currency" currency="MYR" locale="en-MY" inputClass="y2k-input w-full" />
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Tech Stack</label>
                    <Chips v-model="project.skills" separator="," placeholder="Enter to add..." class="w-full"
                           :pt="{
                               input: { class: 'y2k-input w-full' },
                               token: { class: 'bg-[#2c4c52] text-[#7bc5cd] font-bold text-xs' }
                           }" />
                </div>
                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Tools</label>
                    <Chips v-model="project.tools" separator="," placeholder="e.g. Figma, Docker" class="w-full"
                           :pt="{
                               input: { class: 'y2k-input w-full' },
                               token: { class: 'bg-[#7bc5cd]/20 text-[#2c4c52] font-bold text-xs' }
                           }" />
                </div>
            </div>

            <template #footer>
                <div class="flex gap-2 justify-end pt-4 border-t border-[#2c4c52]/10">
                    <Button label="ABORT" icon="pi pi-times" text class="!text-[#2c4c52] !font-bold !text-xs" @click="hideDialog" />
                    <Button label="SAVE ENTRY" icon="pi pi-check" class="y2k-button-primary !text-xs !py-2" @click="saveProject" :loading="isLoading" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="previewDialog" :style="{ width: '50vw' }" :modal="true" :dismissableMask="true" class="y2k-dialog font-sans">
            <template #header>
                <div class="flex items-center gap-3">
                    <span class="text-2xl font-black text-[#2c4c52] uppercase leading-none">{{ selectedProject.title }}</span>
                    <span class="px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider" :class="getCategoryClass(selectedProject.category)">
                        {{ selectedProject.category }}
                    </span>
                </div>
            </template>

            <div class="flex flex-col gap-6 pt-4">
                <div class="bg-[#2c4c52] p-8 rounded-2xl text-center relative overflow-hidden group border border-[#2c4c52]">
                    <div class="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-shine opacity-0 group-hover:opacity-100 pointer-events-none"></div>
                    <a :href="selectedProject.link" target="_blank" class="inline-block relative z-10">
                        <Button label="ACCESS TERMINAL" icon="pi pi-external-link" class="y2k-button-secondary !bg-[#2c4c52] !text-[#7bc5cd] !border-[#7bc5cd] hover:!bg-[#7bc5cd] hover:!text-[#2c4c52]" />
                    </a>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase mb-2">Manifest</h4>
                        <p class="text-[#2c4c52] text-sm leading-relaxed">{{ selectedProject.about }}</p>
                    </div>

                    <div class="flex flex-col gap-6">
                        <div v-if="selectedProject.category === 'Paid'" class="bg-green-500/5 p-4 rounded-xl border border-green-500/20">
                            <span class="block text-green-700 text-[10px] font-mono font-bold uppercase mb-1">Monetary Value</span>
                            <span class="text-2xl font-black text-[#2c4c52]">{{ formatCurrency(selectedProject.value) }}</span>
                        </div>

                        <div>
                            <h4 class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase mb-2">Modules & Dependencies</h4>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="skill in (Array.isArray(selectedProject.skills) ? selectedProject.skills : [])" :key="skill" class="px-2 py-1 bg-[#2c4c52]/5 border border-[#2c4c52]/10 text-[#2c4c52] text-xs font-bold rounded">
                                    {{ skill }}
                                </span>
                                <span v-for="tool in (Array.isArray(selectedProject.tools) ? selectedProject.tools : [])" :key="tool" class="px-2 py-1 bg-[#7bc5cd]/10 border border-[#7bc5cd]/20 text-[#2c4c52] text-xs font-bold rounded">
                                    {{ tool }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>

        <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" :modal="true" class="y2k-dialog">
            <template #header>
                 <span class="font-black text-[#2c4c52] uppercase text-lg">Confirm Purge</span>
            </template>
            <div class="flex items-center gap-4 py-2">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span class="text-[#2c4c52] text-sm font-medium" v-if="project">
                    Are you sure you want to purge <b>{{ project.title }}</b> from the database?
                </span>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-4 border-t border-[#2c4c52]/10">
                    <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold !text-xs" @click="deleteDialog = false" />
                    <Button label="PURGE DATA" severity="danger" class="!font-bold !text-xs" @click="deleteProject" :loading="isLoading" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
/* Y2K Input Styles */
.y2k-input, :deep(.y2k-input) {
    background: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(44, 76, 82, 0.15) !important;
    border-radius: 8px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
    padding: 0.75rem 1rem !important;
    transition: all 0.3s ease !important;
}

.y2k-input:focus, .y2k-input:hover {
    background: #ffffff !important;
    border-color: #7bc5cd !important;
    box-shadow: 0 0 0 2px rgba(123, 197, 205, 0.2) !important;
}

/* Primary Button Y2K Style */
.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 4px 15px rgba(44, 76, 82, 0.3);
    transition: all 0.3s ease;
}

.y2k-button-primary:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
}

/* Secondary Button */
.y2k-button-secondary {
    background: transparent !important;
    border: 2px solid #7bc5cd !important;
    color: #7bc5cd !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    font-size: 0.75rem !important;
    transition: all 0.3s ease;
}

/* Dialog Overrides */
:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer) {
    background: #fdfdfd !important;
    color: #2c4c52;
}
:deep(.y2k-dialog .p-dialog-header) {
    border-bottom: 1px solid rgba(44, 76, 82, 0.05);
}
:deep(.y2k-dialog) {
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(44, 76, 82, 0.25) !important;
    border: 1px solid rgba(44, 76, 82, 0.1);
}

@keyframes shine {
    to { background-position: 200% center; }
}
.animate-shine {
    animation: shine 3s linear infinite;
}
</style>
