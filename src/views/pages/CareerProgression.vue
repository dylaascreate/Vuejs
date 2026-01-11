<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useSkillStore } from '@/stores/skill';
import { useCareerStore } from '@/stores/career';

const router = useRouter();
const toast = useToast();
const skillStore = useSkillStore();
const careerStore = useCareerStore();

// --- Data ---
const careerMatches = computed(() => careerStore.recommendations);
const neuralAdvice = computed(() => careerStore.getAdvice);
const loading = computed(() => careerStore.loading);

const masteredSkills = ref([]);

// --- Actions ---
const initializePathway = (career) => {
    // 1. Extract missing skills
    const missingSkills = career.missingSkills || [];

    // 2. Define the Query / Missing Skills String
    // We format this as a string because the Backend (Laravel) expects a string for 'missing_skills'
    const missingSkillsString = missingSkills.length > 0
        ? missingSkills.join(', ')
        : `Advanced concepts for ${career.title}`;

    toast.add({ severity: 'info', summary: 'Initializing', detail: `Building roadmap for: ${career.title}`, life: 2000 });

    // 3. Navigate with keys MATCHING your Laravel Controller
    router.push({
        name: 'roadmap-loading',
        query: {
            // [CRITICAL] Matches: if ($request->filled('target_career'))
            target_career: career.title,

            // [CRITICAL] Matches: if ($request->filled('missing_skills'))
            missing_skills: missingSkillsString,

            // Standard params
            level: 'Intermediate',
            type: 'general',

            // Fallback: We send 'query' too, just in case your Loading Screen uses it for display text
            query: missingSkillsString,

            skills: JSON.stringify(masteredSkills.value),
        }
    });
};

const loadCareerPathways = async () => {
    try {
        if (skillStore.userSkills.length === 0) {
            await skillStore.fetchUserMatrix();
        }

        masteredSkills.value = skillStore.userSkills.map(s => s.name || s.skill?.name);

        if (skillStore.userSkills.length === 0) {
            toast.add({ severity: 'info', summary: 'No Skills', detail: 'Add skills to your profile to get recommendations.', life: 5000 });
            return;
        }

        await careerStore.fetchRecommendations(skillStore.userSkills);

        if (careerStore.hasRecommendations) {
            toast.add({ severity: 'success', summary: 'Analysis Complete', detail: 'Career paths synchronized.', life: 3000 });
        }

    } catch (error) {
        toast.add({ severity: 'error', summary: 'Sync Failed', detail: 'Could not retrieve AI recommendations.', life: 5000 });
    }
};

onMounted(() => {
    loadCareerPathways();
});

// --- Helpers ---
const getMatchColor = (percent) => {
    if (percent >= 80) return 'text-[#7bc5cd]';
    if (percent >= 60) return 'text-[#2c4c52]';
    return 'text-orange-400';
};

const getProgressBarColor = (percent) => {
    if (percent >= 80) return 'bg-[#7bc5cd]';
    if (percent >= 60) return 'bg-[#2c4c52]';
    return 'bg-orange-400';
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">
        <div class="absolute inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#7bc5cd] rounded-full blur-[120px] opacity-15 pointer-events-none animate-pulse"></div>
        <div class="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#a7e2e8] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4 max-w-7xl mx-auto">

            <div class="col-span-12 mb-4">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                    <i class="pi pi-compass text-xs text-[#2c4c52]"></i>
                    <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">CAREER_SYNC_ENGINE_V2</span>
                </div>
                <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">
                    Career <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#7bc5cd] to-[#5d9ca4]">Progression</span>
                </h2>
                <p class="text-[#4a7a82] font-medium text-sm mt-1 italic">// Mapping your current skill artifacts to industry nodes</p>
            </div>

            <div v-if="loading" class="col-span-12 flex flex-col items-center justify-center py-20">
                <i class="pi pi-spin pi-spinner text-4xl text-[#7bc5cd] mb-4"></i>
                <p class="font-mono text-sm text-[#2c4c52] animate-pulse">ANALYZING NEURAL PATHWAYS...</p>
            </div>

            <template v-else>
                <div class="col-span-12 lg:col-span-4">
                    <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm h-full flex flex-col relative overflow-hidden sticky top-4">
                        <div class="absolute -right-10 -top-10 w-32 h-32 bg-[#2c4c52]/5 rounded-full blur-2xl pointer-events-none"></div>

                        <h4 class="font-black text-lg text-[#2c4c52] uppercase mb-4 flex items-center gap-2">
                            <i class="pi pi-box"></i> Mastered Artifacts
                        </h4>
                        <div class="flex flex-wrap gap-2 mb-8">
                            <span v-for="skill in masteredSkills" :key="skill"
                                  class="bg-[#2c4c52] text-[#7bc5cd] font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[#2c4c52] shadow-sm">
                                {{ skill }}
                            </span>
                            <span v-if="masteredSkills.length === 0" class="text-xs text-[#2c4c52]/50 italic">No skills recorded.</span>
                        </div>

                        <div class="mt-auto p-5 bg-[#7bc5cd]/10 border border-[#7bc5cd]/30 rounded-2xl relative overflow-hidden">
                            <div class="absolute top-0 right-0 p-2 opacity-20">
                                <i class="pi pi-bolt text-4xl text-[#2c4c52]"></i>
                            </div>
                            <span class="text-[10px] font-mono font-bold uppercase text-[#2c4c52] block mb-2 bg-white/40 w-fit px-2 py-0.5 rounded">Neural Advice</span>
                            <p class="text-xs font-medium leading-relaxed text-[#2c4c52]/90 relative z-10">
                                <i v-if="!careerStore.hasRecommendations" class="pi pi-spin pi-spinner mr-2"></i>
                                {{ neuralAdvice }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <div v-if="careerMatches.length === 0" class="text-center py-10 text-[#2c4c52]/60">
                        No career matches found. Try adding more skills to your profile.
                    </div>

                    <div v-for="career in careerMatches" :key="career.id"
                         class="group bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(44,76,82,0.1)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">

                        <div class="absolute top-0 left-0 w-1 h-full bg-[#2c4c52]/10 group-hover:bg-[#7bc5cd] transition-colors duration-300"></div>

                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h3 class="text-2xl font-black text-[#2c4c52] uppercase tracking-tight leading-none mb-2">{{ career.title }}</h3>
                                <p class="text-xs text-[#4a7a82] font-bold font-mono uppercase tracking-wide border-l-2 border-[#2c4c52]/20 pl-3">
                                    {{ career.description }}
                                </p>
                            </div>
                            <div class="flex flex-col items-end min-w-[120px]">
                                <span :class="['text-5xl font-black font-mono leading-none tracking-tighter', getMatchColor(career.matchPercentage)]">
                                    {{ career.matchPercentage }}%
                                </span>
                                <span class="text-[9px] font-mono font-bold text-[#2c4c52]/50 tracking-widest uppercase mt-1">MATCH_RATING</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#2c4c52]/10">
                            <div>
                                <span class="text-[10px] font-mono font-bold text-[#2c4c52]/40 uppercase block mb-4 flex items-center gap-2">
                                    <i class="pi pi-check-circle"></i> Synced Skills
                                </span>
                                <div class="flex flex-col gap-2">
                                    <div v-for="skill in career.topSkills" :key="skill" class="flex items-center gap-3 group/item">
                                        <div class="w-1.5 h-1.5 rounded-full bg-[#2c4c52] group-hover/item:bg-[#7bc5cd] transition-colors"></div>
                                        <span class="text-sm font-black text-[#2c4c52] uppercase">{{ skill }}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span class="text-[10px] font-mono font-bold text-[#2c4c52]/40 uppercase block mb-4 flex items-center gap-2">
                                    <i class="pi pi-exclamation-circle"></i> Gap Requirements
                                </span>
                                <div class="flex flex-col gap-2">
                                    <div v-for="skill in career.missingSkills" :key="skill" class="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                                        <div class="w-1.5 h-1.5 rounded-full border border-[#2c4c52]"></div>
                                        <span class="text-sm font-bold text-[#2c4c52] uppercase decoration-dashed underline decoration-[#2c4c52]/30">{{ skill }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 mb-6 h-1 w-full bg-[#2c4c52]/5 rounded-full overflow-hidden">
                            <div class="h-full transition-all duration-1000 ease-out"
                                 :class="getProgressBarColor(career.matchPercentage)"
                                 :style="{ width: `${career.matchPercentage}%` }"></div>
                        </div>

                        <div class="flex justify-end">
                            <Button label="INITIALIZE_PATHWAY" icon="pi pi-arrow-right" iconPos="right"
                                    class="y2k-button-primary !text-xs !py-3 !px-6"
                                    @click="initializePathway(career)" />
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 10px 20px -5px rgba(44, 76, 82, 0.3);
    transition: all 0.3s ease;
}

.y2k-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -5px rgba(44, 76, 82, 0.4);
    filter: brightness(1.1);
}
</style>
