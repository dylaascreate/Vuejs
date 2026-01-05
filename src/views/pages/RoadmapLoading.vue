<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue'; // Added onUnmounted
import { useRouter, useRoute } from 'vue-router';
import axios from '@/lib/axios';
import { useToast } from 'primevue/usetoast';


// const newRoadmapId = response.data.data.id;

const router = useRouter();
const route = useRoute();
const toast = useToast();

const isAcademic = computed(() => route.query.type === 'Academic');

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

const progress = ref(0);
const statusMessage = ref('Initializing...');
const errorState = ref(false);

// Store the interval ID so we can stop it later
let progressInterval = null;

const generateRoadmap = async () => {
    // --- 1. RESET STATE (Crucial for Retry) ---
    if (progressInterval) clearInterval(progressInterval); // Stop old timer
    errorState.value = false; // Remove red error styling
    progress.value = 0;       // Reset bar
    statusMessage.value = 'Initializing...'; // Reset text

    try {
        // --- 2. Start Animation ---
        progressInterval = setInterval(() => {
            if (progress.value < 90) {
                const increment = progress.value > 60 ? 0.5 : 2;
                progress.value += increment;

                const currentStep = config.value.steps.findLast(step => progress.value >= step.threshold);
                if (currentStep) statusMessage.value = currentStep.message;
            }
        }, 200);

        // --- 3. Call Real API ---
        const payload = {
            level: route.query.level,
            type: route.query.type,
            query: route.query.query
        };

        const response = await axios.post('/api/generate-roadmap', payload);

        // --- 4. Handle Success ---
        clearInterval(progressInterval);
        progress.value = 100;
        statusMessage.value = 'GENERATION COMPLETE.';

        const newRoadmapId = response.data.data.id;

        setTimeout(() => {
            const targetPath = isAcademic.value
                ? `/student/roadmap-details-academic/${newRoadmapId}`
                : `/student/roadmap-details/${newRoadmapId}`;

            router.push(targetPath);
        }, 800);

    } catch (error) {
        // --- 5. Handle Error ---
        clearInterval(progressInterval); // Stop the "thinking" animation
        progress.value = 0;
        statusMessage.value = 'GENERATION FAILED.';
        errorState.value = true;

        console.error("Roadmap Generation Error:", error);
        toast.add({ severity: 'error', summary: 'AI Error', detail: 'Failed to generate roadmap. Please try again.', life: 5000 });
    }
};

onMounted(() => {
    generateRoadmap();
});

// Clean up timer if user leaves page mid-generation
onUnmounted(() => {
    if (progressInterval) clearInterval(progressInterval);
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
                 :class="{'!border-red-400 !bg-red-50/50': errorState}">

                <div v-if="!errorState" class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7bc5cd] via-[#2c4c52] to-[#7bc5cd] animate-scan"></div>

                <div class="mb-8">
                    <div class="relative inline-block mb-4">
                        <i :class="['pi text-6xl text-[#2c4c52]', errorState ? 'pi-exclamation-triangle' : 'pi-spin ' + config.mainIcon]"></i>
                        <i v-if="!errorState" :class="['pi text-2xl text-[#7bc5cd] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', config.secondaryIcon]"></i>
                    </div>
                    <h2 class="text-2xl font-black text-[#2c4c52] uppercase tracking-widest mb-2">{{ config.title }}</h2>
                    <div class="font-mono text-sm font-bold text-[#7bc5cd] animate-pulse uppercase" :class="{'text-red-500': errorState}">
                        {{ statusMessage }}
                    </div>
                </div>

                <ProgressBar :value="progress" class="h-4 rounded-full bg-[#2c4c52]/10" :showValue="false">
                    <template #default>
                        <div class="h-full bg-gradient-to-r from-[#7bc5cd] to-[#2c4c52] rounded-full transition-all duration-300"></div>
                    </template>
                </ProgressBar>

                <div class="flex justify-between font-mono text-xs font-bold text-[#2c4c52]/60 mt-1">
                    <span>0%</span>
                    <span>{{ Math.floor(progress) }}%</span>
                    <span>100%</span>
                </div>

                <div class="mt-8 flex flex-col gap-3 text-left pl-4 border-l-2 border-[#2c4c52]/10">
                    <div v-for="step in config.steps" :key="step.threshold"
                         class="flex items-center gap-3 transition-all duration-300"
                         :class="{'opacity-100 translate-x-2': progress >= step.threshold, 'opacity-40': progress < step.threshold}">
                        <i :class="['pi text-xs', progress >= step.threshold ? 'pi-check-circle text-[#2c4c52]' : 'pi-circle text-[#7bc5cd]']"></i>
                        <span class="font-mono text-xs font-bold uppercase tracking-wide">{{ step.message }}</span>
                    </div>
                </div>

                <div v-if="errorState" class="mt-6">
                    <Button label="RETRY CONNECTION" icon="pi pi-refresh" class="p-button-danger p-button-outlined !font-bold" @click="generateRoadmap" />
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
    background: transparent !important; /* Managed manually in template for gradient */
}
</style>
