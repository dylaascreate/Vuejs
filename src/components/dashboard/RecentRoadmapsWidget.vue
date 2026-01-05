<script setup>
import { ref } from 'vue';

const roadmaps = ref([
    { name: 'Frontend Mastery', target: 'Frontend Dev', progress: 65, status: 'ACTIVE' },
    { name: 'AWS Solutions Arch', target: 'Cloud Architect', progress: 30, status: 'ACTIVE' },
    { name: 'Data Structures 101', target: 'CS Student', progress: 100, status: 'COMPLETE' },
    { name: 'UX Design Principals', target: 'Product Design', progress: 15, status: 'PAUSED' },
    { name: 'Python for Data Sci', target: 'Data Analyst', progress: 45, status: 'ACTIVE' }
]);

const getStatusColor = (status) => {
    switch(status) {
        case 'ACTIVE': return 'bg-[#7bc5cd] text-[#2c4c52]';
        case 'COMPLETE': return 'bg-green-400 text-white';
        case 'PAUSED': return 'bg-orange-300 text-white';
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
        
        <div class="overflow-x-auto">
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
                    <tr v-for="item in roadmaps" :key="item.name" class="group hover:bg-white/40 transition-colors border-b border-[#2c4c52]/5 last:border-0">
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