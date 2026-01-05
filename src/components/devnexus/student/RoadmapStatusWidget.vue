<script setup>
import { ref, onMounted, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

// Mock Data
const statusCounts = {
    active: 3,
    completed: 1,
    archived: 1
};

function setChartData() {
    return {
        labels: ['Active', 'Completed', 'Archived'],
        datasets: [
            {
                data: [statusCounts.active, statusCounts.completed, statusCounts.archived],
                backgroundColor: [
                    '#7bc5cd', // Light Teal (Active)
                    '#2c4c52', // Dark Cyan (Completed)
                    '#a7e2e8'  // Very Light Cyan (Archived)
                ],
                hoverBackgroundColor: [
                    '#5d9ca4',
                    '#1a3338',
                    '#8ecfd6'
                ],
                borderWidth: 0,
                cutout: '70%'
            }
        ]
    };
}

function setChartOptions() {
    const textColor = '#2c4c52';

    return {
        plugins: {
            legend: {
                display: false // Hidden to keep it compact next to title
            },
            tooltip: {
                enabled: true
            }
        },
        maintainAspectRatio: false,
    };
}

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});
</script>

<template>
    <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-3xl shadow-sm flex items-center gap-4 h-32 min-w-[300px] relative overflow-hidden group hover:border-[#7bc5cd]/30 transition-all">

        <div class="absolute -right-4 -top-4 w-16 h-16 bg-[#7bc5cd]/10 rounded-full blur-xl pointer-events-none group-hover:bg-[#7bc5cd]/20 transition-all"></div>

        <div class="h-20 w-20 relative flex-shrink-0">
            <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full h-full" />
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <i class="pi pi-chart-pie text-[#2c4c52]/30 text-xs"></i>
            </div>
        </div>

        <div class="flex-1 z-10">
            <h4 class="font-black text-[#2c4c52] text-activexs mb-1 tracking-wide">Protocol Status</h4>

            <div class="flex items-center gap-4">
                <div>
                    <span class="block text-2xl font-black text-[#2c4c52] leading-none">{{ statusCounts.active }}</span>
                    <span class="text-[9px] font-mono font-bold text-[#7bc5cd] uppercase">Active</span>
                </div>
                <div class="w-px h-6 bg-[#2c4c52]/10"></div>
                <div>
                    <span class="block text-2xl font-black text-[#2c4c52] leading-none">{{ statusCounts.completed }}</span>
                    <span class="text-[9px] font-mono font-bold text-[#2c4c52]/50 uppercase">Done</span>
                </div>
                <div class="w-px h-6 bg-[#2c4c52]/10"></div>
                <div>
                    <span class="block text-2xl font-black text-[#2c4c52] leading-none">{{ statusCounts.archived }}</span>
                    <span class="text-[9px] font-mono font-bold text-[#2c4c52]/50 uppercase">Archived</span>
                </div>
            </div>
        </div>
    </div>
</template>
