<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

function setChartData() {
    return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Registered Users',
                data: [650, 900, 1200, 1600, 2100, 2800],
                fill: true,
                backgroundColor: 'rgba(123, 197, 205, 0.2)', // Light Teal Faded
                borderColor: '#7bc5cd', // Light Teal
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#7bc5cd',
                pointHoverBackgroundColor: '#2c4c52',
                tension: 0.4
            },
            {
                label: 'Roadmaps Generated',
                data: [300, 700, 1100, 1900, 2600, 3500],
                fill: false,
                borderColor: '#2c4c52', // Dark Teal
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#2c4c52',
                pointHoverBackgroundColor: '#7bc5cd',
                tension: 0.4,
                borderDash: [5, 5]
            }
        ]
    };
}

function setChartOptions() {
    const textColor = '#2c4c52';
    const textColorSecondary = '#4a7a82';
    const surfaceBorder = 'rgba(44, 76, 82, 0.1)';

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    font: { family: 'monospace', weight: 'bold', size: 10 },
                    usePointStyle: true,
                    boxWidth: 8
                },
                align: 'end'
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#2c4c52',
                bodyColor: '#4a7a82',
                borderColor: 'rgba(44, 76, 82, 0.1)',
                borderWidth: 1,
                titleFont: { weight: 'bold' }
            }
        },
        scales: {
            x: {
                ticks: { color: textColorSecondary, font: { size: 10, weight: 'bold' } },
                grid: { color: surfaceBorder, drawBorder: false }
            },
            y: {
                ticks: { color: textColorSecondary, font: { size: 10, weight: 'bold' } },
                grid: { color: surfaceBorder, drawBorder: false }
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
    <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div class="flex justify-between items-center mb-6">
            <div>
                 <h4 class="font-black text-[#2c4c52] uppercase text-lg leading-none mb-1">Engagement Funnel</h4>
                 <span class="font-mono text-xs font-bold text-[#7bc5cd] uppercase">User Growth vs Activity</span>
            </div>
            <div class="px-3 py-1 rounded-lg bg-[#2c4c52]/5 border border-[#2c4c52]/10">
                <span class="text-[10px] font-bold text-[#2c4c52] uppercase">Live Data</span>
            </div>
        </div>
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
