<template>
  <Dialog :header="$t('c_vatGroupModal.Remove VAT group')" modal>
    <div class="dialog">
      <form @submit="handleVatGroupDelete">
        <div class="row">
          {{ $t('c_vatGroupModal.Deletion confirmation', { vatname: props.vatGroup && props.vatGroup.name }) }}
        </div>
        <div class="button-row">
          <Button type="submit" severity="danger" class="save-button">{{ $t('c_vatGroupModal.Confirm') }}</Button>
        </div>
      </form>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import apiService from '@/services/ApiService';
import type {
  UpdateVatGroupRequest,
  VatGroup
} from '@sudosos/sudosos-client';
import { useForm } from 'vee-validate';


const props = defineProps<{
  closeDeleteModal: Function,
  vatGroup: VatGroup | undefined
}>();

const { handleSubmit } = useForm();

const handleVatGroupDelete = handleSubmit(async () => {
  if(props.vatGroup == undefined) return;
  const updateVatGroupRequest: UpdateVatGroupRequest = {
    name: props.vatGroup.name!,
    deleted: true,
    hidden: false
  };
  apiService.vatGroups.updateVatGroup(props.vatGroup.id, updateVatGroupRequest).then(() => {
    props.closeDeleteModal();
  });

});

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
