<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['Completed', 'In Progress', 'To Do'],
        datasets: [
            {
                data: [30, 50, 20],
                backgroundColor: [
                    documentStyle.getPropertyValue('--p-green-500'),
                    documentStyle.getPropertyValue('--p-orange-500'),
                    documentStyle.getPropertyValue('--p-gray-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--p-green-400'),
                    documentStyle.getPropertyValue('--p-orange-400'),
                    documentStyle.getPropertyValue('--p-gray-400')
                ]
            }
        ]
    };
}

function setChartOptions() {
    return {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true
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
        <div class="font-semibold text-xl mb-4 self-start">Roadmap Status</div>
        <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full md:w-[30rem]" />
    </div>
</template>