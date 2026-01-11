<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';
import { useSkillStore } from '@/stores/skill';
import { storeToRefs } from 'pinia';
import Skeleton from 'primevue/skeleton';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const skillStore = useSkillStore();
// Extract the computed aggregate directly
const { getDomainAggregates, isLoading } = storeToRefs(skillStore);

const chartData = ref(null);
const chartOptions = ref(null);

function setChartData() {
    // 1. Get Aggregated Data from Store
    const aggregates = getDomainAggregates.value || [];

    // Fallback if no system skills exist yet
    if (aggregates.length === 0) {
        return {
            labels: ['N/A'],
            datasets: [{ label: 'No Data', data: [0] }]
        };
    }

    // 2. Extract Labels (Domains) and Data (Avg Scores)
    const labels = aggregates.map(a => a.domain);
    const scores = aggregates.map(a => a.score);

    // 3. Generate Target (Goal) - slightly higher than current
    const targets = scores.map(s => s === 0 ? 20 : Math.min(s + 15, 100));

    return {
        labels: labels,
        datasets: [
            {
                label: 'Avg Proficiency',
                borderColor: '#7bc5cd',
                backgroundColor: 'rgba(123, 197, 205, 0.4)',
                pointBackgroundColor: '#7bc5cd',
                pointBorderColor: '#ffffff',
                pointHoverBackgroundColor: '#2c4c52',
                pointHoverBorderColor: '#7bc5cd',
                data: scores
            },
            {
                label: 'Target',
                borderColor: '#2c4c52',
                backgroundColor: 'rgba(44, 76, 82, 0.1)',
                pointBackgroundColor: '#2c4c52',
                pointBorderColor: '#ffffff',
                pointHoverBackgroundColor: '#7bc5cd',
                pointHoverBorderColor: '#2c4c52',
                data: targets
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
                    font: { family: 'monospace', weight: 'bold', size: 11 },
                    usePointStyle: true,
                    boxWidth: 8
                },
                position: 'bottom'
            },
            tooltip: {
                callbacks: {
                    // Custom Tooltip to show domain name
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw}%`;
                    }
                }
            }
        },
        scales: {
            r: {
                angleLines: { color: gridColor },
                grid: { color: gridColor },
                pointLabels: {
                    color: textColor,
                    font: { family: 'monospace', weight: 'bold', size: 10 }
                },
                ticks: {
                    display: false,
                    backdropColor: 'transparent',
                    max: 100,
                    min: 0,
                    stepSize: 20
                }
            }
        },
        maintainAspectRatio: false
    };
}

// Watch for changes in the computed aggregate (e.g. after fetch completes)
watch([getPrimary, getSurface, isDarkTheme, getDomainAggregates], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

onMounted(async () => {
    // Fetch BOTH tables to perform the cross-reference
    await Promise.all([
        skillStore.fetchSkills(),      // Source of Domains
        skillStore.fetchUserMatrix()   // Source of Scores
    ]);
});
</script>

<template>
    <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm flex flex-col items-center h-full relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-[#7bc5cd]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="w-full flex justify-between items-center mb-4 relative z-10">
            <div class="flex items-center gap-2">
                <i class="pi pi-chart-pie text-[#2c4c52]"></i>
                <h4 class="font-black text-[#2c4c52] uppercase text-sm">Domain Proficiency</h4>
            </div>
            <span class="font-mono text-[10px] font-bold text-[#7bc5cd] border border-[#7bc5cd]/30 px-2 py-0.5 rounded-full">REAL_TIME</span>
        </div>

        <div class="h-[250px] w-full flex items-center justify-center relative z-10">
            <div v-if="isLoading" class="w-full h-full flex items-center justify-center">
                <Skeleton shape="circle" size="200px" class="!bg-[#2c4c52]/10"></Skeleton>
            </div>

            <div v-else-if="!getDomainAggregates || getDomainAggregates.length === 0" class="flex flex-col items-center text-center opacity-60">
                <i class="pi pi-exclamation-circle text-4xl text-[#2c4c52]/40 mb-2"></i>
                <span class="font-mono text-xs font-bold text-[#2c4c52]">SYSTEM OFFLINE</span>
                <span class="text-[10px] text-[#4a7a82]">No skill domains defined.</span>
            </div>

            <Chart v-else type="radar" :data="chartData" :options="chartOptions" class="w-full h-full" />
        </div>
    </div>
</template>
