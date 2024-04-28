<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ $t('invoice.overview') }}</div>
    <div class="content-wrapper gap-5 flex md:flex-column flex-column">
      <InvoiceUsersTableComponent />
    </div>
  </div>
</template>

<script setup lang="ts">

import InvoiceUsersTableComponent from "@/components/InvoiceUsersTableComponent.vue";
</script>

<style scoped lang="scss">

</style>
