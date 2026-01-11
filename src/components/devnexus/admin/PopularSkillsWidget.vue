<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch, computed } from 'vue';
import { useSkillStore } from '@/stores/skill'; //

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const skillStore = useSkillStore(); //

const chartData = ref(null);
const chartOptions = ref(null);

// Map store stats to Chart.js format
function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    const stats = skillStore.stats?.popular_skills || []; // Assuming backend returns popular_skills array

    return {
        labels: stats.length ? stats.map(s => s.name) : ['React', 'Python', 'AWS', 'Vue.js', 'Docker'],
        datasets: [
            {
                label: 'Student Interest',
                backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
                borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                data: stats.length ? stats.map(s => s.count) : [95, 88, 82, 75, 70]
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        indexAxis: 'y',
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: { labels: { color: textColor } }
        },
        scales: {
            x: {
                ticks: { color: textColor, font: { weight: 500 } },
                grid: { display: false, drawBorder: false }
            },
            y: {
                ticks: { color: textColor },
                grid: { color: surfaceBorder, drawBorder: false }
            }
        }
    };
}

// Reload chart when store data changes
watch(() => skillStore.stats, () => {
    chartData.value = setChartData();
});

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

onMounted(async () => {
    await skillStore.fetchSkillStats(); //
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <div class="font-semibold text-xl">Most Popular Skills</div>
            <i v-if="skillStore.loading" class="pi pi-spin pi-spinner"></i> </div>
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
