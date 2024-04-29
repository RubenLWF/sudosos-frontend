<template>
  <CardComponent :header="$t('invoice.invoiceTable')" class="w-8">
    <DataTable :value="invoices">
      <Column field="id" :header="$t('invoice.ref')"></Column>
      <Column field="to" :header="$t('invoice.to')" >
        <template #body="slotProps">
          {{ `${ slotProps.data.to.firstName } ${ slotProps.data.to.lastName }` }}
        </template>
      </Column>
      <Column field="currentState" :header="$t('invoice.state')">
        <template #body="slotProps">
          {{ slotProps.data.currentState.state }}
        </template>
      </Column>
      <Column field="transfer" :header="$t('invoice.amount')" >
        <template #body="slotProps">
          {{ formatPrice(slotProps.data.transfer.amount) }}
        </template>
      </Column>
      <Column
        headerStyle="width: 3rem; text-align: center"
        bodyStyle="text-align: center; overflow: visible"
      >
        <template #body="slotProps">
          <Button
            type="button"
            icon="pi pi-file-pdf "
            outlined
            @click="handleDownload(slotProps.data.id)"
          />
        </template>
      </Column>
      <Column
        headerStyle="width: 3rem; text-align: center"
        bodyStyle="text-align: center; overflow: visible"
      >
        <template #body="slotProps">
          <Button
            type="button"
            icon="pi pi-info-circle "
            outlined
          />
        </template>
      </Column>
      <Column
        headerStyle="width: 3rem; text-align: center"
        bodyStyle="text-align: center; overflow: visible"
      >
        <template #body="slotProps">
          <Button
            type="button"
            icon="pi pi-pencil "
            outlined
          />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">

import CardComponent from "@/components/CardComponent.vue";
import { onMounted, ref } from "vue";
import apiService from "@/services/ApiService";
import { fetchAllPages } from "@sudosos/sudosos-frontend-common";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import Column from "primevue/column";
import { formatPrice } from "../utils/formatterUtils";

const invoices = ref();

onMounted(async () => {
  invoices.value = await fetchAllPages<InvoiceResponse>(0, 500, (take, skip) =>
    // @ts-ignore
    apiService.invoices.getAllInvoices(undefined, undefined, undefined, undefined, undefined, undefined, take, skip)
  );
});

function handleDownload(id: number) {
  console.log(id);
}
</script>

<style scoped>

</style>
