<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ $t('invoice.overview') }}</div>
    <div class="content-wrapper gap-5 flex md:flex-row flex-column">
      <InvoiceUsersTableComponent />
      <InvoiceTableComponent />
    </div>
  </div>
</template>

<script setup lang="ts">

import InvoiceUsersTableComponent from "@/components/InvoiceUsersTableComponent.vue";
import InvoiceTableComponent from "@/components/InvoiceTableComponent.vue";
</script>

<style scoped lang="scss">

</style>
