<script setup>
import AdminStatsWidget from '@/components/devnexus/admin/AdminStatsWidget.vue';
import CareerTrendsWidget from '@/components/devnexus/admin/CareerTrendsWidget.vue';
import RankingChartWidget from '@/components/devnexus/admin/RankingChartWidget.vue';
import RegistrationRoadmapChartWidget from '@/components/devnexus/admin/RegistrationRoadmapChartWidget.vue';
</script>

<template>
    <div class="relative min-h-[80vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#7bc5cd] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#a7e2e8] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-12 gap-6">
            <div class="col-span-12 mb-2">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest">SYSTEM_OVERVIEW_V1</span>
                </div>
                <h2 class="text-3xl font-black text-[#2c4c52] tracking-tight uppercase">
                    Admin <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#7bc5cd] to-[#5d9ca4]">Nexus</span>
                </h2>
                <p class="text-[#4a7a82] font-medium">System-wide analytics and performance metrics.</p>
            </div>

            <AdminStatsWidget />

            <div class="col-span-12">
                <RegistrationRoadmapChartWidget />
            </div>

            <div class="col-span-12 xl:col-span-7">
                <RankingChartWidget />
            </div>
            <div class="col-span-12 xl:col-span-5">
                <CareerTrendsWidget />
            </div>
        </div>
    </div>
</template>
