<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);
const rankingType = ref('Careers');
const rankingOptions = ref(['Careers', 'Skills', 'Courses']);

// Mock Data
const dataMap = {
    Careers: {
        labels: ['Frontend Dev', 'Backend Dev', 'Data Scientist', 'DevOps Engineer', 'Product Manager'],
        data: [1200, 950, 800, 600, 450]
    },
    Skills: {
        labels: ['Vue.js', 'Python', 'AWS', 'Docker', 'Figma'],
        data: [2500, 2100, 1800, 1500, 1200]
    },
    Courses: {
        labels: ['Intro to CS', 'Web Development', 'Data Structures', 'Machine Learning', 'UX Design'],
        data: [3000, 2800, 2400, 2000, 1700]
    }
};

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    const selectedData = dataMap[rankingType.value];

    return {
        labels: selectedData.labels,
        datasets: [
            {
                label: `Popularity (${rankingType.value})`,
                backgroundColor: documentStyle.getPropertyValue('--p-indigo-500'),
                borderColor: documentStyle.getPropertyValue('--p-indigo-500'),
                data: selectedData.data,
                borderRadius: 4,
                barPercentage: 0.6
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        indexAxis: 'y', // Horizontal Bar Chart
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                display: false 
            },
            tooltip: {
                backgroundColor: documentStyle.getPropertyValue('--p-indigo-900'),
                titleColor: '#ffffff',
                bodyColor: '#ffffff'
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColor,
                    font: { weight: 500 }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColor
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}

// Watch for toggle changes
watch(rankingType, () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

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
    <div class="card h-full">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h5 class="font-bold text-xl m-0 text-indigo-900 dark:text-indigo-100">Platform Rankings</h5>
                <span class="text-sm text-muted-color">Top performers by category</span>
            </div>
            <SelectButton v-model="rankingType" :options="rankingOptions" aria-labelledby="basic" :allowEmpty="false" />
        </div>
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>