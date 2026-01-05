<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useRoadmapStore } from '@/stores/roadmap';
import Skeleton from 'primevue/skeleton';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const roadmapStore = useRoadmapStore();

// --- State Management ---
const isLoading = computed(() => roadmapStore.loading);
const roadmap = computed(() => roadmapStore.currentRoadmap);

// Local UI State for Editing (Client-side only for now)
const taskDialog = ref(false);
const isEditing = ref(false);
const currentPhaseId = ref(null);
const taskForm = ref({ id: null, title: '', subtitle: '' });

// --- Lifecycle ---
onMounted(async () => {
    const routeId = route.params.id;

    // Optimization: If store already has this roadmap, don't refetch
    if (roadmapStore.currentRoadmap && String(roadmapStore.currentRoadmap.id) === String(routeId)) {
        return;
    }

    if (routeId) {
        try {
            await roadmapStore.fetchRoadmap(routeId);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Academic Roadmap not found.' });
            router.push({ name: 'dashboard' });
        }
    }
});

// --- Computed Stats ---
const totalTasks = computed(() => {
    if (!roadmap.value || !roadmap.value.phases) return 0;
    return roadmap.value.phases.reduce((acc, phase) => acc + (phase.tasks ? phase.tasks.length : 0), 0);
});

const progressPercentage = computed(() => {
    if (!roadmap.value || !roadmap.value.phases) return 0;
    let completed = 0;
    let total = 0;
    roadmap.value.phases.forEach(phase => {
        if (phase.tasks) {
            phase.tasks.forEach(task => {
                total++;
                if (task.completed) completed++;
            });
        }
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
});

// --- Actions ---

const openAddTask = (phaseId) => {
    isEditing.value = false;
    currentPhaseId.value = phaseId;
    taskForm.value = { id: null, title: '', subtitle: '' };
    taskDialog.value = true;
};

const openEditTask = (task, phaseId) => {
    isEditing.value = true;
    currentPhaseId.value = phaseId;
    taskForm.value = { ...task };
    taskDialog.value = true;
};

const saveTask = () => {
    if (!taskForm.value.title.trim()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Title is required.', life: 2000 });
        return;
    }
    const phase = roadmap.value.phases.find(p => p.id === currentPhaseId.value);
    if (!phase) return;

    if (isEditing.value) {
        const taskIndex = phase.tasks.findIndex(t => t.id === taskForm.value.id);
        if (taskIndex !== -1) {
            // Update in local store state
            phase.tasks[taskIndex].title = taskForm.value.title;
            phase.tasks[taskIndex].subtitle = taskForm.value.subtitle;
            toast.add({ severity: 'success', summary: 'Updated', detail: 'Syllabus updated.', life: 2000 });
        }
    } else {
        if (!phase.tasks) phase.tasks = [];
        phase.tasks.push({
            id: Date.now(),
            title: taskForm.value.title,
            subtitle: taskForm.value.subtitle,
            completed: false
        });
        toast.add({ severity: 'success', summary: 'Added', detail: 'New topic added.', life: 2000 });
    }
    taskDialog.value = false;
};

const handleRowClick = (task) => {
    task.completed = !task.completed;
    toggleTask(task);
};

const toggleTask = (task) => {
    if (task.completed) {
        if (progressPercentage.value === 100) {
            toast.add({ severity: 'success', summary: 'All Tasks Done', detail: 'You are ready to complete the course!', life: 3000 });
        } else {
            toast.add({ severity: 'success', summary: 'Progress Saved', detail: 'Marked as complete.', life: 1000 });
        }
    }
};

const startRoadmap = () => {
    toast.add({ severity: 'info', summary: 'Course Started', detail: 'Course synced to dashboard.', life: 3000 });
};

const completeRoadmap = () => {
    toast.add({ severity: 'success', summary: 'Course Completed! 🎉', detail: 'Excellent work.', life: 3000 });
    setTimeout(() => { router.push({ name: 'dashboard' }); }, 1500);
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>

        <div v-if="isLoading" class="relative z-10 p-4 max-w-5xl mx-auto flex flex-col gap-8">
             <div class="bg-white/40 border border-white/60 p-8 rounded-3xl">
                <div class="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div class="w-full">
                        <Skeleton width="8rem" height="1rem" class="mb-4"></Skeleton>
                        <Skeleton width="60%" height="3rem" class="mb-4"></Skeleton>
                        <div class="flex gap-3 mb-4">
                            <Skeleton width="12rem" height="2rem" borderRadius="12px"></Skeleton>
                        </div>
                        <Skeleton width="80%" height="1rem"></Skeleton>
                    </div>
                    <div class="flex flex-col items-end gap-2 min-w-[150px]">
                        <Skeleton width="6rem" height="1rem"></Skeleton>
                        <Skeleton width="8rem" height="2rem"></Skeleton>
                        <Skeleton width="100%" height="0.5rem" class="mt-2" borderRadius="99px"></Skeleton>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div class="lg:col-span-8 space-y-8">
                    <div v-for="n in 3" :key="n" class="relative pl-8">
                         <div class="bg-white/40 border border-white/60 rounded-3xl p-6">
                             <Skeleton width="40%" height="1.5rem" class="mb-2"></Skeleton>
                             <Skeleton width="60%" height="1rem" class="mb-4"></Skeleton>
                             <div class="space-y-3">
                                 <Skeleton v-for="i in 2" :key="i" width="100%" height="3rem" borderRadius="12px"></Skeleton>
                             </div>
                         </div>
                    </div>
                </div>
                <div class="lg:col-span-4 space-y-6">
                    <Skeleton width="100%" height="15rem" borderRadius="24px"></Skeleton>
                    <Skeleton width="100%" height="10rem" borderRadius="24px"></Skeleton>
                </div>
            </div>
        </div>

        <div v-else-if="roadmap" class="relative z-10 p-4 max-w-5xl mx-auto flex flex-col gap-8">

            <div class="bg-white/60 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                <div class="absolute -right-10 -top-10 w-64 h-64 bg-[#7bc5cd]/20 rounded-full blur-3xl pointer-events-none"></div>

                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                    <div class="flex-1">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-3">
                            <i class="pi pi-graduation-cap text-xs"></i>
                            <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">ACADEMIC_PATH_V2</span>
                        </div>
                        <h1 class="text-4xl font-black text-[#2c4c52] uppercase tracking-tighter mb-3">{{ roadmap.role || roadmap.title }}</h1>

                        <div class="flex items-center gap-3 mb-4">
                            <div class="flex items-center gap-2 text-[#4a7a82] bg-white/80 px-3 py-1.5 rounded-xl border border-[#2c4c52]/10 shadow-sm">
                                <i class="pi pi-book text-[#7bc5cd]"></i>
                                <span class="text-sm font-bold">
                                    Aligned Course: <span class="text-[#2c4c52] uppercase">{{ roadmap.courseCode || 'N/A' }} - {{ roadmap.courseName || 'General Syllabus' }}</span>
                                </span>
                            </div>
                        </div>

                        <p class="text-[#4a7a82] font-medium max-w-xl text-sm leading-relaxed">
                            This roadmap maps your academic syllabus to industry requirements.
                            Mastering these course topics directly builds the <span class="font-bold text-[#2c4c52]">skills employers hire for</span>.
                        </p>
                    </div>

                    <div class="flex flex-col items-end gap-4 w-full md:w-auto">
                        <div class="text-right">
                             <div class="text-xs font-mono font-bold text-[#4a7a82] uppercase mb-1">Course Length</div>
                             <div class="text-2xl font-black text-[#2c4c52] flex items-center gap-2 justify-end">
                                <i class="pi pi-calendar-times text-lg"></i> {{ roadmap.estimate || '14 Weeks' }}
                             </div>
                        </div>
                        <div class="w-full md:w-48">
                            <div class="flex justify-between text-xs font-bold mb-1">
                                <span>Progress</span>
                                <span>{{ progressPercentage }}%</span>
                            </div>
                            <div class="h-2 w-full bg-[#2c4c52]/10 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-[#7bc5cd] to-[#2c4c52] transition-all duration-500"
                                     :style="{ width: `${progressPercentage}%` }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div class="lg:col-span-8 space-y-8">
                    <div v-for="(phase, index) in roadmap.phases" :key="phase.id || index" class="relative pl-8 group">

                        <div class="absolute left-0 top-2 bottom-0 w-0.5 bg-[#2c4c52]/10 group-last:bottom-auto group-last:h-full"></div>
                        <div class="absolute -left-[5px] top-2 w-3 h-3 rounded-full border-2 border-[#2c4c52] bg-white group-hover:bg-[#7bc5cd] group-hover:scale-125 transition-all"></div>

                        <div class="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 hover:shadow-[0_10px_40px_-15px_rgba(44,76,82,0.1)] transition-all duration-300">

                            <div class="mb-6 border-b border-[#2c4c52]/10 pb-4">
                                <h3 class="text-xl font-black text-[#2c4c52] uppercase tracking-tight mb-1">{{ phase.title }}</h3>
                                <p class="text-sm text-[#4a7a82] mb-3">{{ phase.description }}</p>

                                <div class="flex flex-wrap gap-2">
                                    <div class="flex items-center gap-2 mr-2">
                                        <i class="pi pi-briefcase text-[10px] text-[#2c4c52]/50"></i>
                                        <span class="text-[10px] font-bold text-[#2c4c52]/50 uppercase tracking-wider">Industry Skills:</span>
                                    </div>
                                    <span v-for="skill in phase.skills" :key="skill"
                                          class="px-2 py-0.5 bg-[#2c4c52] text-white border border-[#2c4c52] rounded text-[10px] font-mono font-bold uppercase shadow-sm">
                                        {{ skill }}
                                    </span>
                                </div>
                            </div>

                            <div class="space-y-3">
                                <div v-for="task in phase.tasks" :key="task.id"
                                     class="group/task flex items-start gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors border border-transparent hover:border-[#2c4c52]/5 cursor-pointer"
                                     @click="handleRowClick(task)">

                                    <div class="pt-0.5" @click.stop>
                                        <Checkbox v-model="task.completed" :binary="true" class="y2k-checkbox" @change="toggleTask(task)" />
                                    </div>

                                    <div class="flex-1">
                                        <div class="text-sm font-bold text-[#2c4c52] transition-all duration-300"
                                             :class="{'line-through opacity-50': task.completed}">
                                            {{ task.title }}
                                        </div>
                                        <div class="text-xs text-[#4a7a82] mt-0.5"
                                             :class="{'opacity-50': task.completed}">
                                            {{ task.subtitle }}
                                        </div>
                                    </div>

                                    <Button icon="pi pi-pencil" text rounded
                                            class="edit-btn !w-6 !h-6 !text-[#2c4c52]/50 hover:!text-[#2c4c52]"
                                            @click.stop="openEditTask(task, phase.id)" />
                                </div>
                            </div>

                            <div class="mt-4 pt-2 border-t border-dashed border-[#2c4c52]/10">
                                <Button label="ADD ITEM" icon="pi pi-plus" text
                                        class="!text-xs !font-bold !text-[#7bc5cd] hover:bg-[#7bc5cd]/10 !p-1 !px-3"
                                        @click="openAddTask(phase.id)" />
                            </div>

                        </div>
                    </div>
                </div>

                <div class="lg:col-span-4 space-y-6">
                    <div class="sticky top-6">

                        <div v-if="progressPercentage === 100" class="bg-green-600 text-white p-6 rounded-3xl shadow-xl mb-6 animate-fade-in transition-all">
                             <h4 class="font-black !text-white uppercase text-lg mb-2 flex items-center gap-2">
                                <i class="pi pi-verified text-xl"></i> All Systems Go
                             </h4>
                             <p class="text-sm text-green-100 mb-6 font-medium">
                                 You have successfully completed all topics in this course.
                             </p>
                             <Button label="COMPLETE ROADMAP" icon="pi pi-check-circle"
                                     class="y2k-button-success-dark w-full !text-xs !py-3"
                                     @click="completeRoadmap" />
                        </div>

                        <div v-else class="bg-[#2c4c52] text-white p-6 rounded-3xl shadow-xl mb-6 transition-all">
                            <h4 class="font-black !text-white uppercase text-lg mb-2">Sync Course</h4>
                            <p class="text-sm text-[#7bc5cd] mb-6">Align this roadmap with your university schedule.</p>
                            <div class="flex flex-col gap-3">
                                <Button label="START COURSE" icon="pi pi-play" class="y2k-button-primary-dark w-full !text-xs" @click="startRoadmap" />
                                <Button label="DOWNLOAD SYLLABUS" icon="pi pi-file-pdf" class="y2k-button-secondary-dark w-full !text-xs" />
                            </div>
                        </div>

                        <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl">
                             <h4 class="font-bold text-[#2c4c52] text-sm uppercase mb-4 flex items-center gap-2">
                                <i class="pi pi-info-circle"></i> Course Details
                             </h4>
                             <ul class="space-y-3 text-sm">
                                <li class="flex justify-between">
                                    <span class="text-[#4a7a82]">Level</span>
                                    <span class="font-bold text-[#2c4c52]">{{ roadmap.level || 'Intermediate' }}</span>
                                </li>
                                <li class="flex justify-between">
                                    <span class="text-[#4a7a82]">Total Topics</span>
                                    <span class="font-bold text-[#2c4c52]">{{ totalTasks }}</span>
                                </li>
                                <li class="flex justify-between">
                                    <span class="text-[#4a7a82]">Assessment</span>
                                    <span class="font-bold text-green-600">Coursework + Exam</span>
                                </li>
                             </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <Dialog v-model:visible="taskDialog" modal :header="isEditing ? 'EDIT TOPIC' : 'ADD TOPIC'" :style="{ width: '400px' }" class="y2k-dialog">
            <div class="flex flex-col gap-4 pt-4">
                <div class="space-y-1">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Topic Title</label>
                    <InputText v-model="taskForm.title" placeholder="e.g. Lab 4: API Integration" class="y2k-input w-full" autofocus />
                </div>
                <div class="space-y-1">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Description / Outcome</label>
                    <InputText v-model="taskForm.subtitle" placeholder="What will you learn?" class="y2k-input w-full" />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2 pt-4 border-t border-[#2c4c52]/10 mt-2">
                    <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold !text-xs" @click="taskDialog = false" />
                    <Button :label="isEditing ? 'SAVE' : 'ADD'" class="y2k-button-primary !text-xs" @click="saveTask" />
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
}

.y2k-button-primary-dark {
    background: #7bc5cd !important;
    border: 1px solid #7bc5cd !important;
    color: #1a3338 !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    box-shadow: 0 4px 15px rgba(123, 197, 205, 0.3);
}
.y2k-button-primary-dark:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

.y2k-button-secondary-dark {
    background: transparent !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
    color: #ffffff !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
}
.y2k-button-secondary-dark:hover {
    background: rgba(255,255,255,0.1) !important;
}

/* Success Button */
.y2k-button-success-dark {
    background: #ffffff !important;
    border: 1px solid #ffffff !important;
    color: #166534 !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.y2k-button-success-dark:hover {
    filter: brightness(0.95);
    transform: translateY(-1px);
}

/* Edit Button Logic */
.edit-btn {
    opacity: 1;
    transition: opacity 0.2s ease;
}
@media (hover: hover) {
    .edit-btn {
        opacity: 0;
    }
    .group\/task:hover .edit-btn {
        opacity: 1;
    }
}

.y2k-input {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 1px solid rgba(44, 76, 82, 0.2) !important;
    border-radius: 8px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
}
.y2k-input:focus {
    background: #ffffff !important;
    border-color: #7bc5cd !important;
    box-shadow: 0 0 0 2px rgba(123, 197, 205, 0.2) !important;
}

/* Checkbox */
:deep(.y2k-checkbox .p-checkbox-box) {
    border-color: #2c4c52 !important;
    background: transparent !important;
    border-radius: 4px;
}
:deep(.y2k-checkbox.p-checkbox-checked .p-checkbox-box) {
    background: #2c4c52 !important;
    border-color: #2c4c52 !important;
}
:deep(.y2k-checkbox .p-checkbox-icon) {
    color: #7bc5cd !important;
}

/* Dialog */
:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer) {
    background: #ffffff !important;
    color: #2c4c52;
}
:deep(.y2k-dialog .p-dialog-header) {
    border-bottom: 1px solid rgba(44, 76, 82, 0.1);
}
:deep(.y2k-dialog .p-dialog-title) {
    font-weight: 900;
    font-family: monospace;
    letter-spacing: -0.05em;
}
</style>
