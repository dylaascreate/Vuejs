<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

function setChartData() {
    return {
        labels: ['Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data'],
        datasets: [
            {
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#2c4c52', // Dark Teal
                    '#4a7a82', // Medium Teal
                    '#7bc5cd', // Light Teal
                    '#a7e2e8', // Pale Cyan
                    '#e0f2f1'  // White/Teal mix
                ],
                hoverBackgroundColor: [
                    '#1a3338',
                    '#3b666d',
                    '#5d9ca4',
                    '#8ecfd6',
                    '#ffffff'
                ],
                borderWidth: 0,
                cutout: '65%'
            }
        ]
    };
}

function setChartOptions() {
    const textColor = '#2c4c52';

    return {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    color: textColor,
                    font: { family: 'monospace', weight: 'bold', size: 10 },
                    padding: 20
                }
            }
        },
        maintainAspectRatio: false
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
    <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm h-full flex flex-col items-center justify-center relative">
        <div class="absolute top-6 left-6">
             <h4 class="font-black text-[#2c4c52] uppercase text-lg leading-none mb-1">Career Distribution</h4>
             <span class="font-mono text-xs font-bold text-[#4a7a82] uppercase">Student Selection</span>
        </div>

        <div class="w-full h-64 mt-8">
            <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full h-full" />
        </div>
    </div>
</template>
