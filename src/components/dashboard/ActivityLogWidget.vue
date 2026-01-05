<script setup>
import { ref } from 'vue';
</script>

<template>
    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm h-full">
        <div class="flex items-center justify-between mb-6">
            <h5 class="font-black text-xl text-[#2c4c52] uppercase tracking-tighter m-0">Activity Log</h5>
            <i class="pi pi-history text-[#2c4c52]/50"></i>
        </div>

        <div class="relative pl-4 border-l-2 border-[#2c4c52]/10 space-y-6">
            <div class="relative">
                <div class="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-[#7bc5cd] ring-4 ring-[#e0f2f1]"></div>
                <div class="mb-1">
                    <span class="text-xs font-mono font-bold text-[#4a7a82]">10:42 AM · TODAY</span>
                </div>
                <div class="text-[#2c4c52] text-sm leading-relaxed">
                    <span class="font-bold">Protocol Complete:</span> You finished the <span class="text-[#2c4c52] font-bold border-b border-[#7bc5cd]">CSS Grid Module</span>.
                </div>
            </div>

            <div class="relative">
                <div class="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-orange-400 ring-4 ring-[#e0f2f1]"></div>
                <div class="mb-1">
                    <span class="text-xs font-mono font-bold text-[#4a7a82]">09:15 AM · TODAY</span>
                </div>
                <div class="text-[#2c4c52] text-sm leading-relaxed">
                    <span class="font-bold">New Roadmap:</span> Initialized <span class="text-orange-600 font-bold">AWS Solutions Architect</span> path.
                </div>
            </div>

            <div class="relative">
                <div class="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-purple-400 ring-4 ring-[#e0f2f1]"></div>
                <div class="mb-1">
                    <span class="text-xs font-mono font-bold text-[#4a7a82]">YESTERDAY</span>
                </div>
                <div class="text-[#2c4c52] text-sm leading-relaxed">
                    <span class="font-bold">Skill Acquired:</span> Earned the <span class="text-purple-600 font-bold">Git Version Control</span> badge.
                </div>
            </div>
            
             <div class="relative">
                <div class="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-[#e0f2f1]"></div>
                <div class="mb-1">
                    <span class="text-xs font-mono font-bold text-[#4a7a82]">3 DAYS AGO</span>
                </div>
                <div class="text-[#2c4c52] text-sm leading-relaxed">
                    <span class="font-bold">Project Upload:</span> "Personal Portfolio v1" uploaded to repository.
                </div>
            </div>
        </div>
    </div>
</template>