<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Custom Filter Options
const filters = ['ALL_PATHS', 'GENERAL_PROTOCOL', 'ACADEMIC_SYNC'];
const activeFilter = ref('ALL_PATHS');

// Dialog Control
const displaySkillsDialog = ref(false);
const selectedRoadmap = ref({});

// Mock Data
const roadmaps = ref([
    {
        id: 1,
        title: 'Frontend Mastery',
        type: 'GENERAL_PROTOCOL',
        target: 'Frontend Engineer',
        progress: 65,
        status: 'ACTIVE',
        lastActive: '2h ago',
        icon: 'pi pi-desktop',
        color: 'text-cyan-500',
        skills: ['Vue.js', 'Tailwind', 'JS ES6', 'Git', 'Pinia']
    },
    {
        id: 2,
        title: 'Software Testing (DES3053)',
        type: 'ACADEMIC_SYNC',
        target: 'QA Engineer',
        progress: 30,
        status: 'ACTIVE',
        lastActive: '1d ago',
        icon: 'pi pi-book',
        color: 'text-purple-500',
        skills: ['Manual Testing', 'Jira', 'Selenium', 'Bug Reporting']
    },
    {
        id: 3,
        title: 'AWS Cloud Architect',
        type: 'GENERAL_PROTOCOL',
        target: 'Cloud Architect',
        progress: 100,
        status: 'COMPLETE',
        lastActive: '1w ago',
        icon: 'pi pi-cloud',
        color: 'text-orange-500',
        skills: ['EC2', 'S3', 'Lambda', 'VPC', 'IAM']
    },
    {
        id: 4,
        title: 'Data Structures (CS201)',
        type: 'ACADEMIC_SYNC',
        target: 'Backend Dev',
        progress: 10,
        status: 'ACTIVE',
        lastActive: '3d ago',
        icon: 'pi pi-sitemap',
        color: 'text-green-500',
        skills: ['Arrays', 'Linked Lists', 'Trees', 'Graphs']
    }
]);

const filteredRoadmaps = computed(() => {
    if (activeFilter.value === 'ALL_PATHS') return roadmaps.value;
    return roadmaps.value.filter(roadmap => roadmap.type === activeFilter.value);
});

const navigateToRoadmap = (roadmap) => {
    if (roadmap.type === 'ACADEMIC_SYNC') {
        router.push('/student/roadmap-details-academic');
    } else {
        router.push('/student/roadmap-details');
    }
};

const openSkillsModal = (roadmap) => {
    selectedRoadmap.value = roadmap;
    displaySkillsDialog.value = true;
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">
        
        <div class="absolute inset-0 z-0 pointer-events-none opacity-20" 
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4">
            
            <div class="col-span-12 mb-4">
                <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter mb-2">My Learning Paths</h2>
                <div class="flex flex-wrap gap-3">
                    <button v-for="filter in filters" :key="filter"
                        @click="activeFilter = filter"
                        :class="[
                            'px-4 py-2 rounded-full font-mono text-xs font-bold transition-all duration-300 border',
                            activeFilter === filter 
                                ? 'bg-[#2c4c52] text-[#7bc5cd] border-[#2c4c52]' 
                                : 'bg-white/40 text-[#2c4c52] border-white/60 hover:bg-white/60'
                        ]">
                        {{ filter }}
                    </button>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 lg:col-span-4" v-for="item in filteredRoadmaps" :key="item.id">
                <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl h-full flex flex-col justify-between transition-all hover:shadow-[0_10px_40px_rgba(123,197,205,0.2)] hover:-translate-y-1 group">
                    <div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 rounded-xl bg-[#2c4c52]/5 flex items-center justify-center group-hover:bg-[#2c4c52] transition-colors duration-300">
                                <i :class="[item.icon, 'text-xl transition-colors duration-300', item.color, 'group-hover:text-[#7bc5cd]']"></i>
                            </div>
                            <span class="font-mono text-[10px] font-bold px-2 py-1 rounded border border-[#2c4c52]/20 text-[#2c4c52]/70">
                                {{ item.status }}
                            </span>
                        </div>
                        
                        <h3 class="text-xl font-black text-[#2c4c52] mb-1 leading-tight">{{ item.title }}</h3>
                        <span class="text-xs font-mono text-[#7bc5cd] font-bold block mb-4">TARGET: {{ item.target }}</span>

                        <div class="mb-4">
                            <div class="flex justify-between mb-1">
                                <span class="text-xs font-bold text-[#2c4c52]/60 uppercase">Completion</span>
                                <span class="text-xs font-bold text-[#2c4c52]">{{ item.progress }}%</span>
                            </div>
                            <div class="w-full h-2 bg-[#2c4c52]/10 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-[#7bc5cd] to-[#2c4c52]" :style="{ width: item.progress + '%' }"></div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 mt-4 pt-4 border-t border-[#2c4c52]/10">
                        <Button 
                            icon="pi pi-bolt" 
                            class="y2k-button-secondary !w-10 !h-10 !p-0 flex items-center justify-center !rounded-full" 
                            v-tooltip.top="'View Skills'"
                            @click="openSkillsModal(item)"
                        />
                        <Button 
                            :label="item.status === 'COMPLETE' ? 'ARCHIVE' : 'CONTINUE'" 
                            :icon="item.status === 'COMPLETE' ? 'pi pi-check' : 'pi pi-arrow-right'" 
                            iconPos="right"
                            class="y2k-button-primary flex-1 !py-2 !text-sm"
                            @click="navigateToRoadmap(item)" 
                        />
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <div class="h-full min-h-[16rem] border-2 border-dashed border-[#2c4c52]/20 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#7bc5cd]/10 hover:border-[#7bc5cd] transition-all group"
                     @click="router.push('/student/roadmap-generator')">
                    <div class="w-16 h-16 rounded-full bg-[#2c4c52] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                        <i class="pi pi-plus text-2xl text-[#7bc5cd]"></i>
                    </div>
                    <span class="font-black text-lg text-[#2c4c52] uppercase">Initialize New Path</span>
                    <span class="text-xs font-mono text-[#2c4c52]/60 mt-1">START_NEW_PROTOCOL</span>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="displaySkillsDialog" modal :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
                contentClass="bg-[#e0f2f1] text-[#2c4c52]" headerClass="bg-[#e0f2f1] text-[#2c4c52] border-b border-[#2c4c52]/10">
            <template #header>
                <div class="flex items-center gap-3">
                    <i :class="[selectedRoadmap.icon, 'text-xl text-[#2c4c52]']"></i>
                    <div>
                        <span class="block font-black text-lg uppercase">{{ selectedRoadmap.title }}</span>
                        <span class="font-mono text-xs text-[#7bc5cd] font-bold">SKILL_MATRIX_OVERVIEW</span>
                    </div>
                </div>
            </template>
            
            <div class="py-4">
                <div class="flex flex-wrap gap-2">
                    <div v-for="(skill, index) in selectedRoadmap.skills" :key="index" 
                         class="px-3 py-1 bg-white border border-[#2c4c52]/20 rounded-lg flex items-center gap-2 shadow-sm">
                        <i class="pi pi-bolt text-xs text-[#7bc5cd]"></i>
                        <span class="text-sm font-bold text-[#2c4c52]">{{ skill }}</span>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2 pt-4 border-t border-[#2c4c52]/10">
                    <Button label="CLOSE" class="y2k-button-secondary !text-xs !py-2" @click="displaySkillsDialog = false" />
                    <Button label="ACCESS_PROTOCOL" class="y2k-button-primary !text-xs !py-2" @click="navigateToRoadmap(selectedRoadmap)" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

