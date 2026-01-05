<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

function setChartData() {
    return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                type: 'bar',
                label: 'Skills Mastered',
                backgroundColor: '#7bc5cd',
                data: [4, 8, 3, 7],
                borderRadius: 4,
                barThickness: 24
            },
            {
                type: 'bar',
                label: 'Tasks Completed',
                backgroundColor: '#2c4c52',
                data: [12, 19, 15, 22],
                borderRadius: 4,
                barThickness: 24
            }
        ]
    };
}

function setChartOptions() {
    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: { color: '#2c4c52', font: { family: 'monospace', weight: 'bold' } }
            }
        },
        scales: {
            x: {
                ticks: { color: '#2c4c52', font: { family: 'monospace' } },
                grid: { display: false }
            },
            y: {
                ticks: { color: '#2c4c52' },
                grid: { color: 'rgba(44, 76, 82, 0.1)', borderDash: [5, 5] }
            }
        }
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
    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm">
        <div class="flex justify-between items-center mb-6">
            <h5 class="font-black text-xl text-[#2c4c52] uppercase tracking-tighter m-0">Learning Velocity</h5>
            <div class="px-3 py-1 bg-[#2c4c52]/5 rounded-lg border border-[#2c4c52]/10 text-xs font-mono font-bold text-[#2c4c52]">
                LAST_30_DAYS
            </div>
        </div>
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>