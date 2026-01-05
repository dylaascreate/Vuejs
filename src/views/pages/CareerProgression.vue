<script setup>
import { ref, onMounted } from 'vue';

const careerMatches = ref([
    { 
        title: 'Frontend Engineer', 
        matchPercentage: 92, 
        description: 'High compatibility due to your mastery in Vue.js and CSS architecture.',
        topSkills: ['Vue.js', 'JavaScript', 'Tailwind CSS'],
        missingSkills: ['TypeScript', 'Unit Testing']
    },
    { 
        title: 'Full Stack Developer', 
        matchPercentage: 75, 
        description: 'Strong foundation, though backend node synchronization is required.',
        topSkills: ['Vue.js', 'PostgreSQL'],
        missingSkills: ['Node.js', 'Redis', 'Docker']
    },
    { 
        title: 'UI/UX Designer', 
        matchPercentage: 60, 
        description: 'Your design system knowledge is a solid base for this track.',
        topSkills: ['Figma', 'CSS Grid'],
        missingSkills: ['User Research', 'Prototyping']
    }
]);

const masteredSkills = ref(['Vue.js', 'JavaScript', 'CSS Grid', 'Tailwind CSS', 'PostgreSQL', 'Figma']);

const getMatchColor = (percent) => {
    if (percent >= 80) return 'text-green-500';
    if (percent >= 60) return 'text-[#7bc5cd]';
    return 'text-orange-500';
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">
        <div class="absolute inset-0 z-0 pointer-events-none opacity-10" 
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4">
            <div class="col-span-12 mb-4">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                    <i class="pi pi-compass text-xs text-[#7bc5cd]"></i>
                    <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">CAREER_SYNC_ENGINE</span>
                </div>
                <h2 class="text-4xl font-black text-[#2c4c52] uppercase tracking-tighter">Career Progression</h2>
                <p class="text-[#4a7a82] font-medium mt-1 italic">// Mapping your current skill artifacts to industry nodes</p>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm h-full">
                    <h4 class="font-black text-xl text-[#2c4c52] uppercase mb-4 border-b border-[#2c4c52]/10 pb-2">Mastered Artifacts</h4>
                    <div class="flex flex-wrap gap-2">
                        <Tag v-for="skill in masteredSkills" :key="skill" :value="skill" 
                             class="!bg-[#2c4c52] !text-[#7bc5cd] !font-mono !text-[10px] !px-3 !py-1 rounded-lg" />
                    </div>
                    <div class="mt-8 p-4 bg-[#7bc5cd]/10 border border-[#7bc5cd]/30 rounded-2xl">
                        <span class="text-xs font-bold uppercase block mb-1">Neural Advice:</span>
                        <p class="text-xs italic leading-relaxed text-[#2c4c52]/80">
                            Expanding your <span class="font-bold text-[#2c4c52]">Backend Node</span> will increase Full Stack compatibility by 15%.
                        </p>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
                <div v-for="career in careerMatches" :key="career.title" 
                     class="card p-8 group relative hover:shadow-xl transition-all duration-300">
                    
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 class="text-2xl font-black text-[#2c4c52] uppercase tracking-tight">{{ career.title }}</h3>
                            <p class="text-sm text-[#4a7a82] font-medium max-w-md mt-1">{{ career.description }}</p>
                        </div>
                        <div class="text-right flex flex-col items-end">
                            <span :class="['text-4xl font-black font-mono', getMatchColor(career.matchPercentage)]">{{ career.matchPercentage }}%</span>
                            <span class="text-[10px] font-mono font-bold text-[#2c4c52]/50 tracking-widest uppercase">MATCH_RATING</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#2c4c52]/5">
                        <div>
                            <span class="text-xs font-mono font-bold text-[#2c4c52]/40 uppercase block mb-3 tracking-wider">Top Synced Skills</span>
                            <div class="space-y-2">
                                <div v-for="skill in career.topSkills" :key="skill" class="flex items-center gap-2">
                                    <i class="pi pi-check-circle text-green-500 text-xs"></i>
                                    <span class="text-sm font-bold text-[#2c4c52] uppercase">{{ skill }}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <span class="text-xs font-mono font-bold text-[#2c4c52]/40 uppercase block mb-3 tracking-wider">Gap Requirements</span>
                            <div class="space-y-2">
                                <div v-for="skill in career.missingSkills" :key="skill" class="flex items-center gap-2 opacity-60">
                                    <i class="pi pi-circle text-[#7bc5cd] text-xs"></i>
                                    <span class="text-sm font-bold text-[#2c4c52] uppercase">{{ skill }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 flex justify-end">
                        <Button label="INITIALIZE_PATHWAY" icon="pi pi-bolt" 
                                class="y2k-button-primary !text-xs !py-3 !px-6" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: none !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.3s ease;
}

.y2k-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(44, 76, 82, 0.3);
}
</style>