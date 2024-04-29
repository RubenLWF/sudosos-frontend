<template>
  <CardComponent :header="$t('invoice.open')">
    <DataTable
    :value="finalUsersData"
    >
      <Column field="fullName" :header="$t('invoice.fullName')" />
      <Column field="balance" :header="$t('invoice.balance')">
        <template #body="slotProps">
          {{ formatPrice(slotProps.data.balance) }}
        </template>
      </Column>
      <Column
        headerStyle="width: 3rem; text-align: center"
        bodyStyle="text-align: center; overflow: visible"
      >
        <template #body="slotProps">
          <Button
            type="button"
            icon="pi pi-file "
            outlined
            @click="router.push(`/invoice/create/${slotProps.data.id}`)"
          />
        </template>

      </Column>
  </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { onMounted, type Ref, ref } from "vue";
import apiService from "@/services/ApiService";
import type { UserResponse } from "@sudosos/sudosos-client";
import CardComponent from "@/components/CardComponent.vue";
import { formatPrice } from "@/utils/formatterUtils";
import router from "@/router";

const finalUsersData: Ref<any[]> = ref([]);

onMounted(async () => {
  const usersResponse = await apiService.user.getAllUsersOfUserType("INVOICE");
  const users = usersResponse.data.records;

  // Prepare promises to fetch balance for each user
  const balancePromises = users.map(async (user: UserResponse) => {
    const balanceResponse = await apiService.balance.getBalanceId(user.id);
    return {
      fullName: `${user.firstName} ${user.lastName}`,
      balance: balanceResponse.data.amount,
      id: user.id,
    };
  });

  // Resolve all promises and set the final users data
  finalUsersData.value = await Promise.all(balancePromises);
  console.log(finalUsersData.value);
});
</script>

<style scoped lang="scss">

</style>
