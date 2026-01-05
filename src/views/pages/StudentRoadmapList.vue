<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useRoadmapStore } from '@/stores/roadmap';
import Skeleton from 'primevue/skeleton'; // <--- Import Skeleton

// Import Widget
import RoadmapStatusWidget from '@/components/devnexus/student/RoadmapStatusWidget.vue';

const router = useRouter();
const roadmapStore = useRoadmapStore();

// Access state from store
const { allRoadmaps: roadmaps, isLoading } = storeToRefs(roadmapStore);

// --- State ---
const filters = ['ALL_PATHS', 'GENERAL_PROTOCOL', 'ACADEMIC_SYNC'];
const activeFilter = ref('ALL_PATHS');
const displaySkillsDialog = ref(false);
const selectedRoadmap = ref({});

// --- Lifecycle ---
onMounted(() => {
    roadmapStore.fetchRoadmaps();
});

// --- Computed ---
const filteredRoadmaps = computed(() => {
    const list = roadmaps.value || [];

    if (activeFilter.value === 'ALL_PATHS') return list;

    return list.filter(roadmap => {
        const typeMap = {
            'General': 'GENERAL_PROTOCOL',
            'Academic': 'ACADEMIC_SYNC'
        };
        const normalizedType = typeMap[roadmap.type] || roadmap.type;
        return normalizedType === activeFilter.value;
    });
});

// --- Actions ---
const navigateToRoadmap = (roadmap) => {
    roadmapStore.$patch({ activeRoadmap: roadmap });

    if (roadmap.type === 'Academic' || roadmap.type === 'ACADEMIC_SYNC') {
        router.push(`/student/roadmap-details-academic/${roadmap.id}`);
    } else {
        router.push(`/student/roadmap-details/${roadmap.id}`);
    }
};

const openSkillsModal = (roadmap) => {
    selectedRoadmap.value = roadmap;
    displaySkillsDialog.value = true;
};

const getRoadmapSkills = (roadmap) => {
    if (!roadmap.phases) return [];
    const allSkills = roadmap.phases.flatMap(phase => phase.skill || phase.skills || []);
    return [...new Set(allSkills)].filter(s => s);
};

const getRoadmapIcon = (type) => {
    if (type?.toLowerCase() === 'academic') {
        return 'pi pi-book';
    }
    return 'pi pi-building';
};

const getRoadmapTheme = (type) => {
    if (type?.toLowerCase() === 'academic') {
        return 'bg-green-100 text-green-700 border-green-200';
    }
    return 'bg-blue-100 text-blue-700 border-blue-200';
};

const getStatusClasses = (status) => {
  const s = status ? status.toLowerCase() : '';
  switch (s) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800 hover:border-green-300';
    case 'completed':
    case 'complete':
      return 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200 hover:text-teal-800 hover:border-teal-300';
    case 'archived':
      return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-300';
    default:
      return 'bg-gray-50 border-[#2c4c52]/20 text-[#2c4c52]/70 hover:bg-gray-200';
  }
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4">

            <div class="col-span-12 flex flex-col md:flex-row items-end gap-6 mb-4">
                <div class="flex-1 pb-1">
                    <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter mb-4 leading-none">My Learning Paths</h2>
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
                <RoadmapStatusWidget />
            </div>

            <template v-if="isLoading">
                <div class="col-span-12 md:col-span-6 lg:col-span-4" v-for="n in 3" :key="n">
                    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl h-full flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-4">
                                <Skeleton shape="square" size="3rem" borderRadius="12px"></Skeleton>
                                <Skeleton width="5rem" height="1.5rem" borderRadius="4px"></Skeleton>
                            </div>

                            <Skeleton width="80%" height="1.75rem" class="mb-2"></Skeleton>
                            <Skeleton width="50%" height="1rem" class="mb-6"></Skeleton>

                            <div class="mb-4">
                                <div class="flex justify-between mb-2">
                                    <Skeleton width="20%" height="0.8rem"></Skeleton>
                                    <Skeleton width="10%" height="0.8rem"></Skeleton>
                                </div>
                                <Skeleton width="100%" height="0.5rem" borderRadius="99px"></Skeleton>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 mt-4 pt-4 border-t border-[#2c4c52]/10">
                            <Skeleton shape="circle" size="2.5rem"></Skeleton>
                            <Skeleton width="100%" height="2.5rem" borderRadius="99px"></Skeleton>
                        </div>
                    </div>
                </div>
            </template>

            <template v-else>
                <div class="col-span-12 md:col-span-6 lg:col-span-4" v-for="item in filteredRoadmaps" :key="item.id">
                    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl h-full flex flex-col justify-between transition-all hover:shadow-[0_10px_40px_rgba(123,197,205,0.2)] hover:-translate-y-1 group">
                        <div>
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300"
                                     :class="getRoadmapTheme(item.type)">
                                    <i :class="getRoadmapIcon(item.type)" class="text-xl"></i>
                                </div>

                                <span class="font-mono text-[10px] font-bold px-2 py-1 rounded border"
                                      :class="getStatusClasses(item.status)">
                                    {{ item.status }}
                                </span>
                            </div>

                            <h3 class="text-xl font-black text-[#2c4c52] mb-1 leading-tight line-clamp-1">{{ item.title }}</h3>
                            <span class="text-xs font-mono text-[#7bc5cd] font-bold block mb-4">TARGET: {{ item.career_role || 'Software Engineer' }}</span>

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
                                :label="item.status === 'Completed' ? 'ARCHIVE' : 'CONTINUE'"
                                :icon="item.status === 'Completed' ? 'pi pi-check' : 'pi pi-arrow-right'"
                                iconPos="right"
                                class="y2k-button-primary flex-1 !py-2 !text-sm"
                                @click="navigateToRoadmap(item)"
                            />
                        </div>
                    </div>
                </div>
            </template>

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
                    <i :class="getRoadmapIcon(selectedRoadmap.type)" class="text-xl text-[#2c4c52]"></i>
                    <div>
                        <span class="block font-black text-lg uppercase">{{ selectedRoadmap.title }}</span>
                        <span class="font-mono text-xs text-[#7bc5cd] font-bold">SKILL_MATRIX_OVERVIEW</span>
                    </div>
                </div>
            </template>

            <div class="py-4">
                <div class="flex flex-wrap gap-2" v-if="getRoadmapSkills(selectedRoadmap).length > 0">
                    <div v-for="(skill, index) in getRoadmapSkills(selectedRoadmap)" :key="index"
                         class="px-3 py-1 bg-white border border-[#2c4c52]/20 rounded-lg flex items-center gap-2 shadow-sm">
                        <i class="pi pi-bolt text-xs text-[#7bc5cd]"></i>
                        <span class="text-sm font-bold text-[#2c4c52]">{{ skill }}</span>
                    </div>
                </div>
                <div v-else class="text-center py-4 text-gray-500 font-mono text-xs">
                    NO_SKILLS_DEFINED
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

<style scoped>
.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
}
.y2k-button-secondary {
    background: rgba(255,255,255,0.5) !important;
    border: 1px solid rgba(44, 76, 82, 0.1) !important;
    color: #2c4c52 !important;
}
.status-badge {
  /* No transition property ensures instant change */
  cursor: pointer;
}

/* --- ACTIVE (Green) --- */
.status-active {
  background-color: #22c55e; /* Green-500 */
  color: white;
}
.status-active:hover {
  background-color: #15803d; /* Darker Green (Green-700) */
}

/* --- COMPLETE (Teal) --- */
.status-complete {
  background-color: #14b8a6; /* Teal-500 */
  color: white;
}
.status-complete:hover {
  background-color: #0f766e; /* Darker Teal (Teal-700) */
}

/* --- ARCHIVED (Grey) --- */
.status-archived {
  background-color: #6b7280; /* Gray-500 */
  color: white;
}
.status-archived:hover {
  background-color: #374151; /* Darker Gray (Gray-700) */
}
</style>
