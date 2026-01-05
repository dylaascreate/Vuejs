<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['Frontend Dev', 'Backend Dev', 'Full Stack', 'DevOps', 'Data Science'],
        datasets: [
            {
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    documentStyle.getPropertyValue('--p-blue-500'),
                    documentStyle.getPropertyValue('--p-orange-500'),
                    documentStyle.getPropertyValue('--p-green-500'),
                    documentStyle.getPropertyValue('--p-purple-500'),
                    documentStyle.getPropertyValue('--p-yellow-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--p-blue-400'),
                    documentStyle.getPropertyValue('--p-orange-400'),
                    documentStyle.getPropertyValue('--p-green-400'),
                    documentStyle.getPropertyValue('--p-purple-400'),
                    documentStyle.getPropertyValue('--p-yellow-400')
                ]
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
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
        <div class="font-semibold text-xl mb-4 self-start">Career Paths</div>
        <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full md:w-[30rem]" />
    </div>
</template>