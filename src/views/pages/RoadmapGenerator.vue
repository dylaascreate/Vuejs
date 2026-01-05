<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const roadmapType = ref('General');
const roadmapOptions = ['General', 'Academic'];

// Form Inputs
const query = ref('');
const roadmapLevel = ref(null);

// From User DB
const targetCareer = ref('');
const major = ref('Software Engineering');

const levels = ref([
    { name: 'Beginner', code: 'BEG' },
    { name: 'Intermediate', code: 'INT' },
    { name: 'Advanced', code: 'ADV' }
]);

// Preview Logic
const previewTitle = computed(() => {
    return roadmapType.value === 'General'
        ? `Skill-Based Protocol: ${targetCareer.value || 'Unknown Target'}`
        : `University Sync Protocol: ${major.value || 'Unknown Major'}`;
});

const previewDescription = computed(() => {
    if (roadmapType.value === 'General') {
        return "Direct-to-market skill acquisition. Bypasses academic prerequisites to focus on rapid employability velocity.";
    } else {
        return "Hybrid academic integration. synchronizes university curriculum with industry demands for optimal grade/skill ratio.";
    }
});

const previewSteps = computed(() => {
    // 1. General Roadmap: Skill/Career Progression (e.g. "Become a Frontend Dev")
    if (roadmapType.value === 'General') {
        return [
            { label: 'Fundamentals : Logic & Syntax', icon: 'pi pi-box' },
            { label: 'Core Tools : Git, CLI, IDEs', icon: 'pi pi-cog' },
            { label: 'Tech Stack : Frameworks & DBs', icon: 'pi pi-code' },
            { label: 'Real Projects : Portfolio Work', icon: 'pi pi-briefcase' },
            { label: 'Job Readiness : Interviews & CV', icon: 'pi pi-check-circle' }
        ];
    }
    // 2. Academic Roadmap: Single Subject Syllabus (e.g. "Data Structures - Sem 1")
    else {
        return [
            { label: 'Course Intro : Weeks 1-2', icon: 'pi pi-info-circle' },
            { label: 'Core Concepts : Weeks 3-6', icon: 'pi pi-book' },
            { label: 'Mid-Sem Review : Assessment / Quiz', icon: 'pi pi-pencil' },
            { label: 'Advanced Topics : Weeks 8-12', icon: 'pi pi-sitemap' },
            { label: 'Final Project : Submission & Exam', icon: 'pi pi-flag' }
        ];
    }
});

function generateRoadmap() {
// --- ERROR HANDLING & VALIDATION ---
    if (!query.value || query.value.trim() === '') {
        toast.add({
            severity: 'error',
            summary: 'Input Required',
            detail: 'Please describe what you want to learn.',
            life: 3000
        });
        return;
    }

    if (!roadmapLevel.value) {
        toast.add({
            severity: 'error',
            summary: 'Level Required',
            detail: 'Please select a difficulty level.',
            life: 3000
        });
        return;
    }

    // --- SUCCESSFUL DATA PASSING ---
    // Pass all parameters to the loading page via query string
    router.push({
        path: '/student/roadmap-loading',
        query: {
            type: roadmapType.value,
            level: roadmapLevel.value.name, // Sending the string name (e.g., 'Beginner')
            query: query.value.trim()        // Sending the user's text input
        }
    });
}
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="absolute top-10 right-10 w-[30vw] h-[30vw] bg-[#7bc5cd] rounded-full blur-[80px] opacity-20 pointer-events-none animate-pulse"></div>
        <div class="absolute bottom-10 left-10 w-[30vw] h-[30vw] bg-[#a7e2e8] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4">

            <div class="col-span-12 lg:col-span-5">
                <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(44,76,82,0.1)] h-full relative overflow-hidden">

                    <div class="mb-8">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                            <i class="pi pi-sliders-h text-xs text-[#2c4c52]"></i>
                            <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest">CONFIG_MODULE</span>
                        </div>
                        <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">Initialize Path</h2>
                    </div>

                    <div class="flex flex-col gap-8">
                        <div>
                            <label class="block font-mono text-xs font-bold text-[#2c4c52] uppercase mb-3">Roadmap Type</label>
                            <div class="grid grid-cols-2 gap-2 p-1 bg-[#2c4c52]/5 rounded-xl">
                                <button v-for="option in roadmapOptions" :key="option"
                                    @click="roadmapType = option"
                                    :class="[
                                        'py-3 rounded-lg font-bold text-sm transition-all duration-300',
                                        roadmapType === option
                                            ? 'bg-[#2c4c52] text-[#7bc5cd] shadow-md'
                                            : 'text-[#2c4c52]/60 hover:bg-white/50'
                                    ]">
                                    {{ option }}
                                </button>
                            </div>
                        </div>

                        <div v-if="roadmapType === 'General'" class="space-y-6 animate-fade-in">
                            <div class="space-y-2">
                                <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Query</label>
                                <span class="p-input-icon-left w-full">
                                    <InputText v-model="query" placeholder="e.g. I want to enhance my skill in laravel" class="y2k-input w-full" />
                                </span>
                            </div>
                            <div class="space-y-2">
                                <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Difficulty level</label>
                                <Dropdown v-model="roadmapLevel" :options="levels" optionLabel="name" placeholder="Select Level" class="y2k-dropdown w-full" />
                            </div>
                        </div>

                        <div v-if="roadmapType === 'Academic'" class="space-y-6 animate-fade-in">
                            <div class="space-y-2">
                                <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Query</label>
                                <span class="p-input-icon-left w-full">
                                    <InputText v-model="query" placeholder="e.g. I want to enhance my skill in laravel" class="y2k-input w-full" />
                                </span>
                            </div>
                            <div class="space-y-2">
                                <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Difficulty level</label>
                                <Dropdown v-model="roadmapLevel" :options="levels" optionLabel="name" placeholder="Select Level" class="y2k-dropdown w-full" />
                            </div>
                        </div>

                        <Button label="GENERATE PATHWAY" icon="pi pi-bolt" class="y2k-button-primary w-full !py-4 !text-lg !mt-4" @click="generateRoadmap" />
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-7">
                <div class="bg-[#2c4c52] text-[#e0f2f1] p-8 rounded-3xl h-full relative overflow-hidden shadow-2xl border border-[#7bc5cd]/20">

                    <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

                    <div class="relative z-10">
                        <div class="font-mono text-xs text-[#7bc5cd] mb-2 tracking-[0.2em] uppercase blink">/// PREVIEW_OUTPUT_STREAM</div>
                        <div class="text-2xl font-black mb-4 font-mono">{{ previewTitle }}</div>
                        <p class="mb-8 text-[#7bc5cd]/80 leading-relaxed border-l-2 border-[#7bc5cd]/30 pl-4">
                            {{ previewDescription }}
                        </p>

                        <div class="space-y-6 relative">
                            <div class="absolute left-[15px] top-2 bottom-2 w-[2px] bg-[#7bc5cd]/20"></div>

                            <div v-for="(step, index) in previewSteps" :key="index" class="relative pl-12 group">
                                <div class="absolute left-0 top-1 w-8 h-8 bg-[#2c4c52] border border-[#7bc5cd] rounded-full flex items-center justify-center z-10 group-hover:bg-[#7bc5cd] group-hover:text-[#2c4c52] transition-colors duration-300">
                                    <i :class="step.icon" class="text-sm"></i>
                                </div>

                                <div class="font-bold text-lg text-white mb-1 group-hover:text-[#7bc5cd] transition-colors">{{ step.label }}</div>
                                <div class="text-xs font-mono text-[#7bc5cd]/60 uppercase tracking-wide">
                                    Awaiting Execution...
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 bg-[#7bc5cd]/10 border border-[#7bc5cd]/20 p-4 rounded-xl flex items-start gap-3">
                            <i class="pi pi-info-circle text-[#7bc5cd] text-xl mt-1"></i>
                            <span class="text-sm text-[#7bc5cd]/90">
                                This represents a simulated projection. Click <span class="font-bold text-white">GENERATE</span> to calculate the optimal path using our neural engine.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.y2k-input {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 2px solid transparent !important;
    border-radius: 12px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
}

.y2k-input:focus, .y2k-input:hover {
    background: #ffffff !important;
    border-color: #7bc5cd !important;
    box-shadow: 0 0 0 2px rgba(123, 197, 205, 0.2) !important;
}

/* Dropdown override */
:deep(.y2k-dropdown) {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 2px solid transparent !important;
    border-radius: 12px !important;
}
:deep(.y2k-dropdown:hover), :deep(.y2k-dropdown.p-focus) {
    border-color: #7bc5cd !important;
    background: white !important;
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

.blink {
    animation: blinker 1.5s linear infinite;
}

@keyframes blinker {
    50% { opacity: 0; }
}

.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
