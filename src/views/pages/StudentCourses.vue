<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useCourseStore } from '@/stores/course';
import { storeToRefs } from 'pinia';
import Skeleton from 'primevue/skeleton';

const toast = useToast();
const courseStore = useCourseStore();

// Access state via storeToRefs for reactivity
const { myCourses, courseCatalog, loading: isLoading } = storeToRefs(courseStore); // [FIX] Ensure you use the correct loading ref from your store

// --- UI Components ---
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// --- Local State ---
const searchQuery = ref('');
const activeTab = ref('All');
const tabs = ['All', 'In-Progress', 'Completed'];
const selectedCourseId = ref(null);

// Status options for the card dropdowns
const statusOptions = [
    { label: 'Not Started', value: 'not_started' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' }
];

// --- Lifecycle ---
onMounted(async () => {
    await Promise.all([
        courseStore.fetchCatalog(),
        courseStore.fetchUserCourses()
    ]);
});

// --- Computed Stats ---
const stats = computed(() => {
    const courses = myCourses.value || [];
    const completed = courses.filter(c => c.pivot?.status === 'completed');
    const inProgress = courses.filter(c => c.pivot?.status === 'in_progress');

    const totalGrade = completed.reduce((sum, c) => {
        return sum + (parseFloat(c.pivot?.grade) || 0);
    }, 0);

    const gpa = completed.length ? (totalGrade / completed.length).toFixed(2) : '0.00';

    return {
        gpa: gpa,
        creditsEarned: completed.length * 3,
        activeCourses: inProgress.length
    };
});

// --- Filter Logic ---
const filteredCourses = computed(() => {
    let result = myCourses.value || [];

    if (activeTab.value !== 'All') {
        const targetStatus = activeTab.value === 'In-Progress' ? 'in_progress' : 'completed';
        result = result.filter(c => c.pivot?.status === targetStatus);
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(c =>
            c.course_name.toLowerCase().includes(query) ||
            c.course_code.toLowerCase().includes(query)
        );
    }
    return result;
});

// Filter available courses
const availableOptions = computed(() => {
    const enrolledIds = (myCourses.value || []).map(c => c.id);
    return (courseCatalog.value || []).filter(c => !enrolledIds.includes(c.id));
});

// --- Actions ---
const handleAddCourse = async () => {
    if (!selectedCourseId.value) return;
    try {
        await courseStore.enrollCourse(selectedCourseId.value);
        toast.add({ severity: 'success', summary: 'Enrolled', detail: 'Course added to curriculum', life: 3000 });
        selectedCourseId.value = null;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Enrollment failed. Already enrolled?', life: 3000 });
    }
};

const handleUpdate = async (course) => {
    try {
        await courseStore.updateCourseProgress(course.id, {
            status: course.pivot.status,
            grade: course.pivot.grade
        });
        toast.add({ severity: 'success', summary: 'Updated', detail: 'Academic record saved', life: 2000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Update failed', life: 2000 });
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'completed': return 'success';
        case 'in_progress': return 'warning';
        default: return 'secondary';
    }
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="absolute top-10 right-10 w-[30vw] h-[30vw] bg-[#7bc5cd] rounded-full blur-[80px] opacity-20 pointer-events-none animate-pulse"></div>
        <div class="absolute bottom-10 left-10 w-[30vw] h-[30vw] bg-[#a7e2e8] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div v-if="isLoading" class="relative z-10 p-4 max-w-7xl mx-auto flex flex-col gap-8">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div class="md:col-span-8 space-y-3">
                    <Skeleton width="12rem" height="1.5rem" borderRadius="20px"></Skeleton>
                    <Skeleton width="20rem" height="3.5rem"></Skeleton>
                    <Skeleton width="100%" height="1rem"></Skeleton>
                </div>
                <div class="md:col-span-4 grid grid-cols-3 gap-3">
                    <Skeleton v-for="i in 3" :key="i" height="4.5rem" borderRadius="1rem" class="bg-white/40"></Skeleton>
                </div>
            </div>
            <div class="bg-white/40 border border-white/60 rounded-3xl p-6 shadow-sm">
                <div class="flex flex-col md:flex-row gap-4 items-end">
                    <div class="flex-1 w-full space-y-2">
                        <Skeleton width="100px" height="1rem"></Skeleton>
                        <Skeleton width="100%" height="3rem" borderRadius="12px"></Skeleton>
                    </div>
                    <Skeleton width="140px" height="3rem" borderRadius="9999px"></Skeleton>
                </div>
            </div>
            <div class="flex flex-col md:flex-row justify-between gap-4">
                <Skeleton width="300px" height="2.5rem" borderRadius="12px"></Skeleton>
                <Skeleton width="250px" height="2.5rem" borderRadius="12px"></Skeleton>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i" class="bg-white/40 border border-white/60 rounded-3xl p-6 h-72 flex flex-col gap-4">
                    <div class="flex justify-between">
                        <Skeleton width="60px" height="1.5rem"></Skeleton>
                        <Skeleton width="80px" height="1.5rem"></Skeleton>
                    </div>
                    <Skeleton width="100%" height="2rem" class="mt-2"></Skeleton>
                    <div class="mt-auto space-y-3 p-4 bg-white/20 rounded-xl">
                        <div class="flex gap-4">
                            <Skeleton width="50%" height="1.5rem"></Skeleton>
                            <Skeleton width="50%" height="1.5rem"></Skeleton>
                        </div>
                        <Skeleton width="100%" height="2.5rem"></Skeleton>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="relative z-10 p-4 max-w-7xl mx-auto flex flex-col gap-8">

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div class="md:col-span-8">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                        <i class="pi pi-book text-xs"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">STUDENT_PORTAL_V2</span>
                    </div>
                    <h2 class="text-4xl font-black text-[#2c4c52] uppercase tracking-tighter mb-2">My Curriculum</h2>
                    <p class="text-[#4a7a82] max-w-xl font-medium">
                        Manage enrollments and update your academic records directly.
                    </p>
                </div>

                <div class="md:col-span-4 grid grid-cols-3 gap-3">
                    <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-3 rounded-2xl text-center shadow-sm">
                        <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">GPA</div>
                        <div class="text-2xl font-black text-[#2c4c52]">{{ stats.gpa }}</div>
                    </div>
                    <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-3 rounded-2xl text-center shadow-sm">
                        <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">Credits</div>
                        <div class="text-2xl font-black text-[#2c4c52]">{{ stats.creditsEarned }}</div>
                    </div>
                    <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-3 rounded-2xl text-center shadow-sm">
                        <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">Active</div>
                        <div class="text-2xl font-black text-[#2c4c52]">{{ stats.activeCourses }}</div>
                    </div>
                </div>
            </div>

            <div class="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
                <div class="flex flex-col md:flex-row gap-4 items-end">
                    <div class="flex-1 w-full space-y-2">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Select New Module</label>
                        <Dropdown
                            v-model="selectedCourseId"
                            :options="availableOptions"
                            optionLabel="course_name"
                            optionValue="id"
                            placeholder="Browse Database..."
                            class="y2k-dropdown w-full"
                            filter
                        >
                            <template #option="slotProps">
                                <div class="flex items-center">
                                    <span class="font-bold mr-2">{{ slotProps.option.course_code }}</span>
                                    <span>{{ slotProps.option.course_name }}</span>
                                </div>
                            </template>
                        </Dropdown>
                    </div>
                    <Button
                        label="ENROLL NOW"
                        icon="pi pi-plus"
                        class="y2k-button-primary !py-3 !px-6"
                        @click="handleAddCourse"
                        :disabled="!selectedCourseId"
                    />
                </div>
            </div>

            <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/30 p-2 rounded-2xl border border-white/40 backdrop-blur-sm">
                <div class="flex bg-[#2c4c52]/5 p-1 rounded-xl">
                    <button v-for="tab in tabs" :key="tab"
                            @click="activeTab = tab"
                            class="px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 uppercase tracking-wider"
                            :class="activeTab === tab ? 'bg-white text-[#2c4c52] shadow-sm' : 'text-[#4a7a82] hover:bg-white/50'">
                        {{ tab }}
                    </button>
                </div>

                <div class="w-full md:w-auto">
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search text-[#2c4c52]/50" />
                        </InputIcon>
                        <InputText v-model="searchQuery" placeholder="Search Modules..." class="y2k-input !py-2 !text-xs w-full md:w-64" />
                    </IconField>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="course in filteredCourses" :key="course.id"
                     class="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 hover:shadow-[0_20px_40px_-15px_rgba(44,76,82,0.1)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col">

                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7bc5cd] via-[#2c4c52] to-[#7bc5cd] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div class="flex justify-between items-start mb-4">
                        <span class="font-mono text-xs font-bold text-[#7bc5cd] bg-[#2c4c52] px-2 py-1 rounded w-fit">
                            {{ course.course_code }}
                        </span>
                        <Tag :value="course.pivot?.status?.replace('_', ' ')" :severity="getStatusSeverity(course.pivot?.status)" class="!uppercase !text-[10px] !font-bold" />
                    </div>

                    <h3 class="text-xl font-black text-[#2c4c52] mb-6 leading-tight min-h-[56px]">
                        {{ course.course_name }}
                    </h3>

                    <div class="mt-auto bg-white/50 rounded-xl p-4 border border-[#2c4c52]/10">
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <div class="space-y-1">
                                <label class="text-[9px] font-bold text-[#4a7a82] uppercase block">Status</label>
                                <Dropdown
                                    v-if="course.pivot"
                                    v-model="course.pivot.status"
                                    :options="statusOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="y2k-dropdown !h-8 !text-xs w-full"
                                    :pt="{ input: { class: '!py-1 !px-2 !text-xs' } }"
                                />
                            </div>
                            <div class="space-y-1">
                                <label class="text-[9px] font-bold text-[#4a7a82] uppercase block">Grade</label>
                                <InputText
                                    v-if="course.pivot"
                                    v-model="course.pivot.grade"
                                    placeholder="-"
                                    class="y2k-input !h-8 !py-1 !px-2 !text-xs w-full text-center"
                                />
                            </div>
                        </div>

                        <Button
                            label="UPDATE RECORD"
                            icon="pi pi-save"
                            class="y2k-button-secondary w-full !text-xs !py-2"
                            @click="handleUpdate(course)"
                        />
                    </div>
                </div>

                <div v-if="filteredCourses.length === 0" class="col-span-full py-20 text-center border-2 border-dashed border-[#2c4c52]/10 rounded-3xl bg-white/20">
                    <i class="pi pi-folder-open text-4xl text-[#2c4c52]/30 mb-4"></i>
                    <p class="font-mono text-[#2c4c52]/50 font-bold uppercase">No Records Found</p>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* Reuse the exact styles from RoadmapGenerator */

/* Inputs & Textareas */
:deep(.y2k-input) {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 2px solid transparent !important;
    border-radius: 12px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
}
:deep(.y2k-input:focus), :deep(.y2k-input:hover) {
    background: #ffffff !important;
    border-color: #7bc5cd !important;
    box-shadow: 0 0 0 2px rgba(123, 197, 205, 0.2) !important;
}

/* Dropdown overrides */
:deep(.y2k-dropdown) {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 2px solid transparent !important;
    border-radius: 12px !important;
}
:deep(.y2k-dropdown:hover), :deep(.y2k-dropdown.p-focus) {
    border-color: #7bc5cd !important;
    background: white !important;
}

/* Primary Button */
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

/* Secondary Button (for cards) */
.y2k-button-secondary {
    background: rgba(44, 76, 82, 0.1) !important;
    border: 1px solid transparent !important;
    color: #2c4c52 !important;
    font-weight: 800 !important;
    border-radius: 10px !important;
    transition: all 0.3s ease;
}
.y2k-button-secondary:hover {
    background: #2c4c52 !important;
    color: #7bc5cd !important;
}
</style>
