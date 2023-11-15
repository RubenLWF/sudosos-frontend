<template>
  <Dialog header="Add Product" modal>
    <div class="dialog">
      <form @submit="handleVatGroupCreate">
        <div class="row">
          <p class="prop">{{ $t('c_vatGroupModal.Name') }}</p>
          <InputText v-bind="name" />
          &nbsp;
          <span class="error-text">{{ errors.Name }}</span>
        </div>
        <div class="row">
          <p class="prop">{{ $t('c_vatGroupModal.Percentage') }}</p>
          <InputNumber v-bind="percentage" />
          &nbsp;
          <span class="error-text">{{ errors.Percentage }}</span>
        </div><div class="button-row">
          <Button type="submit" severity="danger" class="save-button">{{ $t('c_vatGroupModal.Save') }}</Button>
        </div>
      </form>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import type {
  VatGroupRequest,
} from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';

const vatGroupSchema = toTypedSchema(
  yup.object({
    Name: yup.string().required(),
    Percentage: yup.number().required()
  })
);

const { defineComponentBinds, handleSubmit, errors } = useForm({
  validationSchema: vatGroupSchema
});

const name = defineComponentBinds('Name');
const percentage = defineComponentBinds('Percentage');

const props = defineProps(['closeCreateModal']);

const handleVatGroupCreate = handleSubmit(async (values) => {
  const createVatGroupRequest: VatGroupRequest = {
    name: values.Name,
    percentage: values.Percentage,
    deleted: false,
    hidden: false
  };
  apiService.vatGroups.createVatGroup(createVatGroupRequest).then(() => {
    props.closeCreateModal();
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
