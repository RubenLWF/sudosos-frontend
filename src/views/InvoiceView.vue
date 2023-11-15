<template>
  <div class="page-container">
    <div class="page-title">{{ `${t('invoices.invoice')} ${invoice.id}` }}</div>
    <div class="content-wrapper">
      <div class="row">
        <CardComponent :header="t('invoices.edit')" style="width: 40%">
          <form @submit="handleEditInvoice">
            <div class="input-field">
              <b class="bolder">{{ t('invoices.by') }}</b>
              <InputText
                class="input"
                type="text"
                disabled
                :value="`${invoice.to.firstName} ${invoice.to.lastName}`"
              />
              <br />
            </div>
            <div class="input-field">
              <b class="bolder">{{ t('invoices.description') }}</b>
              <InputText
                class="input"
                type="text"
                v-bind="description"
                :class="{ 'p-invalid': errors.description }"
              />
              <small v-if="errors.description" class="p-error">
                <i class="pi pi-exclamation-circle" />{{ ' ' + errors.description }}
              </small>
              <br v-else />
            </div>
            <div class="input-field">
              <b class="bolder">{{ t('invoices.addressee') }}</b>
              <InputText
                class="input"
                type="text"
                v-bind="addressee"
                :class="{ 'p-invalid': errors.addressee }"
              />
              <small v-if="errors.addressee" class="p-error">
                <i class="pi pi-exclamation-circle" />{{ ' ' + errors.addressee }}
              </small>
              <br v-else />
            </div>
            <div class="input-field">
              <b class="bolder">{{ t('invoices.status') }}</b>
              <Dropdown
                class="input"
                v-bind="status"
                placeholder="Select Payment State"
                :options="stateOptions"
                optionLabel="label"
                optionValue="value"
                :class="{ 'p-invalid': errors.status }"
              />
              <small v-if="errors.status" class="p-error">
                <i class="pi pi-exclamation-circle" />{{ ' ' + errors.status }}
              </small>
              <br v-else />
            </div>
            <div class="action-buttons">
              <Button type="submit" severity="success">{{ t('invoices.update') }}</Button>
              <Button @click="deleteInvoice" severity="danger">{{ t('invoices.delete') }}</Button>
            </div>
          </form>
        </CardComponent>
        <CardComponent :header="t('invoices.amount')">
          <span class="balance-amount">{{ formattedAmount }}</span>
        </CardComponent>
      </div>
      <TransactionsTableComponent :header="t('invoices.products')" style="width: 100%" />
    </div>
  </div>
</template>

<script setup lang="ts">
import apiService from '@/services/ApiService';
import { computed, onBeforeMount, ref } from 'vue';
import type { Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import CardComponent from '@/components/CardComponent.vue';
import TransactionsTableComponent from '@/components/TransactionsTableComponent.vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { handleError } from '@/utils/errorUtils';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const invoice: Ref<InvoiceResponse> = ref();
// TODO: Figure out how the fuck I type this
const amount = ref();

const formattedAmount = computed(() => {
  const balanceInCents = amount.value;
  if (!balanceInCents) return undefined;
  const balanceInEuros = (balanceInCents / 100).toFixed(2);
  return `€${balanceInEuros}`;
});

const stateOptions: Array<{ label: string; value: string }> = [
  { label: 'CREATED', value: 'CREATED' },
  { label: 'SENT', value: 'SENT' },
  { label: 'PAID', value: 'PAID' },
  { label: 'DELETED', value: 'DELETED' }
];

const { defineComponentBinds, handleSubmit, errors, setValues } = useForm({
  validationSchema: {
    addressee: yup.string().required(),
    status: yup.string().required(),
    description: yup.string().required()
  }
});

const addressee = defineComponentBinds('addressee');
const status = defineComponentBinds('status');
const description = defineComponentBinds('description');

onBeforeMount(async () => {
  await apiService.invoices.getSingleInvoice(Number(route.params.invoiceId)).then((res) => {
    invoice.value = res.data;
    amount.value = invoice.value.transfer.amount.amount;
    setValues({
      addressee: invoice.value.addressee,
      description: invoice.value.description,
      status: invoice.value.currentState.state
    });
  });
});

const handleEditInvoice = handleSubmit(async (values) => {
  await apiService.invoices
    .updateInvoice(invoice.value.id, {
      addressee: values.addressee,
      description: values.description,
      state: values.status
    })
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Invoice has been updated',
        life: 3000
      });
    })
    .catch((error) => handleError(error, toast));
});

const deleteInvoice = async () => {
  await apiService.invoices
    .deleteInvoice(invoice.value.id)
    .then(() => {
      router.push({ name: 'financial-affairs' });
    })
    .catch((error) => handleError(error, toast));
};
</script>

<style scoped>
@import '../styles/BasePage.css';

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
  margin-top: 10px;
}

.content-wrapper {
  flex-direction: column;
}

.input-field {
  flex: 1;
  padding-left: 0.25rem !important;
  font-family: Lato, Arial, sans-serif !important;
  display: flex;
  flex-direction: column;
  color: black;
  font-size: 1rem;

  .input {
    width: 80%;
  }

  .bolder {
    font-weight: bolder;
  }
}

.action-buttons {
  width: 80%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.balance-amount {
  font-size: 50px;
  text-align: center;
  font-family: Raleway, sans-serif !important;
  font-weight: 500;
}
</style>
