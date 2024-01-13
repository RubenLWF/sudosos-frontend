<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ t('socialDrinkCards.overview') }}</div>
    <div class="content-wrapper gap-5 flex md:flex-row flex-column">
      <CardComponent :header="t('socialDrinkCards.voucherGroups')" class="w-full">
        <template #topAction>
          <Button @click="visible = true">{{ t('socialDrinkCards.create') }}</Button>
        </template>
        <DataTable
          :value="voucherGroups"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        >
          <Column field="id" :header="t('socialDrinkCards.id')" />
          <Column field="name" :header="t('socialDrinkCards.name')" />
          <Column field="activeStartDate" :header="t('socialDrinkCards.activeStartDate')">
            <template #body="slotProps">{{ formatDateTime(new Date(slotProps.data.activeStartDate)) }}</template>
          </Column>
          <Column field="activeEndDate" :header="t('socialDrinkCards.activeEndDate')">
            <template #body="slotProps">{{ formatDateTime(new Date(slotProps.data.activeEndDate)) }}</template>
          </Column>
          <Column field="balance" :header="t('socialDrinkCards.balance')">
            <template #body="slotProps">{{ formatPrice(slotProps.data.balance) }}</template>
          </Column>
          <Column field="users.length" :header="t('socialDrinkCards.users')" />
          <Column :header="t('socialDrinkCards.info')" />
          <Column :header="t('socialDrinkCards.download')" />
        </DataTable>
      </CardComponent>
      <Dialog v-model:visible="visible" class="w-auto flex w-9 md:w-4" :header="t('socialDrinkCards.createLong')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { onMounted, ref, type Ref } from "vue";
import type { FineHandoutEventResponse, VoucherGroupResponse } from "@sudosos/sudosos-client";
import { fetchAllPages } from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import CardComponent from "@/components/CardComponent.vue";
import { formatDateTime, formatPrice } from "@/utils/formatterUtils";

const { t } = useI18n();

const voucherGroups: Ref<Array<VoucherGroupResponse>> = ref([]);
const visible: Ref<boolean> = ref(false)
onMounted(async () => {
  voucherGroups.value = await fetchAllPages<FineHandoutEventResponse>(
    0,
    Number.MAX_SAFE_INTEGER,
    // @ts-ignore
    (take, skip) => apiService.borrelkaart.getAllVouchergroups(take, skip)
  );
  console.log(voucherGroups.value);
});
</script>

<style scoped>

</style>
