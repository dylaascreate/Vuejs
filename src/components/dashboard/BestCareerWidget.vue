<script setup>
import { ref } from 'vue';

const careers = ref([
    { name: 'Frontend Engineer', category: 'Web Dev', match: 85, color: 'bg-orange-500', text: 'text-orange-500' },
    { name: 'UI/UX Designer', category: 'Design', match: 60, color: 'bg-purple-500', text: 'text-purple-500' },
    { name: 'Vue.js Specialist', category: 'Specialized', match: 92, color: 'bg-[#7bc5cd]', text: 'text-[#2c4c52]' },
    { name: 'DevOps Junior', category: 'Operations', match: 35, color: 'bg-gray-400', text: 'text-gray-500' },
    { name: 'Full Stack Dev', category: 'Web Dev', match: 50, color: 'bg-cyan-500', text: 'text-cyan-500' }
]);
</script>

<template>
    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm">
        <div class="flex justify-between items-center mb-6">
            <h5 class="font-black text-xl text-[#2c4c52] uppercase tracking-tighter m-0">Best Fit Careers</h5>
            <i class="pi pi-star text-[#7bc5cd] text-xl"></i>
        </div>
        
        <ul class="list-none p-0 m-0">
            <li v-for="career in careers" :key="career.name" class="flex flex-col mb-4 last:mb-0">
                <div class="flex justify-between items-end mb-1">
                    <div>
                        <span class="text-[#2c4c52] font-bold block">{{ career.name }}</span>
                        <span class="text-xs text-[#4a7a82] font-mono uppercase">{{ career.category }}</span>
                    </div>
                    <span :class="['font-mono font-bold', career.text]">{{ career.match }}% MATCH</span>
                </div>
                <div class="w-full h-2 bg-[#2c4c52]/10 rounded-full overflow-hidden">
                    <div :class="['h-full rounded-full', career.color]" :style="{ width: career.match + '%' }"></div>
                </div>
            </li>
        </ul>
    </div>
</template>