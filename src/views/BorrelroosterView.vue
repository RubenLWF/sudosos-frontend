<template>
  <div class="page-container">
    <div class="page-title">Borrelrooster</div>
    <div class="content-wrapper">
      <div class="current-events">
        <h2>Current events</h2>
        <DataTable>
          <Column field="users" header="Users" />
          <Column
              v-for="(shift, index) in shifts"
              :key="index"
              :field="shift"
              :header="shift"
          />
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import {onMounted, ref} from "vue";
import {UserRole} from "@/utils/rbacUtils";

const shifts = ref();
const event = ref();

onMounted(() => {
  shifts.value = [
      "Inkoop",
      "Voorbereiden",
      "Borrelen 1",
      "Borrelen 2",
      "Portieren 1",
      "Portieren 2",
      "Navullen",
      "Wassen",
      "Klok",
    ];
  event.value = {
    shifts: shifts,
    roles: [UserRole.BAC],
    users: ["Roy", "Celine", "Ollie", "Lucy", "Ali", "Job", "René", "Sven", "Randy", "Noël", "Samuel", "Feut 1", "Feut 2", "Feut 3"]
  };

});

</script>

<style scoped lang="scss">
@import "../styles/BasePage.css";

</style>
