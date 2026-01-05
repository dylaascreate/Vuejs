<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// --- Data ---
const projects = ref([
    {
        id: 1,
        title: 'E-Commerce Dashboard',
        link: 'https://github.com/student/ecommerce',
        about: 'A full-stack admin dashboard for managing products and orders. Built with Vue 3 and Laravel to handle high-volume transaction data.',
        skills: ['Vue.js', 'Laravel', 'REST API'],
        tools: ['VS Code', 'Postman', 'Docker'],
        category: 'Personal',
        value: null,
    },
    {
        id: 2,
        title: 'Freelance Landing Page',
        link: 'https://client-site.com',
        about: 'A high-conversion landing page for a local gym client. Focused on SEO velocity and mobile responsiveness protocols.',
        skills: ['HTML', 'Tailwind CSS', 'SEO'],
        tools: ['Figma', 'Vercel'],
        category: 'Paid',
        value: 500,
    }
]);

// --- State ---
const projectDialog = ref(false);
const previewDialog = ref(false);
const deleteDialog = ref(false);
const project = ref({});
const selectedProject = ref({});
const submitted = ref(false);

const categories = ref(['Personal', 'Paid']);

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

const saveProject = () => {
    submitted.value = true;

    if (project.value.title && project.value.about) {
        if (project.value.id) {
            // Update
            const index = projects.value.findIndex(p => p.id === project.value.id);
            projects.value[index] = project.value;
            toast.add({ severity: 'success', summary: 'System Update', detail: 'Project Protocol Updated', life: 3000 });
        } else {
            // Create
            project.value.id = createId();
            projects.value.push(project.value);
            toast.add({ severity: 'success', summary: 'System Entry', detail: 'New Project Initialized', life: 3000 });
        }

        projectDialog.value = false;
        project.value = {};
    }
};

const editProject = (proj) => {
    project.value = { ...proj };
    projectDialog.value = true;
};

const confirmDelete = (proj) => {
    project.value = proj;
    deleteDialog.value = true;
};

const deleteProject = () => {
    projects.value = projects.value.filter(val => val.id !== project.value.id);
    deleteDialog.value = false;
    project.value = {};
    toast.add({ severity: 'success', summary: 'File Deleted', detail: 'Project Removed from Database', life: 3000 });
};

const openPreview = (proj) => {
    selectedProject.value = { ...proj };
    previewDialog.value = true;
};

const createId = () => {
    return Math.floor(Math.random() * 10000);
};

const formatCurrency = (value) => {
    if (!value) return '';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'MYR' });
};

const getCategoryClass = (category) => {
    return category === 'Paid'
        ? 'bg-[#2c4c52] text-[#7bc5cd]'
        : 'bg-[#7bc5cd]/20 text-[#2c4c52]';
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="absolute top-10 right-0 w-[40vw] h-[40vw] bg-[#7bc5cd] rounded-full blur-[100px] opacity-20 pointer-events-none animate-pulse"></div>
        <div class="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#a7e2e8] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-12 gap-8">

            <div class="col-span-12 flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                        <i class="pi pi-folder-open text-xs text-[#2c4c52]"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest">PROJECT_DATABASE</span>
                    </div>
                    <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">
                        My <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#7bc5cd] to-[#5d9ca4]">Builds</span>
                    </h2>
                    <p class="text-[#4a7a82] font-medium text-sm mt-1 max-w-lg">
                        Archive your development milestones. Track paid commissions and open-source contributions.
                    </p>
                </div>
                <Button label="INITIALIZE PROJECT" icon="pi pi-plus" class="y2k-button-primary !py-3 !px-6" @click="openNew" />
            </div>

            <div class="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="proj in projects" :key="proj.id"
                     class="group bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(44,76,82,0.1)] transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full">

                    <div class="h-1 bg-gradient-to-r from-[#7bc5cd] via-[#2c4c52] to-[#7bc5cd] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div class="p-6 flex flex-col flex-1">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-3 bg-[#e0f2f1] rounded-2xl text-[#2c4c52]">
                                <i class="pi pi-code text-xl"></i>
                            </div>
                            <span class="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider" :class="getCategoryClass(proj.category)">
                                {{ proj.category }}
                            </span>
                        </div>

                        <h3 class="text-xl font-black text-[#2c4c52] mb-2 leading-tight">{{ proj.title }}</h3>
                        <p class="text-sm text-[#4a7a82] mb-6 line-clamp-3 leading-relaxed flex-1">{{ proj.about }}</p>

                        <div class="flex flex-wrap gap-2 mb-6">
                            <span v-for="(skill, i) in proj.skills.slice(0, 3)" :key="i"
                                  class="text-[10px] font-bold px-2 py-1 rounded bg-white/50 border border-[#2c4c52]/10 text-[#2c4c52] uppercase tracking-wide">
                                {{ skill }}
                            </span>
                            <span v-if="proj.skills.length > 3" class="text-[10px] text-[#4a7a82] self-center font-mono">+{{ proj.skills.length - 3 }}</span>
                        </div>

                        <div class="flex items-center justify-between pt-4 border-t border-[#2c4c52]/10 mt-auto">
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" text rounded class="!w-8 !h-8 !text-[#2c4c52] hover:bg-[#7bc5cd]/20" @click="openPreview(proj)" />
                                <Button icon="pi pi-pencil" text rounded class="!w-8 !h-8 !text-[#2c4c52] hover:bg-[#7bc5cd]/20" @click="editProject(proj)" />
                                <Button icon="pi pi-trash" text rounded class="!w-8 !h-8 !text-red-500 hover:bg-red-50" @click="confirmDelete(proj)" />
                            </div>
                            <span v-if="proj.category === 'Paid'" class="font-mono font-bold text-[#2c4c52]">
                                {{ formatCurrency(proj.value) }}
                            </span>
                        </div>
                    </div>
                </div>

                <div v-if="projects.length === 0" class="col-span-12 text-center py-20 bg-white/30 rounded-3xl border border-dashed border-[#2c4c52]/20">
                    <i class="pi pi-folder text-4xl text-[#2c4c52]/30 mb-4"></i>
                    <p class="font-mono text-[#2c4c52]/50">NO_PROJECTS_FOUND</p>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="projectDialog" :style="{ width: '600px' }" :modal="true" class="y2k-dialog font-sans">
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-pencil text-[#2c4c52]"></i>
                    <span class="font-black text-[#2c4c52] uppercase tracking-tight text-xl">Project Parameters</span>
                </div>
            </template>

            <div class="flex flex-col gap-5 pt-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-2">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Project Title</label>
                        <InputText v-model.trim="project.title" required="true" class="y2k-input w-full" placeholder="e.g. Neural Network UI" />
                        <small class="text-red-500 font-bold text-xs" v-if="submitted && !project.title">REQUIRED_FIELD</small>
                    </div>
                    <div class="space-y-2">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Live Link</label>
                        <InputText v-model.trim="project.link" class="y2k-input w-full" placeholder="https://" />
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Description</label>
                    <Textarea v-model="project.about" rows="3" class="y2k-input w-full" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-2">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Classification</label>
                        <SelectButton v-model="project.category" :options="categories"
                            :pt="{
                                button: ({ context }) => ({
                                    class: context.active ? 'bg-[#2c4c52] text-[#7bc5cd] font-bold border-none' : 'bg-white text-[#2c4c52] border-none'
                                })
                            }"
                        />
                    </div>
                    <div v-if="project.category === 'Paid'" class="space-y-2">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Value (MYR) </label>
                        <InputNumber v-model="project.value" mode="currency" currency="USD" locale="en-MYR" inputClass="y2k-input w-full" />
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Tech Stack</label>
                    <Chips v-model="project.skills" separator="," placeholder="Enter to add..." class="y2k-chips w-full" />
                </div>
                <div class="space-y-2">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Tools</label>
                    <Chips v-model="project.tools" separator="," placeholder="e.g. Figma, Docker" class="y2k-chips w-full" />
                </div>
            </div>

            <template #footer>
                <div class="flex gap-2 justify-end pt-4 border-t border-[#2c4c52]/10">
                    <Button label="ABORT" icon="pi pi-times" text class="!text-[#2c4c52] !font-bold" @click="hideDialog" />
                    <Button label="SAVE ENTRY" icon="pi pi-check" class="y2k-button-primary" @click="saveProject" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="previewDialog" :style="{ width: '50vw' }" :modal="true" :dismissableMask="true" class="y2k-dialog font-sans">
            <template #header>
                <div class="flex items-center gap-3">
                    <span class="text-2xl font-black text-[#2c4c52] uppercase">{{ selectedProject.title }}</span>
                    <span class="px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider" :class="getCategoryClass(selectedProject.category)">
                        {{ selectedProject.category }}
                    </span>
                </div>
            </template>

            <div class="flex flex-col gap-6 pt-4">
                <div class="bg-[#2c4c52] p-8 rounded-2xl text-center relative overflow-hidden group">
                    <div class="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-shine opacity-0 group-hover:opacity-100 pointer-events-none"></div>
                    <i class="pi pi-desktop text-6xl text-[#7bc5cd] mb-4"></i>
                    <div>
                        <a :href="selectedProject.link" target="_blank">
                            <Button label="ACCESS TERMINAL" icon="pi pi-external-link" class="y2k-button-secondary" />
                        </a>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 class="font-mono text-xs font-bold text-[#2c4c52] uppercase mb-2">Manifest</h4>
                        <p class="text-[#4a7a82] leading-relaxed">{{ selectedProject.about }}</p>
                    </div>

                    <div class="flex flex-col gap-4">
                        <div v-if="selectedProject.category === 'Paid'" class="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                            <span class="block text-green-700 text-xs font-mono font-bold uppercase mb-1">Monetary Value</span>
                            <span class="text-2xl font-black text-[#2c4c52]">{{ formatCurrency(selectedProject.value) }}</span>
                        </div>

                        <div>
                            <h4 class="font-mono text-xs font-bold text-[#2c4c52] uppercase mb-2">Modules & Dependencies</h4>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="skill in selectedProject.skills" :key="skill" class="px-2 py-1 bg-[#2c4c52]/5 text-[#2c4c52] text-xs font-bold rounded">
                                    {{ skill }}
                                </span>
                                <span v-for="tool in selectedProject.tools" :key="tool" class="px-2 py-1 bg-[#7bc5cd]/20 text-[#2c4c52] text-xs font-bold rounded">
                                    {{ tool }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>

        <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" :modal="true" class="y2k-dialog">
            <div class="flex items-center gap-4 py-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span class="text-[#2c4c52] font-medium" v-if="project">
                    Are you sure you want to purge <b>{{ project.title }}</b> from the database?
                </span>
            </div>
            <template #footer>
                <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold" @click="deleteDialog = false" />
                <Button label="PURGE" severity="danger" class="!font-bold !rounded-full" @click="deleteProject" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
/* Y2K Input Styles */
.y2k-input {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 2px solid transparent !important;
    border-radius: 12px !important;
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

/* Chips Override */
:deep(.p-chips-token) {
    background: #2c4c52 !important;
    color: #7bc5cd !important;
    font-weight: bold;
    border-radius: 6px;
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
    box-shadow: 0 10px 20px -5px rgba(44, 76, 82, 0.4);
    transition: all 0.3s ease;
}

.y2k-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -5px rgba(44, 76, 82, 0.5);
    filter: brightness(1.1);
}

/* Secondary Button (Wireframe style) */
.y2k-button-secondary {
    background: transparent !important;
    border: 2px solid #7bc5cd !important;
    color: #7bc5cd !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    transition: all 0.3s ease;
}
.y2k-button-secondary:hover {
    background: #7bc5cd !important;
    color: #2c4c52 !important;
}

/* Dialog Overrides for Glass Effect */
:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer) {
    background: #f0fdfc !important; /* Very light teal bg */
    border-color: #2c4c52 !important;
}
:deep(.y2k-dialog) {
    border-radius: 20px !important;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(44, 76, 82, 0.25) !important;
}

@keyframes shine {
    to {
        background-position: 200% center;
    }
}
.animate-shine {
    animation: shine 3s linear infinite;
}
</style>
