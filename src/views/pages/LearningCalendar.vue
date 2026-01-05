<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const toast = useToast();
const confirm = useConfirm();

// --- Calendar Logic ---
const currentDate = ref(new Date());
const selectedDate = ref(null);
const logDialog = ref(false);

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const entryTypes = ref(['Log', 'Deadline']);
const selectedEntryType = ref('Log');

const currentMonthName = computed(() => {
    return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const padding = firstDay.getDay();

    for (let i = 0; i < padding; i++) {
        days.push({ day: '', date: null, type: 'padding' });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
            day: i,
            date: dateStr,
            type: 'active',
            isToday: dateStr === new Date().toISOString().split('T')[0]
        });
    }
    return days;
});

const changeMonth = (offset) => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + offset, 1);
};

// --- Data ---
const streak = ref(12);

// Events Database (Array based)
const events = ref({
    '2025-03-15': [
        { id: 1, type: 'deadline', title: 'React Hooks Mastery', completed: false }
    ],
    '2025-03-20': [
        { id: 2, type: 'deadline', title: 'Capstone Project Alpha', completed: false }
    ],
    '2025-03-10': [
        { id: 3, type: 'log', title: 'Studied Vue Composition API', content: 'Learned about ref vs reactive.' },
        { id: 4, type: 'log', title: 'CSS Grid System', content: 'Practiced grid-template-areas.' }
    ],
});

// --- Computed Helpers ---
const sortedMilestones = computed(() => {
    let milestones = [];
    Object.keys(events.value).forEach(date => {
        events.value[date].forEach(evt => {
            if (evt.type === 'deadline') {
                milestones.push({ date, ...evt });
            }
        });
    });
    return milestones.sort((a, b) => new Date(a.date) - new Date(b.date));
});

const recentActivity = computed(() => {
    let allLogs = [];
    Object.keys(events.value).forEach(date => {
        events.value[date].forEach(evt => {
            if (evt.type === 'log') {
                allLogs.push({ date, ...evt });
            }
        });
    });
    // Sort Descending
    return allLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
});

// Form Data
const newLog = ref({ title: '', content: '' });

// --- Actions ---
const onDayClick = (dayObj) => {
    if (dayObj.type === 'padding') return;
    selectedDate.value = dayObj.date;
    newLog.value = { title: '', content: '' };
    selectedEntryType.value = 'Log';
    logDialog.value = true;
};

const saveEntry = () => {
    if (!newLog.value.title) return;

    if (!events.value[selectedDate.value]) {
        events.value[selectedDate.value] = [];
    }

    const type = selectedEntryType.value.toLowerCase();

    events.value[selectedDate.value].push({
        id: Date.now(),
        type: type,
        title: newLog.value.title,
        content: newLog.value.content,
        completed: false
    });

    if (type === 'log' && selectedDate.value === new Date().toISOString().split('T')[0]) {
        streak.value++;
    }

    toast.add({ severity: 'success', summary: 'Entry Added', detail: `${selectedEntryType.value} logged successfully.`, life: 3000 });
    newLog.value = { title: '', content: '' };
};

const deleteEntry = (index) => {
    confirm.require({
        message: 'Remove this specific entry?',
        header: 'Confirm Deletion',
        icon: 'pi pi-trash',
        acceptClass: 'p-button-danger',
        accept: () => {
            events.value[selectedDate.value].splice(index, 1);
            if (events.value[selectedDate.value].length === 0) {
                delete events.value[selectedDate.value];
            }
            toast.add({ severity: 'success', summary: 'Deleted', detail: 'Entry removed.', life: 3000 });
        }
    });
};

// --- CHECKBOX LOGIC ---
const handleMilestoneCheck = (milestone) => {
    if (milestone.completed) {
        setTimeout(() => {
            completeMilestone(milestone);
        }, 500);
    }
};

const completeMilestone = (milestoneData) => {
    const { date, id, title } = milestoneData;
    const dayEvents = events.value[date];

    if (dayEvents) {
        const index = dayEvents.findIndex(e => e.id === id);
        if (index !== -1) {
            // Remove Deadline
            dayEvents.splice(index, 1);

            // Add Achievement Log
            dayEvents.push({
                id: Date.now(),
                type: 'log',
                title: `Achieved: ${title}`,
                content: 'Milestone successfully completed.'
            });

            if (date === new Date().toISOString().split('T')[0]) {
                streak.value++;
            }

            toast.add({ severity: 'success', summary: 'Milestone Completed', detail: 'Moved to Activity Log', life: 3000 });
        }
    }
};

const completeMilestoneFromDialog = (date, index) => {
    const dayEvents = events.value[date];
    if (dayEvents && dayEvents[index]) {
        const evt = dayEvents[index];
        completeMilestone({ date, id: evt.id, title: evt.title });
    }
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">
        <div class="absolute inset-0 z-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4">

            <div class="col-span-12 flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                        <i class="pi pi-calendar text-xs"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">TEMPORAL_LOG_V3</span>
                    </div>
                    <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">Learning Calendar</h2>
                </div>

                <div class="flex items-center gap-4 bg-white/60 backdrop-blur-md border border-white p-2 pr-6 rounded-full shadow-sm">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg animate-bounce-slow">
                        <i class="pi pi-bolt text-xl"></i>
                    </div>
                    <div>
                        <div class="text-xs font-mono font-bold text-[#4a7a82] uppercase">Current Streak</div>
                        <div class="text-2xl font-black text-[#2c4c52] leading-none">{{ streak }} <span class="text-sm font-medium">DAYS</span></div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-8">
                <div class="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_20px_40px_-15px_rgba(44,76,82,0.1)] overflow-hidden">

                    <div class="flex items-center justify-between p-6 border-b border-[#2c4c52]/10">
                        <Button icon="pi pi-chevron-left" text rounded @click="changeMonth(-1)" class="!text-[#2c4c52]" />
                        <h3 class="text-xl font-black text-[#2c4c52] uppercase tracking-wide select-none">{{ currentMonthName }}</h3>
                        <Button icon="pi pi-chevron-right" text rounded @click="changeMonth(1)" class="!text-[#2c4c52]" />
                    </div>

                    <div class="p-6">
                        <div class="grid grid-cols-7 mb-4">
                            <div v-for="day in weekDays" :key="day" class="text-center font-mono text-xs font-bold text-[#4a7a82] opacity-60">
                                {{ day }}
                            </div>
                        </div>

                        <div class="grid grid-cols-7 gap-2 md:gap-4">
                            <div v-for="(dayObj, index) in calendarDays" :key="index"
                                 class="aspect-square relative rounded-xl border transition-all duration-200 group flex flex-col items-center justify-center"
                                 :class="[
                                    dayObj.type === 'padding' ? 'border-transparent cursor-default' : 'bg-white/50 border-white hover:border-[#7bc5cd] hover:shadow-md cursor-pointer',
                                    dayObj.isToday ? '!border-[#2c4c52] !bg-[#2c4c52]/5' : ''
                                 ]"
                                 @click="onDayClick(dayObj)">

                                <span v-if="dayObj.day" class="text-lg font-bold text-[#2c4c52]">{{ dayObj.day }}</span>

                                <div v-if="dayObj.date && events[dayObj.date]" class="flex gap-1 mt-1 justify-center">
                                    <div v-for="(evt, i) in events[dayObj.date].slice(0,3)" :key="i"
                                         class="w-1.5 h-1.5 rounded-full shadow-sm"
                                         :class="evt.type === 'deadline' ? 'bg-red-500' : 'bg-[#7bc5cd]'">
                                    </div>
                                    <div v-if="events[dayObj.date].length > 3" class="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">

                <div class="bg-[#2c4c52] text-[#e0f2f1] p-6 rounded-3xl relative shadow-lg flex flex-col">
                    <div class="relative z-10 flex flex-col h-full">
                        <h4 class="font-black text-lg uppercase mb-4 flex items-center gap-2 shrink-0">
                            <i class="pi pi-clock text-[#7bc5cd]"></i> Milestones
                        </h4>

                        <div class="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[200px] max-h-[45vh]">
                            <div v-for="milestone in sortedMilestones" :key="milestone.id"
                                 class="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center gap-3 group hover:bg-white/20 transition-colors shrink-0">

                                <Checkbox
                                    v-model="milestone.completed"
                                    :binary="true"
                                    class="y2k-checkbox"
                                    @change="handleMilestoneCheck(milestone)"
                                />

                                <div class="flex-1">
                                    <div class="text-[#7bc5cd] font-mono text-xs font-bold">{{ milestone.date }}</div>
                                    <div class="font-bold text-sm transition-opacity duration-300"
                                         :class="{'line-through opacity-50 text-[#7bc5cd]': milestone.completed}">
                                        {{ milestone.title }}
                                    </div>
                                </div>
                            </div>

                            <div v-if="sortedMilestones.length === 0" class="text-center py-6 border border-dashed border-white/20 rounded-xl">
                                <span class="text-white/40 text-sm italic">No upcoming milestones.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl flex flex-col">
                    <h4 class="font-black text-lg text-[#2c4c52] uppercase mb-4 flex items-center gap-2 shrink-0">
                        <i class="pi pi-list text-[#7bc5cd]"></i> Activity Log
                    </h4>

                    <div class="relative border-l-2 border-[#2c4c52]/10 ml-2 space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[200px] max-h-[45vh]">
                        <div v-for="(log, i) in recentActivity" :key="i" class="pl-6 relative group shrink-0">
                            <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#7bc5cd] border-2 border-white group-hover:scale-125 transition-transform"></div>
                            <div class="text-[10px] font-mono font-bold text-[#4a7a82]">{{ log.date }}</div>
                            <div class="font-bold text-[#2c4c52] text-sm leading-tight">{{ log.title }}</div>
                            <div class="text-xs text-[#2c4c52]/70 mt-1 line-clamp-2">{{ log.content }}</div>
                        </div>
                        <div v-if="recentActivity.length === 0" class="text-sm text-[#4a7a82] italic pl-6">No logs recorded yet.</div>
                    </div>
                </div>

            </div>
        </div>

        <Dialog v-model:visible="logDialog" modal :style="{ width: '500px' }" class="y2k-dialog" :dismissableMask="true">
            <template #header>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-[#2c4c52] text-[#7bc5cd] flex items-center justify-center font-bold font-mono text-lg shadow-inner">
                        {{ selectedDate ? selectedDate.split('-')[2] : '00' }}
                    </div>
                    <div>
                        <span class="block text-[10px] font-mono font-bold text-[#4a7a82] uppercase tracking-wider">Timeline Entry</span>
                        <span class="block font-black text-[#2c4c52] uppercase text-lg">{{ selectedDate }}</span>
                    </div>
                </div>
            </template>

            <div class="flex flex-col gap-6 pt-2">
                <div v-if="events[selectedDate] && events[selectedDate].length > 0" class="space-y-3">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase block">Entries for this day</label>
                    <div v-for="(evt, index) in events[selectedDate]" :key="index"
                         class="p-4 bg-[#e0f2f1] rounded-2xl border border-[#7bc5cd]/30 relative group transition-all hover:shadow-md">

                        <div class="flex justify-between items-start mb-1">
                            <span class="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2c4c52] text-white px-2 py-0.5 rounded shadow-sm">
                                {{ evt.type }}
                            </span>
                            <div class="flex gap-2">
                                <Button v-if="evt.type === 'deadline'" icon="pi pi-check" text rounded class="!w-6 !h-6 !text-green-600 hover:bg-green-100"
                                        v-tooltip.top="'Complete'" @click="completeMilestoneFromDialog(selectedDate, index)" />
                                <Button icon="pi pi-trash" text rounded class="!w-6 !h-6 !text-red-400 hover:!text-red-600 hover:bg-red-100" @click="deleteEntry(index)" />
                            </div>
                        </div>

                        <div class="font-bold text-[#2c4c52] text-md leading-tight">
                            {{ evt.title }}
                        </div>
                        <p class="text-xs text-[#4a7a82] mt-1" v-if="evt.content">{{ evt.content }}</p>
                    </div>
                </div>
                <div v-else class="text-center py-4 text-sm text-[#4a7a82] italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No entries for this date.
                </div>

                <div class="pt-4 border-t border-[#2c4c52]/10">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase block mb-3">Add New Entry</label>

                    <div class="space-y-4">
                        <SelectButton v-model="selectedEntryType" :options="entryTypes"
                            :pt="{
                                button: ({ context }) => ({
                                    class: context.active ? 'bg-[#2c4c52] text-[#7bc5cd] border-none font-bold' : 'bg-surface-100 border-none text-[#2c4c52]'
                                })
                            }"
                            class="w-full font-mono text-xs"
                        />

                        <div class="space-y-1">
                            <InputText v-model="newLog.title"
                                :placeholder="selectedEntryType === 'Deadline' ? 'e.g. Project Submission' : 'e.g. Studied Chapter 5'"
                                class="y2k-input w-full" />
                        </div>

                        <div class="space-y-1">
                            <Textarea v-model="newLog.content" rows="2" placeholder="Details or notes..." class="y2k-input w-full" />
                        </div>

                        <Button :label="`ADD ${selectedEntryType.toUpperCase()}`" icon="pi pi-plus" class="y2k-button-primary w-full !text-xs" @click="saveEntry" />
                    </div>
                </div>
            </div>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<style scoped>
/* Checkbox Styling */
:deep(.y2k-checkbox .p-checkbox-box) {
    border-color: rgba(255, 255, 255, 0.4) !important;
    background: rgba(255, 255, 255, 0.1) !important;
    border-radius: 6px !important;
    transition: all 0.2s ease;
}
:deep(.y2k-checkbox:hover .p-checkbox-box) {
    border-color: #7bc5cd !important;
    background: rgba(123, 197, 205, 0.2) !important;
}
:deep(.y2k-checkbox .p-checkbox-box.p-highlight) {
    background: #7bc5cd !important;
    border-color: #7bc5cd !important;
    box-shadow: 0 0 10px rgba(123, 197, 205, 0.4);
}
:deep(.y2k-checkbox .p-checkbox-icon) {
    color: #2c4c52 !important;
    font-weight: bold;
}

/* Y2K Utilities */
.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 10px 20px -5px rgba(44, 76, 82, 0.4);
    transition: all 0.3s ease;
}
.y2k-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -5px rgba(44, 76, 82, 0.5);
    filter: brightness(1.1);
}

.y2k-input {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 1px solid rgba(44, 76, 82, 0.2) !important;
    border-radius: 8px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
}

:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer) {
    background: #ffffff !important;
    border-color: #2c4c52 !important;
    color: #2c4c52;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(44, 76, 82, 0.1);
    border-radius: 10px;
}

.animate-bounce-slow {
    animation: bounce 3s infinite;
}
</style>
