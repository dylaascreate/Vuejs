<script setup>
import ActivityLogWidget from '@/components/dashboard/ActivityLogWidget.vue';
import BestCareerWidget from '@/components/dashboard/BestCareerWidget.vue';
import LearningVelocityWidget from '@/components/dashboard/LearningVelocityWidget.vue';
import RecentRoadmapsWidget from '@/components/dashboard/RecentRoadmapsWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
</script>

<template>
    <div class="grid grid-cols-12 gap-8 font-sans text-[#2c4c52]">

        <div class="col-span-12 flex items-center justify-between mb-2">
            <div>
                <h2 class="text-3xl font-black uppercase tracking-tighter text-[#2c4c52]">Command Center</h2>
                <span class="font-mono text-xs font-bold text-[#7bc5cd] tracking-widest uppercase">USER_DASHBOARD_V2.0</span>
            </div>
            <div class="hidden md:flex gap-2">
                <div class="px-4 py-2 bg-white/40 border border-white/60 rounded-xl font-mono text-xs font-bold text-[#2c4c52]">
                    STATUS: ONLINE
                </div>
            </div>
        </div>

        <StatsWidget />

        <div class="col-span-12 xl:col-span-6 flex flex-col gap-8">
            <RecentRoadmapsWidget />
            <BestCareerWidget />
        </div>

        <div class="col-span-12 xl:col-span-6 flex flex-col gap-8">
            <LearningVelocityWidget />
            <ActivityLogWidget />
        </div>
    </div>
</template>
