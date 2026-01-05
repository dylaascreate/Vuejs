<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const loading = ref(true);

const users = ref([
    { id: 101, name: 'Alex Nexus', email: 'alex@devnexus.com', role: 'Student', status: 'ACTIVE' },
    { id: 102, name: 'Sarah Tech', email: 'sarah@univeristy.edu', role: 'Instructor', status: 'PENDING' },
    { id: 103, name: 'Jordan Byte', email: 'jordan@devnexus.com', role: 'Student', status: 'BANNED' },
    { id: 104, name: 'Kim Cloud', email: 'kim@aws-partner.com', role: 'Admin', status: 'ACTIVE' }
]);

onMounted(() => {
    setTimeout(() => { loading.value = false; }, 1000);
});

const getStatusSeverity = (status) => {
    switch (status) {
        case 'ACTIVE': return 'success';
        case 'PENDING': return 'warn';
        case 'BANNED': return 'danger';
        default: return 'info';
    }
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">
        <div class="relative z-10 grid grid-cols-12 gap-8 p-4">

            <div class="col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 class="text-4xl font-black text-[#2c4c52] uppercase tracking-tighter">User Directory</h2>
                    <p class="font-mono text-xs text-[#7bc5cd] font-bold uppercase tracking-widest">Database_Registry_v1.0</p>
                </div>
                <Button label="INITIALIZE_NEW_USER" icon="pi pi-plus" class="y2k-button-primary !text-sm !py-4 !px-6" />
            </div>

            <div class="col-span-12">
                <div class="card p-0 overflow-hidden border border-white/60 shadow-xl">
                    <DataTable
                        :value="users"
                        :loading="loading"
                        class="y2k-glass-table"
                        responsiveLayout="scroll"
                        sortMode="multiple"
                        :rows="10"
                    >
                        <Column field="name" header="USER_IDENTITY" sortable>
                            <template #body="slotProps">
                                <div class="flex items-center gap-4">
                                    <Avatar :label="slotProps.data.name[0]" shape="circle" class="!w-10 !h-10 !bg-[#2c4c52] !text-[#7bc5cd] !font-bold" />
                                    <span class="font-bold text-lg">{{ slotProps.data.name }}</span>
                                </div>
                            </template>
                        </Column>

                        <Column field="email" header="UPLINK_ADDRESS" sortable>
                            <template #body="slotProps">
                                <span class="font-mono text-sm font-semibold opacity-80">{{ slotProps.data.email }}</span>
                            </template>
                        </Column>

                        <Column field="role" header="ACCESS_LEVEL" sortable>
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.role" class="!bg-[#2c4c52]/10 !text-[#2c4c52] !text-xs !font-black !px-3 !py-1" />
                            </template>
                        </Column>

                        <Column field="status" header="NODE_STATUS" sortable>
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" class="!font-mono !text-xs !px-3" />
                            </template>
                        </Column>

                        <Column header="OPERATIONS" headerStyle="width: 10rem" bodyStyle="text-align: center">
                            <template #body>
                                <div class="flex gap-3 justify-center">
                                    <Button icon="pi pi-pencil" text rounded class="!text-[#2c4c52] !scale-125" />
                                    <Button icon="pi pi-trash" text rounded class="!text-red-500 !scale-125" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Glassmorphic Table Reset */
:deep(.y2k-glass-table.p-datatable) {
    background: transparent !important;
}

/* Bigger Header Font */
:deep(.y2k-glass-table .p-datatable-thead > tr > th) {
    background: rgba(255, 255, 255, 0.25) !important;
    color: #2c4c52 !important;
    font-family: monospace;
    font-size: 13px; /* Scaled up */
    font-weight: 900;
    text-transform: uppercase;
    padding: 1.75rem 1.25rem;
    border-bottom: 2px solid rgba(44, 76, 82, 0.15);
}

/* Bigger Body Font */
:deep(.y2k-glass-table .p-datatable-tbody > tr) {
    background: transparent !important;
    color: #2c4c52 !important;
    font-size: 14px; /* Scaled up */
    transition: all 0.2s ease;
}

:deep(.y2k-glass-table .p-datatable-tbody > tr:hover) {
    background: rgba(123, 197, 205, 0.15) !important;
    transform: scale(1.002);
}

:deep(.y2k-glass-table .p-datatable-tbody > tr > td) {
    padding: 1.25rem;
    border-bottom: 1px solid rgba(44, 76, 82, 0.08);
}

/* Sorting Icon Styling */
:deep(.p-sortable-column-icon) {
    color: #7bc5cd !important;
    margin-left: 0.5rem;
    font-size: 0.8rem;
}

.y2k-button-primary {
    background: #2c4c52 !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
}
</style>
