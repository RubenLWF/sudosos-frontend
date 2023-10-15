<template>
  <CardComponent header="invoices">
  <DataTable
      :value="invoices"
      v-model:editingRows="editingRows"
      editMode="cell"
      @cellEditComplete="updateCell"
      @cellEditInit="cellEditInit"
  >
    <Column field="id" header="ref" />
    <Column field="to" header="User">
      <template #body="slotProps">
        {{ slotProps.data.to.firstName }} {{ slotProps.data.to.lastName }}
      </template>
    </Column>
    <Column field="description" header="Description" />
    <Column field="currentState" header="State">
      <template #body="slotProps">
        {{ slotProps.data.currentState.state}}
      </template>
      <template #editor="{data, field}">
        <Dropdown
            placeholder="Select Payment State"
            :options="stateOptions"
            v-model="data[field].state"
            optionLabel="label"
            optionValue="value"
            >
        </Dropdown>
      </template>
    </Column>
    <Column field="transfer" header="amount" >
      <template #body="slotProps">
        {{ `€ ${(slotProps.data.transfer.amount.amount / 100).toFixed(2)}` }}
      </template>
    </Column>
  </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import {onMounted, Ref, ref} from "vue";
import apiService from "@/services/ApiService";
import DataTable, {DataTableCellEditCompleteEvent, DataTableCellEditInitEvent} from "primevue/datatable";
import Column from "primevue/column";
import type {InvoiceResponse} from "@sudosos/sudosos-client";

const invoices: Ref<Array<InvoiceResponse>> = ref([]);
const editingRows = ref();
const stateOptions: Array<{label: string, value: string}> = [
  {label: "CREATED", value: "CREATED"},
  {label: "SENT", value: "SENT"},
  {label: "PAID", value: "PAID"},
  {label: "DELETED", value: "DELETED"}
];

onMounted(async () => {
  await getInvoices();
  console.log(invoices.value);
});

const getInvoices = async () => {
  let res = await apiService.invoices.getAllInvoices();
  invoices.value = res.data.records;
};

const updateCell = async (event: DataTableCellEditCompleteEvent) => {
  const newState = event.newValue.state;
  console.log(newState);
  const oldInvoice = event.data as InvoiceResponse;
  const patchedInvoice = {
    addressee: oldInvoice.addressee,
    description: oldInvoice.description,
    state: newState,
  };
  const patchInvoiceResponse = await apiService.invoices.updateInvoice(oldInvoice.id, patchedInvoice);
  console.error(patchInvoiceResponse);
  invoices.value[invoices.value.findIndex(item => item.id === oldInvoice.id)].currentState.state = newState;
};

const cellEditInit = (event: DataTableCellEditInitEvent) => {
  console.log(event);
}
</script>

<style scoped lang="scss">

</style>
