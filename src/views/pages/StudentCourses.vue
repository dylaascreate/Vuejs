<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

// --- Mock Data ---
const stats = ref({
    gpa: 3.85,
    creditsEarned: 45,
    activeCourses: 4
});

const courses = ref([
    {
        id: 101,
        code: 'CS305',
        title: 'Advanced Algorithms',
        instructor: 'Dr. Alan Turing',
        progress: 75,
        totalModules: 12,
        completedModules: 9,
        semester: 'Sem 1 2025',
        tags: ['Core', 'Hard']
    },
    {
        id: 102,
        code: 'WEB202',
        title: 'Vue.js Frameworks',
        instructor: 'Prof. Ada Lovelace',
        progress: 45,
        totalModules: 20,
        completedModules: 9,
        semester: 'Sem 1 2025',
        tags: ['Elective']
    },
    {
        id: 103,
        code: 'UI101',
        title: 'User Interface Design',
        instructor: 'Dr. Grace Hopper',
        progress: 10,
        totalModules: 15,
        completedModules: 1.5,
        semester: 'Sem 1 2025',
        tags: ['Design']
    },
    {
        id: 104,
        code: 'DB400',
        title: 'Database Architectures',
        instructor: 'Dr. Edgar Codd',
        progress: 100,
        totalModules: 10,
        completedModules: 10,
        semester: 'Sem 2 2024',
        tags: ['Core']
    }
]);

const searchQuery = ref('');
const activeTab = ref('Active'); // Active, Completed
const tabs = ['Active', 'Completed'];

// --- Computed ---
const filteredCourses = computed(() => {
    let result = courses.value;

    // Filter by Tab
    if (activeTab.value === 'Active') {
        result = result.filter(c => c.progress < 100);
    } else {
        result = result.filter(c => c.progress === 100);
    }

    // Filter by Search
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(c =>
            c.title.toLowerCase().includes(query) ||
            c.code.toLowerCase().includes(query)
        );
    }
    return result;
});

// --- Actions ---
const continueCourse = (courseId) => {
    // router.push(`/student/course/${courseId}`);
    toast.add({ severity: 'info', summary: 'Loading Module', detail: 'Accessing Learning Management System...', life: 2000 });
};

const getProgressBarColor = (progress) => {
    if (progress === 100) return '#4ade80'; // Green
    if (progress < 20) return '#f87171'; // Red
    return '#7bc5cd'; // Teal
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>
        <div class="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#7bc5cd] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        <div class="relative z-10 p-4 max-w-7xl mx-auto flex flex-col gap-8">

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div class="md:col-span-8">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                        <i class="pi pi-book text-xs"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">STUDENT_PORTAL_V2</span>
                    </div>
                    <h2 class="text-4xl font-black text-[#2c4c52] uppercase tracking-tighter mb-2">My Curriculum</h2>
                    <p class="text-[#4a7a82] max-w-xl font-medium">
                        Track your academic velocity. Manage enrollments and continue your learning protocols.
                    </p>
                </div>

                <div class="md:col-span-4 grid grid-cols-3 gap-3">
                    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-3 rounded-2xl text-center">
                        <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">GPA</div>
                        <div class="text-2xl font-black text-[#2c4c52]">{{ stats.gpa }}</div>
                    </div>
                    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-3 rounded-2xl text-center">
                        <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">Credits</div>
                        <div class="text-2xl font-black text-[#2c4c52]">{{ stats.creditsEarned }}</div>
                    </div>
                    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-3 rounded-2xl text-center">
                        <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">Active</div>
                        <div class="text-2xl font-black text-[#2c4c52]">{{ stats.activeCourses }}</div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/30 p-2 rounded-2xl border border-white/40">
                <div class="flex bg-[#2c4c52]/5 p-1 rounded-xl">
                    <button v-for="tab in tabs" :key="tab"
                        @click="activeTab = tab"
                        class="px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 uppercase tracking-wider"
                        :class="activeTab === tab ? 'bg-white text-[#2c4c52] shadow-sm' : 'text-[#4a7a82] hover:bg-white/50'">
                        {{ tab }}
                    </button>
                </div>

                <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="searchQuery" placeholder="Search Modules..." class="y2k-input !w-64 !py-2 !text-xs" />
                </IconField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="course in filteredCourses" :key="course.id"
                     class="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 hover:shadow-[0_20px_40px_-15px_rgba(44,76,82,0.1)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">

                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7bc5cd] via-[#2c4c52] to-[#7bc5cd] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div class="flex justify-between items-start mb-4">
                        <div class="flex flex-col">
                            <span class="font-mono text-xs font-bold text-[#7bc5cd] bg-[#2c4c52] px-2 py-1 rounded w-fit mb-1">{{ course.code }}</span>
                            <span class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">{{ course.semester }}</span>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center border border-white">
                            <i class="pi pi-bookmark text-[#2c4c52] text-xs"></i>
                        </div>
                    </div>

                    <h3 class="text-xl font-black text-[#2c4c52] mb-1 leading-tight">{{ course.title }}</h3>
                    <p class="text-xs font-bold text-[#4a7a82] mb-4 flex items-center gap-1">
                        <i class="pi pi-user text-[10px]"></i> {{ course.instructor }}
                    </p>

                    <div class="flex gap-2 mb-6">
                        <span v-for="tag in course.tags" :key="tag" class="px-2 py-0.5 border border-[#2c4c52]/20 rounded text-[10px] font-bold text-[#2c4c52]/70 uppercase">
                            {{ tag }}
                        </span>
                    </div>

                    <div class="mt-auto">
                        <div class="flex justify-between items-end mb-2 text-xs font-mono font-bold text-[#2c4c52]">
                            <span>{{ course.progress }}% Complete</span>
                            <span class="text-[#4a7a82]">{{ course.completedModules }}/{{ course.totalModules }} Modules</span>
                        </div>
                        <div class="h-2 w-full bg-[#2c4c52]/10 rounded-full overflow-hidden mb-6">
                            <div class="h-full rounded-full transition-all duration-1000 ease-out"
                                 :style="{ width: `${course.progress}%`, backgroundColor: getProgressBarColor(course.progress) }">
                            </div>
                        </div>

                        <Button
                            :label="course.progress === 100 ? 'REVIEW COURSE' : 'CONTINUE LEARNING'"
                            :icon="course.progress === 100 ? 'pi pi-check' : 'pi pi-arrow-right'"
                            iconPos="right"
                            class="w-full !text-xs"
                            :class="course.progress === 100 ? 'y2k-button-secondary' : 'y2k-button-primary'"
                            @click="continueCourse(course.id)"
                         />
                    </div>
                </div>

                <div v-if="filteredCourses.length === 0" class="col-span-full py-20 text-center border-2 border-dashed border-[#2c4c52]/10 rounded-3xl bg-white/20">
                    <i class="pi pi-folder-open text-4xl text-[#2c4c52]/30 mb-4"></i>
                    <p class="font-mono text-[#2c4c52]/50 font-bold uppercase">No Modules Found</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Y2K Utilities */
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

.y2k-button-secondary {
    background: transparent !important;
    border: 2px solid #2c4c52 !important;
    color: #2c4c52 !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    transition: all 0.3s ease;
}
.y2k-button-secondary:hover {
    background: #2c4c52 !important;
    color: #7bc5cd !important;
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
</style>
