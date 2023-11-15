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
              <Button
                @click="generateInvoicePDF"
                severity="warning"
                :header="t('invoices.generate')"
              />
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
import axios from 'axios';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
});
const invoice: Ref<InvoiceResponse | undefined> = ref();
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
    amount.value = invoice.value.transfer ? invoice.value.transfer.amount.amount : 0;
    setValues({
      addressee: invoice.value.addressee,
      description: invoice.value.description,
      status: invoice.value.currentState.state
    });
  });
});

const handleEditInvoice = handleSubmit(async (values) => {
  if (!invoice.value) {
    toast.add({
      severity: 'error',
      summary: '404 - NOT FOUND',
      detail: 'Invoice was not found',
      life: 3000
    });
    return;
  }
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
  if (!invoice.value) {
    toast.add({
      severity: 'error',
      summary: '404 - NOT FOUND',
      detail: 'Invoice was not found',
      life: 3000
    });
    return;
  }
  await apiService.invoices
    .deleteInvoice(invoice.value.id)
    .then(() => {
      router.push({ name: 'financial-affairs' });
    })
    .catch((error) => handleError(error, toast));
};
type PriceInclVat = {
  amount: number;
  currency: string;
  precision: number;
};

type Product = {
  description: string;
  amount: number;
  priceInclVat: PriceInclVat;
  vatPercentage: number;
};

type ProductPricing = {
  basePrice: number;
  vatAmount: number;
  vatCategory: 'ZERO' | 'LOW' | 'HIGH' | 'UNKNOWN';
};

type ConvertedProduct = {
  name: string;
  summary: string;
  pricing: ProductPricing;
};

type InvoiceReferences = {
    ourReference: string,
    yourReference: string,
    costCenter: boolean
}

type Identity = {
  firstName: string,
  lastNamePreposition: string,
  lastName: string,
  fullName: string,
  function?: string,
}

type Dates = {
  date: string,
  dueDate?: string,
  dueDays?: number,
  startDate?: string,
  endDate?: string,
}

type Company = {
  name: string,
  id?: string,
}

type Address = {
  street: string,
  postalCode: string,
  city: string,
  country: string,
}

type FileSettings = {
  name: string,
  language: string,
  fileType: string,
  stationery?: string,
  createdAt: string,
}

type TotalPricing = {
  exclVat: number,
  lowVat: number,
  highVat: number,
  inclVat: number,
}

type InvoiceParameters = {
  summarizedProducts?: ConvertedProduct[],
  reference?: InvoiceReferences,
  products: ConvertedProduct[],
  pricing: TotalPricing,
  subject: string,
  recipient: Identity,
  sender: Identity,
  dates: Dates,
  company: Company,
  address: Address,
}

function calculateProductPricing(amount: number, priceInclVat: number, vatPercentage: number): ProductPricing {
  const basePrice = priceInclVat * amount;
  let vatCategory: 'ZERO' | 'LOW' | 'HIGH' | 'UNKNOWN' = 'UNKNOWN';

  switch (vatPercentage) {
    case 0:
      vatCategory = 'ZERO';
      break;
    case 9:
      vatCategory = 'LOW';
      break;
    case 21:
      vatCategory = 'HIGH';
      break;
  }

  return { basePrice, vatAmount: vatPercentage, vatCategory };
}

function convertProducts(products: Product[]): ConvertedProduct[] {
  return products.map(product => {
    const pricing = calculateProductPricing(
      product.amount,
      product.priceInclVat.amount,
      product.vatPercentage
    );

    return {
      name: product.description,
      summary: product.description,
      pricing
    };
  });
}

function calculateTotalPricing(convertedProducts: ConvertedProduct[]): TotalPricing {
  let totalExclVat = 0;
  let totalLowVat = 0;
  let totalHighVat = 0;
  let totalInclVat = 0;

  convertedProducts.forEach((product) => {
    const exclVat = product.pricing.basePrice / (1 + product.pricing.vatAmount / 100);
    const inclVat = product.pricing.basePrice;
    const vatAmount = inclVat - exclVat;

    totalExclVat += exclVat;
    totalInclVat += inclVat;
    switch (product.pricing.vatCategory) {
      case 'LOW':
        totalLowVat += vatAmount;
        break;
      case 'HIGH':
        totalHighVat += vatAmount;
        break;
    }
  });

  return {
    exclVat: totalExclVat,
    lowVat: totalLowVat,
    highVat: totalHighVat,
    inclVat: totalInclVat,
  };
}

// TODO: Extract this into APIHelper
const generateInvoicePDF = () => {
    console.log('generating invoice');
    console.log(invoice.value);

    const products: ConvertedProduct[] = convertProducts(invoice.value.invoiceEntries);
    const reference: InvoiceReferences = {
        ourReference: invoice.value.id.toString(),
        yourReference: "-",
        costCenter: false,
    };
    const subject: string = invoice.value.description;
    const sender: Identity = {
      firstName: 'BAr',
      lastNamePreposition: '',
      lastName: 'Commissie',
      fullName: 'BAr Commissie'
    };

    const recipient: Identity = {
      firstName: invoice.value.to.firstName,
      lastNamePreposition: '',
      lastName: invoice.value.to.lastName,
      fullName: `${invoice.value.to.firstName} ${invoice.value.to.lastName}`
    };

    const company: Company = {
      name: 'GEWIS'
    };

    const dates: Dates = {
      date: '2023-11-15T00:00:00'
    };

    const address: Address = {
      street: 'De Groene Loper 5',
      postalCode: '5612AE',
      city: 'Eindhoven',
      country: 'The Netherlands',
    };

    const settings: FileSettings = {
      name: 'Test Invoice',
      language: 'DUTCH',
      fileType: 'PDF',
      createdAt: '2023-11-15',
    };

    const totalPricing: TotalPricing = calculateTotalPricing(products);

    const invoiceParameters: InvoiceParameters = {
      reference,
      products,
      pricing: totalPricing,
      subject,
      recipient,
      sender,
      dates,
      company,
      address
    };

    axiosInstance.post('/invoice/invoice', { params: invoiceParameters, settings: settings }, {responseType: 'blob'}).then(response => {
      window.open(URL.createObjectURL(response.data));
    })
      .catch(error => {
        console.warn(totalPricing);
        console.error(error);
      });
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
