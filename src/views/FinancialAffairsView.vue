<template>
  <div class="page-container">
    <div class="page-title">{{ $t('financialAffairs.Financial affairs') }}</div>
    <div class="content-wrapper">
      <CardComponent header="vat groups">
        <DataTable
          :value="vatGroups.filter(vg => !vg.deleted)"
          v-model:editingRows="editingRows"
          editMode="row"
          @row-edit-save="updateRow"
        >
          <template #header>
            <div class="product-table-header">
              <span>
                <Button severity="danger" @click="openCreateModal">{{ $t('app.Create') }}</Button>
              </span>
            </div>
          </template>
          <Column field="name" header="Name">
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" style="width: 100%" />
            </template>
          </Column>
          <Column field="percentage" header="Percentage">
            <template #body="rowData">
              {{ `${rowData.data.percentage} %` }}
            </template>
          </Column>
          <Column field="deleted" header="">
            <template #body="rowData"><Button severity="danger" @click="() => openDeleteModal(rowData.data)"><i class="pi pi-trash"/></Button></template>
          </Column>
          <Column
            :rowEditor="true"
            style="width: 10%; min-width: 8rem"
            bodyStyle="text-align:center"
          />
        </DataTable>
        <VatGroupCreateModal :close-create-modal="closeCreateModal" :vat-group="selectedVatGroup" v-model:visible="visibleCreateModal" />
        <VatGroupDeleteModal :close-delete-modal="closeDeleteModal" :vat-group="selectedVatGroup" v-model:visible="visibleDeleteModal" />
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import type { Ref } from 'vue';
import { onMounted, ref } from 'vue';
import apiService from '@/services/ApiService';
import type {
  UpdateVatGroupRequest,
  VatGroup
} from '@sudosos/sudosos-client';
import type { DataTableRowEditSaveEvent } from 'primevue/datatable';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import VatGroupCreateModal from '@/components/VatGroupCreateModal.vue';
import VatGroupDeleteModal from '@/components/VatGroupDeleteModal.vue';

const visibleCreateModal = ref(false);
const visibleDeleteModal = ref(false);
const vatGroups: Ref<VatGroup[]> = ref([]);
const selectedVatGroup: Ref<VatGroup | undefined> = ref();
const editingRows = ref([]);

const updateVatGroups = async () => {
  const vatGroupsResp = await apiService.vatGroups.getAllVatGroups();
  vatGroups.value = vatGroupsResp.data.records;
}

const openCreateModal = () => {
  selectedVatGroup.value = undefined;
  visibleCreateModal.value = true;
};

const closeCreateModal = async () => {
  visibleCreateModal.value = false;
  updateVatGroups();
};

const openDeleteModal = (vatGroup: VatGroup) => {
  selectedVatGroup.value = vatGroup;
  visibleDeleteModal.value = true;
};

const closeDeleteModal = async () => {
  visibleDeleteModal.value = false;
  updateVatGroups();
};



onMounted(async () => {
  updateVatGroups();
});

const updateRow = async (event: DataTableRowEditSaveEvent) => {
  await apiService.vatGroups.updateVatGroup(event.newData.id, {
    name: event.newData.name,
    hidden: event.newData.hidden,
    deleted: event.newData.deleted
  });
  vatGroups.value[event.index] = event.newData;
};
</script>

<style scoped>
@import '../styles/BasePage.css';
@import 'primeicons/primeicons.css';

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8f8f8;
  border-top: none;
  text-transform: uppercase;
  font-family: Lato, Arial, sans-serif !important;
  font-size: 1rem;
  padding: 0.375rem 0;
  line-height: 1.5;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: #f8f8f8;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none;
  padding: 0.375rem 0.2rem;
  font-size: 1rem;
  font-family: Lato, Arial, sans-serif !important;
}

.product-image {
  height: 4rem;
}

.p-panel {
  width: 100%;
}

.product-table-header {
  background-color: #f8f8f8;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

:deep(.p-datatable-header) {
  background-color: #f8f8f8 !important;
  border: none !important;
  padding-left: 0;
}

:deep(.p-paginator) {
  background-color: #f8f8f8;
}

:deep(.p-inputtext) {
  width: 100%;
}

.content-wrapper {
  flex-direction: column;
}

.container-card {
  margin-top: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  background-color: #f8f8f8 !important;
  min-width: 100%;
}

:deep(.p-tabview) {
  background-color: #f8f8f8;
}

:deep(.p-tabview-nav-link) {
  background-color: #f8f8f8 !important;
}

:deep(.p-tabview-panel) {
  background-color: #f8f8f8;
}
:deep(.p-tabview-panels) {
  background-color: #f8f8f8 !important;
}

.content-wrapper { 
  width: 45%;
}
</style>
