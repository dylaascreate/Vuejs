<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCareerStore } from '@/stores/career';
import { useSkillStore } from '@/stores/skill';

const router = useRouter();
const careerStore = useCareerStore();
const skillStore = useSkillStore();

/**
 * Load recommendations on mount if they don't exist yet.
 * This ensures the widget is populated when the user hits the dashboard.
 */
onMounted(async () => {
    if (!careerStore.hasRecommendations) {
        // Ensure we have skills before requesting recommendations
        if (skillStore.userSkills.length === 0) {
            await skillStore.fetchUserMatrix();
        }

        if (skillStore.userSkills.length > 0) {
            await careerStore.fetchRecommendations(skillStore.userSkills);
        }
    }
});

/**
 * Maps the AI recommendations from the career store.
 * We limit to the top 5 for the dashboard widget view.
 */
const careers = computed(() => {
    return (careerStore.recommendations || []).slice(0, 5).map(career => ({
        id: career.id,
        name: career.title,
        category: career.category || 'Industry Node',
        match: career.matchPercentage || 0,
        color: getMatchStyles(career.matchPercentage).bg,
        text: getMatchStyles(career.matchPercentage).text
    }));
});

/**
 * Navigation to the full Career Progression page
 */
const viewAllPathways = () => {
    router.push('/student/careers');
};

/**
 * UI Helper: Matches the color logic in CareerProgression.vue
 */
const getMatchStyles = (percent) => {
    if (percent >= 80) return { bg: 'bg-[#7bc5cd]', text: 'text-[#7bc5cd]' };
    if (percent >= 60) return { bg: 'bg-[#2c4c52]', text: 'text-[#2c4c52]' };
    return { bg: 'bg-orange-400', text: 'text-orange-400' };
};
</script>

<template>
    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm h-full">
        <div class="flex items-center justify-between mb-6">
            <h5 class="font-black text-xl text-[#2c4c52] uppercase tracking-tighter m-0">Best Fit Career</h5>
            <i class="pi pi-external-link text-[#2c4c52]/50" @click="viewAllPathways"></i>
        </div>

        <div v-if="careerStore.loading" class="flex flex-col items-center py-8 gap-2">
            <i class="pi pi-spin pi-spinner text-[#7bc5cd] text-2xl"></i>
            <span class="font-mono text-[10px] text-[#2c4c52]/60 uppercase">Synchronizing...</span>
        </div>

        <div v-else-if="careers.length === 0" class="text-center py-8 text-[#2c4c52]/60 font-mono text-sm">
            NO CAREERS FOUND
        </div>

        <ul v-else class="list-none p-0 m-0">
            <li v-for="career in careers" :key="career.id" class="flex flex-col mb-4 last:mb-0 group cursor-pointer">
                <div class="flex justify-between items-end mb-1">
                    <div>
                        <span class="text-[#2c4c52] font-bold block group-hover:text-[#7bc5cd] transition-colors">{{ career.name }}</span>
                        <span class="text-[10px] text-[#4a7a82] font-mono uppercase tracking-tighter">{{ career.category }}</span>
                    </div>
                    <span :class="['font-mono font-bold text-xs', career.text]">{{ career.match }}%</span>
                </div>
                <div class="w-full h-1.5 bg-[#2c4c52]/10 rounded-full overflow-hidden">
                    <div
                        class="h-full rounded-full transition-all duration-1000 ease-out"
                        :class="career.color"
                        :style="{ width: career.match + '%' }"
                    ></div>
                </div>
            </li>
        </ul>

        <div v-if="careerStore.getAdvice && !careerStore.loading" class="mt-6 pt-4 border-t border-[#2c4c52]/10">
            <div class="flex gap-3 items-start">
                <i class="pi pi-bolt text-[#7bc5cd] mt-1"></i>
                <p class="text-[11px] leading-relaxed text-[#2c4c52]/80 font-medium">
                    {{ careerStore.getAdvice }}
                </p>
            </div>
        </div>
    </div>
</template>
