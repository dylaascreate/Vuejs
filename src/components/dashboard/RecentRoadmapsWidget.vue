<script setup>
import { onMounted, computed } from 'vue';
import { useRoadmapStore } from '@/stores/roadmap';

const roadmapStore = useRoadmapStore();

// Fetch roadmaps when component mounts
onMounted(() => {
    // You can pass params like { limit: 5 } if your backend supports pagination/limiting
    roadmapStore.fetchRoadmaps();
});

// Use data from the store
const roadmaps = computed(() => {
    // Return the latest 5 roadmaps, or all if fewer than 5
    // Adjust field names (e.g., r.title vs r.name) based on your actual API response
    return (roadmapStore.allRoadmaps || []).slice(0, 5).map(r => ({
        ...r,
        // Fallback for display fields if API naming differs
        name: r.title || r.name || 'Untitled Roadmap',
        target: r.target_role || r.target || 'General',
        // Ensure progress is a number
        progress: r.progress || 0,
        // Ensure status exists
        status: (r.status || 'draft').toUpperCase()
    }));
});

const getStatusColor = (status) => {
    switch(status) {
        case 'ACTIVE': return 'bg-[#7bc5cd] text-[#2c4c52]';
        case 'COMPLETE': return 'bg-green-400 text-white';
        case 'PAUSED': return 'bg-orange-300 text-white';
        case 'ARCHIVED': return 'bg-gray-400 text-white';
        default: return 'bg-gray-300 text-white';
    }
};
</script>

<template>
    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm h-full">
        <div class="flex justify-between items-center mb-6">
            <h5 class="font-black text-xl text-[#2c4c52] uppercase tracking-tighter m-0">Recent Roadmaps</h5>
            <Button icon="pi pi-arrow-right" class="p-button-text p-button-rounded !text-[#2c4c52]" />
        </div>

        <div v-if="roadmapStore.isLoading" class="flex justify-center items-center py-8">
            <i class="pi pi-spin pi-spinner text-[#2c4c52] text-2xl"></i>
        </div>

        <div v-else-if="!roadmaps.length" class="text-center py-8 text-[#2c4c52]/60 font-mono text-sm">
            NO ACTIVE ROADMAPS FOUND
        </div>

        <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-xs font-mono font-bold text-[#2c4c52]/60 uppercase border-b border-[#2c4c52]/10">
                        <th class="pb-3 pl-2">Protocol Name</th>
                        <th class="pb-3 hidden sm:table-cell">Target Career</th>
                        <th class="pb-3">Status</th>
                        <th class="pb-3 pr-2 text-right">Completion</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr v-for="item in roadmaps" :key="item.id || item.name" class="group hover:bg-white/40 transition-colors border-b border-[#2c4c52]/5 last:border-0">
                        <td class="py-4 pl-2 font-bold text-[#2c4c52]">{{ item.name }}</td>
                        <td class="py-4 text-[#4a7a82] hidden sm:table-cell">{{ item.target }}</td>
                        <td class="py-4">
                            <span :class="['px-2 py-1 rounded text-[10px] font-mono font-bold', getStatusColor(item.status)]">
                                {{ item.status }}
                            </span>
                        </td>
                        <td class="py-4 pr-2 text-right font-mono font-bold text-[#2c4c52]">{{ item.progress }}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
