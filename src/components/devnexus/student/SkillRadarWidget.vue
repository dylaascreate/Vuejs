<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    return {
        labels: ['Vue.js', 'Java', 'Python', 'AWS', 'System Design', 'DevOps'],
        datasets: [
            {
                label: 'Current Skill Level',
                borderColor: documentStyle.getPropertyValue('--p-cyan-400'),
                backgroundColor: 'rgba(34, 211, 238, 0.2)', // cyan-400 with opacity
                pointBackgroundColor: documentStyle.getPropertyValue('--p-cyan-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-cyan-400'),
                pointHoverBackgroundColor: textColor,
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-cyan-400'),
                data: [85, 90, 60, 40, 55, 30]
            },
            {
                label: 'Goal Level',
                borderColor: documentStyle.getPropertyValue('--p-purple-400'),
                backgroundColor: 'rgba(192, 132, 252, 0.2)', // purple-400 with opacity
                pointBackgroundColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointHoverBackgroundColor: textColor,
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
                data: [90, 95, 80, 80, 85, 75]
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            r: {
                grid: {
                    color: surfaceBorder
                },
                pointLabels: {
                    color: textColor
                }
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
    <div class="card flex flex-col items-center">
        <div class="font-semibold text-xl mb-4 self-start">Skill Analytics</div>
        <Chart type="radar" :data="chartData" :options="chartOptions" class="w-full md:w-[30rem]" />
    </div>
</template>