<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ $t('invoice.create') }}</div>
    <div class="content-wrapper gap-5 flex md:flex-row flex-row">
      <div class="flex flex-column">
        <h2>{{ $t('invoice.data') }}</h2>
        <form @submit.prevent="handleSubmit" class="p-fluid">
          <!-- Addressee -->
          <div class="field p-field p-grid">
            <label for="addressee" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.addressee') }}</label>
            <div class="p-col-12 p-md-10">
              <InputText id="addressee" v-model="addressee" v-bind="addresseeAttrs" type="text" class="p-inputtext-sm w-full" />
            </div>
          </div>
          <!-- Description -->
          <div class="field p-field p-grid">
            <label for="description" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.description') }}</label>
            <div class="p-col-12 p-md-10">
              <InputText id="description" v-model="invoiceDescription" v-bind="invoiceDescriptionAttrs" type="text" class="p-inputtext-sm w-full" />
            </div>
          </div>
          <!-- Reference -->
          <div class="field p-field p-grid">
            <label for="reference" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.reference') }}</label>
            <div class="p-col-12 p-md-10">
              <InputText id="reference" v-model="reference" v-bind="referenceAttrs"type="text" class="p-inputtext-sm w-full" />
            </div>
          </div>
          <!-- Street -->
          <div class="field p-field p-grid">
            <label for="street" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.street') }}</label>
            <div class="p-col-12 p-md-10">
              <InputText id="street" v-model="street" v-bind="streetAttrs" type="text" class="p-inputtext-sm w-full" />
            </div>
          </div>
          <!-- Postal Code -->
          <div class="field p-field p-grid">
            <label for="postalCode" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.postalCode') }}</label>
            <div class="p-col-12 p-md-10">
              <InputText id="postalCode" v-model="postalCode" v-bind="postalCodeAttrs" type="text" class="p-inputtext-sm w-full" />
            </div>
          </div>
          <!-- City -->
          <div class="field p-field p-grid">
            <label for="city" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.city') }}</label>
            <div class="p-col-12 p-md-10">
              <InputText id="city" v-model="city" v-bind="cityAttrs" type="text" class="p-inputtext-sm w-full" />
            </div>
          </div>
          <!-- Country -->
          <div class="field p-field p-grid">
            <label for="country" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.country') }}</label>
            <div class="p-col-12 p-md-10">
              <InputText id="country" v-model="country" v-bind="countryAttrs" type="text" class="p-inputtext-sm w-full" />
            </div>
          </div>
          <!-- Is Credit Invoice -->
          <div class="field p-field p-grid">
            <label for="isCreditInvoice" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.isCreditInvoice') }}</label>
            <div class="p-col-12 p-md-10">
              <InputSwitch id="isCreditInvoice" v-model="isCreditInvoice" />
            </div>
          </div>
          <!-- Submit Button -->
          <div class="p-grid p-justify-end p-mt-3">
            <Button @click="handleSubmitInvoice" :label="$t('invoice.add')" type="submit" class="p-button-success" />
          </div>
        </form>
      </div>
      <Divider layout="vertical" />
      <CardComponent :header="$t('invoice.preview')">
        <template #topAction>
          <Button :label="$t('invoice.addEntry')" @click="visible = true"/>
        </template>
        <!-- Only render DataTable if invoicePreview is defined -->
        <DataTable v-if="invoicePreview" :value="invoicePreview.products">
          <Column field="count" header="#"></Column>
          <Column field="product" :header="$t('invoice.product')">
            <template #body="slotProps">
              {{ slotProps.data.product.name }}
            </template>
          </Column>
          <Column field="product" :header="$t('invoice.amount')">
            <template #body="slotProps">
              {{ formatPrice(slotProps.data.product.priceInclVat) }}
            </template>
          </Column>
          <Column field="product" :header="$t('invoice.totalAmount')">
            <template #body="slotProps">
              {{ formatPrice(slotProps.data.totalInclVat) }}
            </template>
          </Column>
        </DataTable>
        <DataTable v-if="invoicePreview" :value="invoicePreview.customEntries">
          <Column field="amount" ></Column>
          <Column field="description" >
            <template #body="slotProps">
              {{ slotProps.data.description }}
            </template>
          </Column>
          <Column field="priceInclVat">
            <template #body="slotProps">
              {{ formatPrice(slotProps.data.priceInclVat) }}
            </template>
          </Column>
          <Column field="priceInclVat">
            <template #body="slotProps">
              {{ formatPrice({
              amount: slotProps.data.priceInclVat.amount * slotProps.data.amount,
              currency: 'EUR',
              precision: 2
 }) }}
            </template>
          </Column>
          <template #footer>
            <div class="flex flex-column">
              <div class="flex flex-row justify-content-between">
                <span>{{ $t('invoice.totalExclVat') }}</span>
                <span>{{ formatPrice(invoicePreview.exclVat) }}</span>
              </div>
              <div v-for="cat in invoicePreview.vatCategories" class="flex flex-row justify-content-between">
                <span>{{ `${ $t("invoice.total")} ${cat.percentage}% ${ $t("invoice.vat")}`  }}</span>
                <span>{{ formatPrice(cat.amount) }}</span>
              </div>
              <div class="flex flex-row justify-content-between">
                <span>{{ $t('invoice.totalInclVat') }}</span>
                <span>{{ formatPrice(invoicePreview.inclVat) }}</span>
              </div>
            </div>
          </template>
        </DataTable>
      </CardComponent>
    </div>
  </div>
  <Dialog v-model:visible="visible" :header="$t('invoice.addEntry')" modal class="w-auto">
    <form @submit.prevent="handleAddEntry" class="p-fluid">
      <div class="field p-field p-grid">
        <label for="description" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.description') }}</label>
        <div class="p-col-12 p-md-10">
          <InputText
            id="description"
            v-model="description"
            type="text"
            v-bind="descriptionAttrs"
            class="p-inputtext-sm w-full"
          />
          <small class="p-error">{{ errors.description }}</small>
        </div>
      </div>
      <div class="field p-field p-grid">
        <label for="amount" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.amount') }}</label>
        <div class="p-col-12 p-md-10">
          <InputText id="amount" v-model="amount" type="text" v-bind="amountAttrs" class="p-inputtext-sm w-full" />
          <small class="p-error">{{ errors.amount }}</small>
        </div>
      </div>
      <div class="field p-field p-grid">
        <label for="priceInclVat" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.priceInclVat') }}</label>
        <div class="p-col-12 p-md-10">
          <InputText id="priceInclVat" v-model="priceInclVat" type="text" v-bind="priceInclVatAttrs" class="p-inputtext-sm w-full" />
          <small class="p-error">{{ errors.priceInclVat }}</small>
        </div>
      </div>
      <div class="field p-field p-grid">
        <label for="vat" class="p-col-12 p-md-2 p-text-bold">{{ $t('invoice.vatPercentage') }}</label>
        <div class="p-col-12 p-md-10">
          <Dropdown
            id="vat"
            :placeholder="$t('c_productEditModal.Please select VAT')"
            :options="vatGroups"
            optionLabel="label"
            optionValue="value"
            v-model="vatPercentage"
            v-bind="vatPercentageAttrs"
            class="w-full"
          />
          <small class="p-error">{{ errors.vatPercentage }}</small>
        </div>
      </div>
      <div class="p-grid p-justify-end p-mt-3">
        <Button :label="$t('invoice.addEntry')" type="submit" class="p-button-success" />
      </div>
    </form>
  </Dialog>

</template>

<script setup lang="ts">
import InputSwitch from "primevue/inputswitch";
import Divider from "primevue/divider";
import { onMounted, type Ref, ref } from "vue";
import { useRoute } from "vue-router";
import apiService from "@/services/ApiService";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import type {
  CreateInvoiceRequest,
  DineroObjectResponse, InvoiceEntryRequest,
  TransactionReportEntryResponse,
  TransactionReportVatEntryResponse, VatGroupResponse
} from "@sudosos/sudosos-client";
import CardComponent from "@/components/CardComponent.vue";
import { formatPrice } from "@/utils/formatterUtils";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from 'yup';
import { useForm } from "vee-validate";
import Dropdown from "primevue/dropdown";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { handleError } from "@/utils/errorUtils";

const toast = useToast();
const { t } = useI18n();
const invoiceUser: Ref<number> = ref(-1);
const invoicePreview: Ref<InvoicePreview | undefined> = ref();
const route = useRoute();
const visible: Ref<boolean> = ref(false);
const customEntries: Ref<Array<InvoiceEntryRequest>> = ref([]);
const entrySchema = toTypedSchema(
  yup.object({
    description: yup.string().required(),
    amount: yup.number().required(),
    priceInclVat: yup.number().required(),
    vatPercentage: yup.number().required(),
  })
);
const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: entrySchema,
});
const isCreditInvoice: Ref<boolean> = ref(false);
const {
  handleSubmit: handleSubmitInvoiceDetails,
  values: invoiceDetails,
  errors: invoiceDetailsErrors,
  resetForm: resetInvoiceDetailsForm,
  defineField: defineInvoiceField,
} = useForm({
  validationSchema: yup.object({
    addressee: yup.string().required(),
    invoiceDescription: yup.string().required(),
    reference: yup.string().required(),
    street: yup.string().required(),
    postalCode: yup.string().required(),
    city: yup.string().required(),
    country: yup.string().required(),
  })
});

const [description, descriptionAttrs] = defineField('description');
const [amount, amountAttrs] = defineField('amount');
const [priceInclVat, priceInclVatAttrs] = defineField('priceInclVat');
const [vatPercentage, vatPercentageAttrs] = defineField('vatPercentage');
const [addressee, addresseeAttrs] = defineInvoiceField('addressee');
const [invoiceDescription, invoiceDescriptionAttrs] = defineInvoiceField('invoiceDescription');
const [reference, referenceAttrs] = defineInvoiceField('reference');
const [street, streetAttrs] = defineInvoiceField('street');
const [postalCode, postalCodeAttrs] = defineInvoiceField('postalCode');
const [city, cityAttrs] = defineInvoiceField('city');
const [country, countryAttrs] = defineInvoiceField('country');
const lastInvoiceDate: Ref<string> = ref("");
const vatGroups: Ref<VatGroupResponse[]> = ref([]);
interface InvoicePreview {
  products: Array<TransactionReportEntryResponse>,
  exclVat: DineroObjectResponse,
  inclVat: DineroObjectResponse,
  vatCategories: Array<{
    percentage: number,
    amount: DineroObjectResponse,
  }>,
  customEntries: Array<InvoiceEntryRequest>,
}

onMounted(async () => {
  const vatGroupsResp = await apiService.vatGroups.getAllVatGroups();
  vatGroups.value = vatGroupsResp.data.records;
  invoiceUser.value = Number(route.params.forId);
  lastInvoiceDate.value = await apiService.invoices.getAllInvoices(invoiceUser.value)
    .then((res) => res.data.records[0].createdAt) || "";
  const transactionReport = await apiService.user.getUsersTransactionsReport(
    invoiceUser.value,
    lastInvoiceDate.value,
    undefined,
    undefined,
    18214,
    true,
  ).then((res) => res.data );
  // @ts-ignore
  console.log(transactionReport.data.vat);
  invoicePreview.value = {
    // @ts-ignore
    products: transactionReport.data.entries,
    // @ts-ignore
    vatCategories: transactionReport.data.vat.map((v: TransactionReportVatEntryResponse) => {
      return {
        percentage: v.vat.percentage,
        amount: { amount: v.totalInclVat.amount - v.totalExclVat.amount, currency: 'EUR', precision: 2 }
      };
    }),
    // @ts-ignore
    exclVat: transactionReport.totalExclVat,
    // @ts-ignore
    inclVat: transactionReport.totalInclVat,
    customEntries: [],
  };
});

const handleAddEntry = handleSubmit( async (values) => {
  const priceInclVAT = {
      amount: values.priceInclVat * 100,
      currency: 'EUR',
      precision: 2
  };
  const customEntry: InvoiceEntryRequest = {
    description: values.description,
    amount: values.amount,
    priceInclVat: priceInclVAT,
    vatPercentage: values.vatPercentage,
  };
  invoicePreview.value?.customEntries.push(customEntry);
  console.log(customEntries.value);
  resetForm();
  visible.value = false;
  invoicePreview.value.exclVat.amount += customEntry.priceInclVat.amount / (1 + customEntry.vatPercentage / 100) * customEntry.amount;
  invoicePreview.value.inclVat.amount += customEntry.priceInclVat.amount * customEntry.amount;
});

const handleSubmitInvoice = handleSubmitInvoiceDetails(async (invoiceDetails) => {
  console.log(invoiceDetails);
  const createInvoicerequest: CreateInvoiceRequest = {
    forId: Number(route.params.forId),
    addressee: invoiceDetails.addressee,
    description: invoiceDetails.invoiceDescription,
    reference: invoiceDetails.reference,
    customEntries: customEntries.value,
    fromDate: lastInvoiceDate.value,
    street: invoiceDetails.street,
    postalCode: invoiceDetails.postalCode,
    city: invoiceDetails.city,
    country: invoiceDetails.country,
    isCreditInvoice: isCreditInvoice.value,
  };

  await apiService.invoices.createInvoice(createInvoicerequest).then(() => {
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('invoice.added'),
      life: 3000
    });
  }).catch((err) => handleError(err, toast));
});
</script>

<style scoped></style>
