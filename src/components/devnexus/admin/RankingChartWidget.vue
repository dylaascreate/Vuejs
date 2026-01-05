<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);
const rankingType = ref('Careers');
const rankingOptions = ref(['Careers', 'Skills', 'Courses']);

const dataMap = {
    Careers: {
        labels: ['Frontend', 'Backend', 'Data Sci', 'DevOps', 'Product'],
        data: [1200, 950, 800, 600, 450]
    },
    Skills: {
        labels: ['Vue.js', 'Python', 'AWS', 'Docker', 'Figma'],
        data: [2500, 2100, 1800, 1500, 1200]
    },
    Courses: {
        labels: ['CS101', 'Web Dev', 'Data Struct', 'ML Basics', 'UX Design'],
        data: [3000, 2800, 2400, 2000, 1700]
    }
};

function setChartData() {
    const selectedData = dataMap[rankingType.value];

    return {
        labels: selectedData.labels,
        datasets: [
            {
                label: `Popularity`,
                backgroundColor: '#2c4c52',
                hoverBackgroundColor: '#7bc5cd',
                data: selectedData.data,
                borderRadius: 999, // Pill shape
                barPercentage: 0.5,
                borderSkipped: false
            }
        ]
    };
}

function setChartOptions() {
    const textColor = '#2c4c52';
    const surfaceBorder = 'rgba(44, 76, 82, 0.1)';

    return {
        indexAxis: 'y',
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#2c4c52',
                titleColor: '#ffffff',
                bodyColor: '#7bc5cd',
                padding: 10,
                displayColors: false
            }
        },
        scales: {
            x: {
                ticks: { color: textColor, font: { weight: 'bold', size: 10 } },
                grid: { display: false, drawBorder: false }
            },
            y: {
                ticks: { color: textColor, font: { weight: 'bold' } },
                grid: { color: surfaceBorder, drawBorder: false }
            }
        }
    };
}

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
    <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm h-full flex flex-col">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                 <h4 class="font-black text-[#2c4c52] uppercase text-lg leading-none mb-1">Top Rankings</h4>
                 <span class="font-mono text-xs font-bold text-[#4a7a82] uppercase">Performance Metrics</span>
            </div>
            <SelectButton v-model="rankingType" :options="rankingOptions" :allowEmpty="false"
                :pt="{
                    root: { class: 'flex bg-[#2c4c52]/5 p-1 rounded-xl' },
                    button: ({ context }) => ({
                        class: [
                            'px-3 py-1 text-xs font-bold rounded-lg transition-all',
                            context.active ? 'bg-[#2c4c52] text-[#7bc5cd] shadow-sm' : 'text-[#4a7a82] hover:text-[#2c4c52]'
                        ]
                    })
                }"
            />
        </div>
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80 w-full" />
    </div>
</template>
