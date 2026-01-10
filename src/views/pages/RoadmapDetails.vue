<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useRoadmapStore } from '@/stores/roadmap';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const roadmapStore = useRoadmapStore();
const contentToExport = ref(null);
const isExporting = ref(false);
// --- State Management ---

// Map store state to local computed properties for the template
const isLoading = computed(() => roadmapStore.loading);
const roadmap = computed(() => roadmapStore.currentRoadmap);

// Local UI State
const taskDialog = ref(false);
const isEditing = ref(false);
const currentPhaseId = ref(null);
const taskForm = ref({ id: null, title: '', subtitle: '' });

// --- Lifecycle ---

onMounted(async () => {
    const routeId = route.params.id;

    // 1. Check if we already have this roadmap in memory (from the Loading screen)
    // if (roadmapStore.currentRoadmap && String(roadmapStore.currentRoadmap.id) === String(routeId)) {
    //     console.log("Roadmap already loaded in store, skipping fetch.");
    //     return; // <--- STOP HERE, use existing data
    // }

    // 2. Only fetch if we don't have it (e.g., user refreshed the page)
    if (routeId) {
        try {
            await roadmapStore.fetchRoadmap(routeId);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Roadmap not found.' });
            router.push({ name: 'student-roadmaps' });
        }
    }
});

// --- Computed Stats ---

const totalTasks = computed(() => {
    if (!roadmap.value || !roadmap.value.phases) return 0;
    return roadmap.value.phases.reduce((acc, phase) => {
        return acc + (phase.tasks ? phase.tasks.length : 0);
    }, 0);
});

// --- Actions ---

const completeRoadmap = async () => {
    try {
        // 1. Tell the database this roadmap is finished
        await roadmapStore.updateRoadmapStatus(roadmap.value.id, 'completed');

        toast.add({
            severity: 'success',
            summary: 'PROTOCOL_COMPLETE',
            detail: 'Status updated to completed.',
            life: 3000
        });

        // NOTE: We do NOT redirect anymore.
        // Because roadmap.status is now 'completed', the template's
        // v-if/v-else logic will automatically show the "ARCHIVE" button.

    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: 'Could not reach the registry server.',
            life: 3000
        });
    }
};

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

const handleRowClick = (task) => {
    task.completed = !task.completed;
    toggleTask(task);
};

const startRoadmap = async () => {
    try {
        await roadmapStore.startAndResetRoadmap(roadmap.value.id);

        toast.add({
            severity: 'success',
            summary: 'PROTOCOL_ACTIVATED',
            detail: 'Status: ACTIVE. Progress: 0%. All tasks reset.',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'System Error',
            detail: 'Could not initialize protocol.',
            life: 3000
        });
    }
};

// Keep the computed property pure
const progressPercentage = computed(() => {
    if (!roadmap.value?.phases) return 0;
    let completed = 0;
    let total = 0;

    roadmap.value.phases.forEach(phase => {
        phase.tasks?.forEach(task => {
            total++;
            if (task.completed) completed++;
        });
    });

    return total === 0 ? 0 : Math.round((completed / total) * 100);
});

// Update the store value when the action happens
const toggleTask = async (task) => {
    try {
        // 1. Instantly update the store's progress for the Dashboard (Optimistic UI)
        roadmap.value.progress = progressPercentage.value;

        // 2. Sync Task with Database
        await roadmapStore.updateTaskStatus(task.id, task.completed);

        // 3. Optional: Sync Roadmap Progress with Database
        // await roadmapStore.updateRoadmapProgress(roadmap.value.id, progressPercentage.value);

        toast.add({ severity: 'success', summary: 'Task Progress Update', detail: 'Progress saved.', life: 1000 });
    } catch (error) {
        // Revert if error
        task.completed = !task.completed;
        roadmap.value.progress = progressPercentage.value;
        toast.add({ severity: 'error', summary: 'Update Error', detail: 'Could not save.' });
    }
};
const saveTask = async () => {
    // 1. Basic Validation
    if (!taskForm.value.title.trim()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Task title is required.', life: 2000 });
        return;
    }

    // 2. Locate the specific phase in memory
    const phase = roadmap.value.phases.find(p => p.id === currentPhaseId.value);
    if (!phase) return;

    try {
        if (isEditing.value) {
            // --- SCENARIO A: EDITING EXISTING TASK ---
            
            // 1. Send update to API via Store
            await roadmapStore.updateTaskDetails(taskForm.value.id, {
                title: taskForm.value.title,
                subtitle: taskForm.value.subtitle
            });

            // 2. Update Local State (Optimistic or Response-based)
            const task = phase.tasks.find(t => t.id === taskForm.value.id);
            if (task) {
                task.title = taskForm.value.title;
                task.subtitle = taskForm.value.subtitle;
            }

            toast.add({ severity: 'success', summary: 'Updated', detail: 'Task modified successfully.', life: 2000 });

        } else {
            // --- SCENARIO B: CREATING NEW TASK ---

            // 1. Prepare Payload
            const newTaskPayload = {
                title: taskForm.value.title,
                subtitle: taskForm.value.subtitle,
                order_index: phase.tasks ? phase.tasks.length + 1 : 1
            };

            // 2. Send to API via Store (Store should return the created object with the real DB ID)
            const createdTask = await roadmapStore.addTask(currentPhaseId.value, newTaskPayload);

            // 3. Push the REAL created task (with ID) to local state
            if (!phase.tasks) phase.tasks = [];
            
            // If the store returns the full object, use it. Otherwise fall back to optimistic.
            if (createdTask) {
                phase.tasks.push(createdTask);
            } else {
                // Fallback (Not recommended, but prevents crash if store doesn't return data)
                phase.tasks.push({
                    ...newTaskPayload,
                    id: Date.now(), 
                    completed: false
                });
            }

            toast.add({ severity: 'success', summary: 'Added', detail: 'New task created.', life: 2000 });
        }

        // Close Dialog on success
        taskDialog.value = false;

    } catch (error) {
        console.error(error);
        toast.add({ 
            severity: 'error', 
            summary: 'Save Failed', 
            detail: 'Could not save changes to the server.' 
        });
    }
};
const archiveRoadmap = async () => {
    try {
        // 1. Trigger the store action
        await roadmapStore.updateRoadmapStatus(roadmap.value.id, 'archived');

        toast.add({
            severity: 'info',
            summary: 'Protocol Archived',
            detail: 'Moving to secure registry...',
            life: 3000
        });

        // 2. Redirect to dashboard after a short delay
        setTimeout(() => {
            router.push({ name: 'student-roadmaps' });
        }, 1500);

    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Archive Failed',
            detail: 'System could not update status.',
            life: 3000
        });
    }
};
// --- PDF EXPORT FUNCTION ---
const exportToPDF = async () => {
    if (!contentToExport.value) return;

    // 1. Start Animation
    isExporting.value = true;

    try {
        // 2. Get the ACTUAL full size of the scrollable content
        const element = contentToExport.value;
        const w = element.scrollWidth;
        const h = element.scrollHeight; // <--- This gets the full height

        // 3. Filter to exclude 'no-export' elements
        const filter = (node) => {
            return !node.classList?.contains('no-export');
        };

        // 4. Generate Image with EXPLICIT dimensions
        const imgData = await toPng(element, {
            quality: 0.95,
            pixelRatio: 2, // Keep high res
            width: w,      // Force full width
            height: h,     // Force full height
            backgroundColor: '#e0f2f1',
            filter: filter,
            style: {
                // Critical: Force the cloned node to expand fully
                'transform': 'none', 
                'overflow': 'visible',
                'height': 'auto',
                'max-height': 'none',
                'font-feature-settings': '"liga" 0',
            }
        });

        // 5. Initialize PDF
        // 'p' = portrait, 'mm' = millimeters, 'a4' = standard size
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
        
        // Calculate image dimensions to fit PDF width
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeightInPdf = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = imgHeightInPdf;
        let position = 0;

        // --- Page 1 ---
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfHeight;

        // --- Additional Pages ---
        // Use > 1 to allow a 1mm tolerance and prevent blank last pages
        while (heightLeft > 1) { 
            position = heightLeft - imgHeightInPdf; // This pulls the image up for the next page
            pdf.addPage();
            
            // We print the SAME massive image again, but shifted up (position is negative)
            // Note: We need to recalculate position relative to the top of the new page
            // The standard algorithm for slicing a long image in jsPDF:
            position = -(imgHeightInPdf - heightLeft); 
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
            heightLeft -= pdfHeight;
        }

        // 6. Save
        const filename = `DevNexus_Roadmap_${roadmap.value?.title || 'Export'}.pdf`;
        pdf.save(filename);

        toast.add({ severity: 'success', summary: 'Export Complete', detail: 'PDF downloaded successfully.', life: 3000 });

    } catch (error) {
        console.error('PDF Export Error:', error);
        toast.add({ severity: 'error', summary: 'Export Failed', detail: 'Could not generate PDF. Try reducing content size.', life: 3000 });
    } finally {
        isExporting.value = false;
    }
};
</script>

<template>
    <Toast />
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>

        <div v-if="isLoading" class="relative z-10 p-4 max-w-5xl mx-auto flex flex-col gap-8">

            <div class="bg-white/40 border border-white/60 p-8 rounded-3xl">
                <div class="flex flex-col md:flex-row gap-6">
                    <Skeleton shape="circle" size="4rem" class="mr-2"></Skeleton>
                    <div class="w-full">
                        <Skeleton width="10rem" class="mb-2"></Skeleton>
                        <Skeleton width="60%" height="2rem" class="mb-2"></Skeleton>
                        <Skeleton width="40%" height="1rem"></Skeleton>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div class="lg:col-span-8 space-y-8">
                    <div v-for="n in 3" :key="n" class="relative pl-8">
                        <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-[#2c4c52]/10"></div>

                        <div class="rounded-border border border-surface bg-white/40 p-6 rounded-3xl">
                            <div class="flex mb-4">
                                <Skeleton shape="circle" size="3rem" class="mr-4"></Skeleton>
                                <div>
                                    <Skeleton width="10rem" class="mb-2"></Skeleton>
                                    <Skeleton width="5rem" class="mb-2"></Skeleton>
                                    <Skeleton height=".5rem" width="15rem"></Skeleton>
                                </div>
                            </div>
                            <Skeleton width="100%" height="150px" borderRadius="12px"></Skeleton>
                            <div class="flex justify-between mt-4">
                                <Skeleton width="4rem" height="2rem"></Skeleton>
                                <Skeleton width="4rem" height="2rem"></Skeleton>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-4 space-y-6">
                    <div class="bg-white/40 border border-white/60 p-6 rounded-3xl">
                        <Skeleton width="60%" class="mb-4"></Skeleton>
                        <Skeleton width="100%" height="50px" class="mb-2"></Skeleton>
                        <Skeleton width="100%" height="50px"></Skeleton>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="relative z-10 p-4 max-w-5xl mx-auto flex flex-col gap-8" ref="contentToExport">

            <div class="bg-white/60 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                <div class="absolute -right-10 -top-10 w-64 h-64 bg-[#7bc5cd]/20 rounded-full blur-3xl pointer-events-none"></div>

                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-3">
                            <i class="pi pi-compass text-xs"></i>
                            <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">GENERAL_PATH_V1</span>
                        </div>
                        <h1 class="text-4xl font-black text-[#2c4c52] uppercase tracking-tighter mb-2">{{ roadmap?.title }}</h1>
                        <p class="text-[#4a7a82] font-medium max-w-xl">
                            A structural guide to achieving competency in {{ roadmap?.career_goal }}.
                            Follow the phases sequentially.
                        </p>
                    </div>

                    <div class="flex flex-col items-end gap-4 w-full md:w-auto">
                        <div class="text-right">
                             <div class="text-xs font-mono font-bold text-[#4a7a82] uppercase mb-1">Est. Completion</div>
                             <div class="text-2xl font-black text-[#2c4c52] flex items-center gap-2 justify-end">
                                <i class="pi pi-clock text-lg"></i> {{ roadmap?.estimate }}
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

                    <div v-for="(phase, index) in roadmap.phases" :key="phase.id" class="pdf-item relative pl-8 group">

                        <div class="absolute left-0 top-2 bottom-0 w-0.5 bg-[#2c4c52]/10 group-last:bottom-auto group-last:h-full"></div>
                        <div class="absolute -left-[5px] top-2 w-3 h-3 rounded-full border-2 border-[#2c4c52] bg-white group-hover:bg-[#7bc5cd] group-hover:scale-125 transition-all"></div>

                        <div class="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 hover:shadow-[0_10px_40px_-15px_rgba(44,76,82,0.1)] transition-all duration-300">

                            <div class="mb-6 border-b border-[#2c4c52]/10 pb-4">
                                <h3 class="text-xl font-black text-[#2c4c52] uppercase tracking-tight mb-1">{{ phase.title }}</h3>
                                <p class="text-sm text-[#4a7a82] mb-3">{{ phase.description }}</p>
                                <div class="flex flex-wrap gap-2">
                                    <span v-for="skill in phase.skills" :key="skill"
                                          class="px-2 py-0.5 bg-[#2c4c52]/5 border border-[#2c4c52]/10 rounded text-[10px] font-mono font-bold text-[#2c4c52] uppercase">
                                        {{ skill }}
                                    </span>
                                </div>
                            </div>

                            <div class="space-y-3">
                                <div v-for="task in phase.tasks" :key="task.id"
                                     class="pdf-item group/task flex items-start gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors border border-transparent hover:border-[#2c4c52]/5 cursor-pointer"
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
                                            @click.stop="openEditTask(task, phase.id)"
                                            aria-label="Edit Task" />
                                </div>
                            </div>

                            <div class="mt-4 pt-2 border-t border-dashed border-[#2c4c52]/10">
                                <Button label="ADD TASK" icon="pi pi-plus" text
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

                        <div class="bg-[#2c4c52] text-white p-6 rounded-3xl shadow-xl mb-6">
    <h4 class="font-black !text-white uppercase text-lg mb-2">
        {{ roadmap.status === 'completed' ? 'Protocol Archive' : 'Commit to Path' }}
    </h4>
    <p class="text-sm text-[#7bc5cd] mb-6 font-medium">
        {{ roadmap.status === 'completed'
            ? 'All tasks decoded. Move this protocol to the archive registry?'
            : 'Add this roadmap to your active dashboard.'
        }}
    </p>

    <div class="flex flex-col gap-3">
        <Button
            v-if="roadmap.status === 'completed'"
            label="ARCHIVE PROTOCOL"
            icon="pi pi-box"
            class="y2k-button-secondary-dark w-full !text-xs !py-3 !border-[#7bc5cd]/30"
            @click="archiveRoadmap"
        />

        <Button
            v-else
            label="START LEARNING"
            icon="pi pi-play"
            class="y2k-button-primary-dark w-full !text-xs"
            @click="startRoadmap"
        />

        <Button :label="isExporting ? 'EXPORTING...' : 'EXPORT PDF'" 
                                    :icon="isExporting ? 'pi pi-spin pi-spinner' : 'pi pi-download'"
                                    :disabled="isExporting"
                                    class="y2k-button-secondary-dark w-full !text-xs" 
                                    @click="exportToPDF" />
    </div>
</div>
                        <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl">
                             <h4 class="font-bold text-[#2c4c52] text-sm uppercase mb-4 flex items-center gap-2">
                                <i class="pi pi-info-circle"></i> Roadmap Info
                            </h4>
                            <ul class="space-y-3 text-sm">
                                <li class="flex justify-between">
                                    <span class="text-[#4a7a82]">Level</span>
                                    <span class="font-bold text-[#2c4c52]">{{ roadmap?.level }}</span>
                                </li>
                                <li class="flex justify-between">
                                    <span class="text-[#4a7a82]">Total Tasks</span>
                                    <span class="font-bold text-[#2c4c52]">{{ totalTasks }}</span>
                                </li>
                                <li class="flex justify-between">
                                    <span class="text-[#4a7a82]">Assessment</span>
                                    <span class="font-bold text-green-600">Capstone Projects</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <Dialog v-model:visible="taskDialog" modal :header="isEditing ? 'EDIT PROTOCOL' : 'NEW PROTOCOL'" :style="{ width: '400px' }" class="y2k-dialog">
            <div class="flex flex-col gap-4 pt-4">
                <div class="space-y-1">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Task Title</label>
                    <InputText v-model="taskForm.title" placeholder="e.g. Learn React Hooks" class="y2k-input w-full" autofocus />
                </div>
                <div class="space-y-1">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Subtitle / Description</label>
                    <InputText v-model="taskForm.subtitle" placeholder="Brief description..." class="y2k-input w-full" />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2 pt-4 border-t border-[#2c4c52]/10 mt-2">
                    <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold !text-xs" @click="taskDialog = false" />
                    <Button :label="isEditing ? 'SAVE CHANGES' : 'ADD TASK'" class="y2k-button-primary !text-xs" @click="saveTask" />
                </div>
            </template>
        </Dialog>

    </div>
</template>

<style scoped>
:deep(.p-toast) {
    z-index: 9999 !important;
}
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

/* Edit Button Visibility Logic */
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
