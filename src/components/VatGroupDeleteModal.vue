<template>
  <Dialog v-model:visible="visible" header="Remove Product" modal>
    <div class="dialog">
      <form @submit="handleVatGroupDelete">
        <div class="row">
          Are you sure you wish to delete?
        </div>
        <div class="button-row">
          <Button type="submit" severity="danger" class="save-button">{{ $t('c_vatGroupModal.Confirm') }}</Button>
        </div>
      </form>
    </div>
  </Dialog>
</template>
<script setup lang="ts">

import { ref } from 'vue';

const handleVatGroupDelete = async () => {

}

const visible = ref(false);

</script>
<style scoped>
form {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  flex-direction: row;
  margin: 0.5rem 0;
  align-items: center;
}

.prop {
  width: 20%;
  font-weight: 700 !important;
  font-family: Lato, Arial, sans-serif !important;
  font-size: 1rem !important;
}

.dialog {
  width: 35vw;
}

.save-button {
  width: fit-content;
}
.button-row {
  display: flex;
  flex-direction: row-reverse;
}
</style>