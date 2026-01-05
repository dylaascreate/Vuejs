<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const careers = ref([]);
const careerDialog = ref(false);
const deleteCareerDialog = ref(false);
const deleteCareersDialog = ref(false);
const career = ref({});
const selectedCareers = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const categories = ref([
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Design', value: 'Design' },
    { label: 'Product', value: 'Product' },
    { label: 'Data', value: 'Data' },
    { label: 'Marketing', value: 'Marketing' }
]);

const statuses = ref([
    { label: 'Active', value: 'Active' },
    { label: 'Deprecated', value: 'Deprecated' },
    { label: 'Draft', value: 'Draft' }
]);

// Mock Data Loading
onMounted(() => {
    careers.value = [
        { id: 1001, name: 'Frontend Engineer', category: 'Engineering', description: 'Builds user interfaces using web technologies.', status: 'Active' },
        { id: 1002, name: 'UX Designer', category: 'Design', description: 'Designs the user experience and interface.', status: 'Active' },
        { id: 1003, name: 'Data Scientist', category: 'Data', description: 'Analyzes complex data to help make decisions.', status: 'Active' },
        { id: 1004, name: 'Product Manager', category: 'Product', description: 'Oversees product development and strategy.', status: 'Active' },
        { id: 1005, name: 'Legacy Systems Admin', category: 'Engineering', description: 'Maintains older infrastructure.', status: 'Deprecated' }
    ];
});

function openNew() {
    career.value = { status: 'Active' };
    submitted.value = false;
    careerDialog.value = true;
}

function hideDialog() {
    careerDialog.value = false;
    submitted.value = false;
}

function saveCareer() {
    submitted.value = true;

    if (career?.value.name?.trim() && career?.value.category) {
        if (career.value.id) {
            // Update Existing
            const index = findIndexById(career.value.id);
            careers.value[index] = career.value;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Career Updated', life: 3000 });
        } else {
            // Create New
            career.value.id = createId();
            careers.value.push(career.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Career Created', life: 3000 });
        }

        careerDialog.value = false;
        career.value = {};
    }
}

function editCareer(item) {
    career.value = { ...item };
    careerDialog.value = true;
}

function confirmDeleteCareer(item) {
    career.value = item;
    deleteCareerDialog.value = true;
}

function deleteCareer() {
    careers.value = careers.value.filter((val) => val.id !== career.value.id);
    deleteCareerDialog.value = false;
    career.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Career Deleted', life: 3000 });
}

function findIndexById(id) {
    return careers.value.findIndex(c => c.id === id);
}

function createId() {
    return Math.floor(Math.random() * 10000);
}

function confirmDeleteSelected() {
    deleteCareersDialog.value = true;
}

function deleteSelectedCareers() {
    careers.value = careers.value.filter((val) => !selectedCareers.value.includes(val));
    deleteCareersDialog.value = false;
    selectedCareers.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Careers Deleted', life: 3000 });
}

function getStatusSeverity(status) {
    switch (status) {
        case 'Active': return 'success';
        case 'Draft': return 'info';
        case 'Deprecated': return 'danger';
        default: return null;
    }
}

function getCategoryColor(category) {
    switch (category) {
        case 'Engineering': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
        case 'Design': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
        case 'Data': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
        case 'Product': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
        default: return 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300';
    }
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New Career" icon="pi pi-plus" severity="primary" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedCareers || !selectedCareers.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="dt.exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedCareers"
                :value="careers"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} careers"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Careers</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="name" header="Name" sortable style="min-width: 14rem; font-weight: bold;"></Column>
                
                <Column field="category" header="Category" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <span :class="['px-2 py-1 rounded text-sm font-medium', getCategoryColor(slotProps.data.category)]">
                            {{ slotProps.data.category }}
                        </span>
                    </template>
                </Column>

                <Column field="description" header="Description" sortable style="min-width: 20rem"></Column>
                
                <Column field="status" header="Status" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
                    </template>
                </Column>

                <Column :exportable="false" style="min-width: 10rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCareer(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteCareer(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="careerDialog" :style="{ width: '450px' }" header="Career Details" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Career Name</label>
                    <InputText id="name" v-model.trim="career.name" required="true" autofocus :invalid="submitted && !career.name" fluid />
                    <small v-if="submitted && !career.name" class="text-red-500">Name is required.</small>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="category" class="block font-bold mb-3">Category</label>
                        <Select id="category" v-model="career.category" :options="categories" optionLabel="label" optionValue="value" placeholder="Select Category" fluid :invalid="submitted && !career.category"></Select>
                        <small v-if="submitted && !career.category" class="text-red-500">Category is required.</small>
                    </div>
                    <div>
                        <label for="status" class="block font-bold mb-3">Status</label>
                        <Select id="status" v-model="career.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Select Status" fluid></Select>
                    </div>
                </div>

                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model="career.description" rows="3" cols="20" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveCareer" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCareerDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span v-if="career">Are you sure you want to delete <b>{{ career.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCareerDialog = false" />
                <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteCareer" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCareersDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span v-if="career">Are you sure you want to delete the selected careers?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCareersDialog = false" />
                <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteSelectedCareers" />
            </template>
        </Dialog>
    </div>
</template>