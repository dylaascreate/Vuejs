<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useRoadmapStore } from '@/stores/roadmap';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const store = useRoadmapStore();

// --- Config (View Logic) ---
const isAcademic = computed(() => route.query.type === 'academic');

const config = computed(() => {
    return isAcademic.value ? {
        title: 'Generating Academic Blueprint',
        mainIcon: 'pi-book',
        secondaryIcon: 'pi-graduation-cap',
        steps: [
            { threshold: 10, message: 'Connecting to University Database...' },
            { threshold: 30, message: 'Analyzing Syllabus & Prerequisites...' },
            { threshold: 60, message: 'Mapping Industry Skills...' },
            { threshold: 85, message: 'Finalizing Semester Plan...' }
        ]
    } : {
        title: 'Generating Career Path',
        mainIcon: 'pi-cog',
        secondaryIcon: 'pi-bolt',
        steps: [
            { threshold: 10, message: 'ANALYZING_CAREER_TARGETS...' },
            { threshold: 30, message: 'FETCHING_SKILL_MATRIX...' },
            { threshold: 60, message: 'COMPILING_LEARNING_NODES...' },
            { threshold: 85, message: 'OPTIMIZING_PATH_VELOCITY...' }
        ]
    };
});

// --- Actions ---

const triggerGeneration = async () => {
    // 1. Extract ALL params from URL (including the new career ones)
    const {
        target_career,
        missing_skills,
        query,
        level,
        type,
        skills
    } = route.query;

    // 2. Construct Payload matching Laravel Controller
    const payload = {
        // "Initialize Pathway" Params (Scenario 2)
        target_career: target_career || null,
        missing_skills: missing_skills || null,

        // Standard Params (Scenario 1)
        query: query || '', // Fallback to empty string if missing
        level: level || 'Beginner',
        type: type || 'general',

        // Parse skills if passed (useful for custom skill contexts)
        skills: skills ? JSON.parse(skills) : []
    };

    try {
        // 3. Trigger Store Action
        const roadmap = await store.generateRoadmapWithAnimation(payload, config.value, router, toast);

        // 4. Redirect based on Roadmap Type
        if (roadmap.type && roadmap.type.toLowerCase() === 'academic') {
             router.push({ name: 'roadmap-details-academic', params: { id: roadmap.id } });
        } else {
             router.push({ name: 'roadmap-details', params: { id: roadmap.id } });
        }

    } catch (e) {
        console.error("Generation failed:", e);
        // Error state handled by store reactive variables
    }
};

// --- Lifecycle ---

onMounted(() => {
    triggerGeneration();
});

onUnmounted(() => {
    store.clearGenerationInterval();
});
</script>

<template>
    <div class="relative min-h-[80vh] flex flex-col items-center justify-center font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-[#7bc5cd] rounded-full blur-[100px] opacity-20 pointer-events-none animate-pulse"></div>

        <div class="relative z-10 w-full max-w-xl">
            <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(44,76,82,0.15)] text-center overflow-hidden transition-colors duration-500"
                 :class="{'!border-red-400 !bg-red-50/50': store.genError}">

                <div v-if="!store.genError" class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7bc5cd] via-[#2c4c52] to-[#7bc5cd] animate-scan"></div>

                <div class="mb-8">
                    <div class="relative inline-block mb-4">
                        <i :class="['pi text-6xl text-[#2c4c52]', store.genError ? 'pi-exclamation-triangle' : 'pi-spin ' + config.mainIcon]"></i>
                        <i v-if="!store.genError" :class="['pi text-2xl text-[#7bc5cd] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', config.secondaryIcon]"></i>
                    </div>
                    <h2 class="text-2xl font-black text-[#2c4c52] uppercase tracking-widest mb-2">{{ config.title }}</h2>
                    <div class="font-mono text-sm font-bold text-[#7bc5cd] animate-pulse uppercase" :class="{'text-red-500': store.genError}">
                        {{ store.genStatus }}
                    </div>
                </div>

                <ProgressBar :value="store.genProgress" class="h-4 rounded-full bg-[#2c4c52]/10" :showValue="false">
                    <template #default>
                        <div class="h-full bg-gradient-to-r from-[#7bc5cd] to-[#2c4c52] rounded-full transition-all duration-300"></div>
                    </template>
                </ProgressBar>

                <div class="flex justify-between font-mono text-xs font-bold text-[#2c4c52]/60 mt-1">
                    <span>0%</span>
                    <span>{{ Math.floor(store.genProgress) }}%</span>
                    <span>100%</span>
                </div>

                <div class="mt-8 flex flex-col gap-3 text-left pl-4 border-l-2 border-[#2c4c52]/10">
                    <div v-for="step in config.steps" :key="step.threshold"
                         class="flex items-center gap-3 transition-all duration-300"
                         :class="{'opacity-100 translate-x-2': store.genProgress >= step.threshold, 'opacity-40': store.genProgress < step.threshold}">
                        <i :class="['pi text-xs', store.genProgress >= step.threshold ? 'pi-check-circle text-[#2c4c52]' : 'pi-circle text-[#7bc5cd]']"></i>
                        <span class="font-mono text-xs font-bold uppercase tracking-wide">{{ step.message }}</span>
                    </div>
                </div>

                <div v-if="store.genError" class="mt-6">
                    <Button label="RETRY CONNECTION" icon="pi pi-refresh" class="p-button-danger p-button-outlined !font-bold" @click="triggerGeneration" />
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes scan {
    0% { left: -100%; }
    100% { left: 100%; }
}
.animate-scan {
    animation: scan 2s linear infinite;
}
:deep(.p-progressbar-value) {
    background: transparent !important;
}
</style>
