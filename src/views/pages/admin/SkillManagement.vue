<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const skills = ref([]);
const skillDialog = ref(false);
const deleteSkillDialog = ref(false);
const deleteSkillsDialog = ref(false);
const skill = ref({});
const selectedSkills = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const domains = ref([
    { label: 'Frontend', value: 'Frontend' },
    { label: 'Backend', value: 'Backend' },
    { label: 'DevOps', value: 'DevOps' },
    { label: 'Mobile', value: 'Mobile' },
    { label: 'Design', value: 'Design' },
    { label: 'Soft Skills', value: 'Soft Skills' },
    { label: 'Data Science', value: 'Data Science' }
]);

const statuses = ref([
    { label: 'Active', value: 'Active' },
    { label: 'Deprecated', value: 'Deprecated' },
    { label: 'Draft', value: 'Draft' }
]);

// Mock Data Loading
onMounted(() => {
    skills.value = [
        { id: 1001, name: 'Vue.js', domain: 'Frontend', description: 'Progressive JavaScript Framework', status: 'Active' },
        { id: 1002, name: 'Python', domain: 'Backend', description: 'General purpose programming language', status: 'Active' },
        { id: 1003, name: 'Docker', domain: 'DevOps', description: 'Containerization platform', status: 'Active' },
        { id: 1004, name: 'Figma', domain: 'Design', description: 'Interface design tool', status: 'Active' },
        { id: 1005, name: 'AngularJS', domain: 'Frontend', description: 'Legacy framework', status: 'Deprecated' }
    ];
});

function openNew() {
    skill.value = { status: 'Active' };
    submitted.value = false;
    skillDialog.value = true;
}

function hideDialog() {
    skillDialog.value = false;
    submitted.value = false;
}

function saveSkill() {
    submitted.value = true;

    if (skill?.value.name?.trim() && skill?.value.domain) {
        if (skill.value.id) {
            // Update Existing
            const index = findIndexById(skill.value.id);
            skills.value[index] = skill.value;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Skill Updated', life: 3000 });
        } else {
            // Create New
            skill.value.id = createId();
            skills.value.push(skill.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Skill Created', life: 3000 });
        }

        skillDialog.value = false;
        skill.value = {};
    }
}

function editSkill(item) {
    skill.value = { ...item };
    skillDialog.value = true;
}

function confirmDeleteSkill(item) {
    skill.value = item;
    deleteSkillDialog.value = true;
}

function deleteSkill() {
    skills.value = skills.value.filter((val) => val.id !== skill.value.id);
    deleteSkillDialog.value = false;
    skill.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Skill Deleted', life: 3000 });
}

function findIndexById(id) {
    return skills.value.findIndex(s => s.id === id);
}

function createId() {
    return Math.floor(Math.random() * 10000);
}

function confirmDeleteSelected() {
    deleteSkillsDialog.value = true;
}

function deleteSelectedSkills() {
    skills.value = skills.value.filter((val) => !selectedSkills.value.includes(val));
    deleteSkillsDialog.value = false;
    selectedSkills.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Skills Deleted', life: 3000 });
}

function getStatusSeverity(status) {
    switch (status) {
        case 'Active': return 'success';
        case 'Draft': return 'info';
        case 'Deprecated': return 'danger';
        default: return null;
    }
}

function getDomainColor(domain) {
    switch (domain) {
        case 'Frontend': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
        case 'Backend': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
        case 'Design': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
        case 'DevOps': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
        default: return 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300';
    }
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New Skill" icon="pi pi-plus" severity="primary" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedSkills || !selectedSkills.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="dt.exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedSkills"
                :value="skills"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} skills"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Skills</h4>
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
                
                <Column field="domain" header="Domain" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <span :class="['px-2 py-1 rounded text-sm font-medium', getDomainColor(slotProps.data.domain)]">
                            {{ slotProps.data.domain }}
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
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editSkill(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteSkill(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="skillDialog" :style="{ width: '450px' }" header="Skill Details" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Skill Name</label>
                    <InputText id="name" v-model.trim="skill.name" required="true" autofocus :invalid="submitted && !skill.name" fluid />
                    <small v-if="submitted && !skill.name" class="text-red-500">Name is required.</small>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="domain" class="block font-bold mb-3">Domain</label>
                        <Select id="domain" v-model="skill.domain" :options="domains" optionLabel="label" optionValue="value" placeholder="Select Domain" fluid :invalid="submitted && !skill.domain"></Select>
                        <small v-if="submitted && !skill.domain" class="text-red-500">Domain is required.</small>
                    </div>
                    <div>
                        <label for="status" class="block font-bold mb-3">Status</label>
                        <Select id="status" v-model="skill.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Select Status" fluid></Select>
                    </div>
                </div>

                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model="skill.description" rows="3" cols="20" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveSkill" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteSkillDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span v-if="skill">Are you sure you want to delete <b>{{ skill.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteSkillDialog = false" />
                <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteSkill" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteSkillsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span v-if="skill">Are you sure you want to delete the selected skills?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteSkillsDialog = false" />
                <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteSelectedSkills" />
            </template>
        </Dialog>
    </div>
</template>