<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Students Registered',
                data: [650, 900, 1200, 1600, 2100, 2800],
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-blue-500'),
                tension: 0.4
            },
            {
                label: 'Roadmaps Generated',
                data: [300, 700, 1100, 1900, 2600, 3500],
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-orange-500'),
                tension: 0.4
            },
            {
                label: 'Courses Completed',
                data: [150, 400, 800, 1200, 1800, 2400],
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-purple-500'),
                tension: 0.4
            },
            {
                label: 'Projects Created',
                data: [50, 200, 450, 900, 1300, 1900],
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                tension: 0.4
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
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
    <div class="card">
        <div class="font-semibold text-xl mb-4">Engagement Funnel</div>
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>