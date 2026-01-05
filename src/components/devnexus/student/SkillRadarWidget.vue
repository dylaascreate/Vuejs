<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

function setChartData() {
    return {
        labels: ['Vue.js', 'Tailwind', 'Python', 'System Design', 'DevOps', 'Figma'],
        datasets: [
            {
                label: 'Current Mastery',
                borderColor: '#7bc5cd', // Light Teal
                backgroundColor: 'rgba(123, 197, 205, 0.4)',
                pointBackgroundColor: '#7bc5cd',
                pointBorderColor: '#ffffff',
                pointHoverBackgroundColor: '#2c4c52',
                pointHoverBorderColor: '#7bc5cd',
                data: [85, 90, 75, 55, 30, 80]
            },
            {
                label: 'Role Target',
                borderColor: '#2c4c52', // Dark Teal
                backgroundColor: 'rgba(44, 76, 82, 0.1)',
                pointBackgroundColor: '#2c4c52',
                pointBorderColor: '#ffffff',
                pointHoverBackgroundColor: '#7bc5cd',
                pointHoverBorderColor: '#2c4c52',
                data: [90, 95, 80, 85, 75, 85]
            }
        ]
    };
}

function setChartOptions() {
    const textColor = '#2c4c52';
    const gridColor = 'rgba(44, 76, 82, 0.1)';

    return {
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    font: {
                        family: 'monospace',
                        weight: 'bold',
                        size: 11
                    },
                    usePointStyle: true,
                    boxWidth: 8
                },
                position: 'bottom'
            }
        },
        scales: {
            r: {
                angleLines: {
                    color: gridColor
                },
                grid: {
                    color: gridColor
                },
                pointLabels: {
                    color: textColor,
                    font: {
                        family: 'monospace',
                        weight: 'bold',
                        size: 10
                    }
                },
                ticks: {
                    display: false, // Hide the numbers on the rings for cleaner look
                    backdropColor: 'transparent'
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
    <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm flex flex-col items-center h-full relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-[#7bc5cd]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="w-full flex justify-between items-center mb-4 relative z-10">
            <div class="flex items-center gap-2">
                <i class="pi pi-compass text-[#2c4c52]"></i>
                <h4 class="font-black text-[#2c4c52] uppercase text-sm">Skill Velocity</h4>
            </div>
            <span class="font-mono text-[10px] font-bold text-[#7bc5cd] border border-[#7bc5cd]/30 px-2 py-0.5 rounded-full">LIVE_METRICS</span>
        </div>

        <div class="h-[250px] w-full flex items-center justify-center relative z-10">
            <Chart type="radar" :data="chartData" :options="chartOptions" class="w-full h-full" />
        </div>
    </div>
</template>
