<template>
    <div class="filter-bar items-end h-20 border-b-2 border-gray-300 w-full mb-1.5">
      <button @click="handleAddNew" class="rounded bg-green-400 text-sm  text-white px-2 py-1.5"><i class="fa fa-plus" aria-hidden="true"></i> {{ addButtonLabel }}</button>
      <div class="flex flex-wrap gap-x-3 max-w-[800px]">
        <div v-for="(filter, index) in filters" :key="index" class="filter items-end pt-1.5" :class="{'w-full sm:w-1/2 md:w-1/3 lg:w-1/4' : filters.length > 4 && index > 3}">
          <div v-if="filter.type === 'text'" class="mr-2">
            <input v-model="filter.value" type="text" :class="`rounded pl-3 border border-gray-400 text-base w-${filter.width}`" :placeholder="filter.placeholder"/>
          </div>
          <div v-if="filter.type === 'date'" class="mr-2">
            <input v-model="filter.value" type="date" :class="`rounded pl-3 border border-gray-400 text-base w-${filter.width}`" :placeholder="filter.placeholder" :title="filter.title"/>
          </div>
          <div v-else-if="filter.type === 'dropdown'">
            <select v-model="filter.value" :class="`rounded border border-gray-400 bg-white text-sm pl-2 pt-2 w-${filter.width}`">
              <option value="" selected disabled>{{ filter.placeholder }}</option>
              <option v-for="(option, index) in filter.options" :key="index" :value="option.value">{{ option.text }}</option>
            </select>
          </div>
          <div v-else-if="filter.type === 'search-dropdown'">
            <SearchableDropdown          
              :options="filter.selectOptions"
              :updateValue="filter.updateValue"
              :dropdownWidth="filter.dropdownWidth"
              :searchPlaceholder="filter.searchPlaceholder"
              @option-selected="filter.optionSelected"
              @clearSearch="filter.clearSearch"
              @fetchData="filter.fetchData"
            />
          </div>
        </div>
      </div>

      <div>
        <button @click="handleSearch" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-binoculars" aria-hidden="true"></i> Search</button>
        <button @click="handleReset" class="rounded bg-green-400 text-sm  text-white px-2 py-1.5"><i class="fa fa-refresh" aria-hidden="true"></i> Reset</button>
      </div>
      <div>
        <button @click="showDropdown" class="rounded bg-green-400 text-sm  text-white px-2 py-1.5">{{ actionsButtonLabel }} <i class="fa fa-caret-down pl-2" aria-hidden="true"></i></button>
        <button class="fixed inset-0 bg-gray-50 opacity-25 cursor-default w-full" v-if="dropdown" @click="dropdown = !dropdown"></button>
        <div class=" text-left text-sm mt-1.5 absolute rounded bg-white w-36 py-1.5 px-1.5 shadow-md shadow-slate-500" v-if="dropdown">
          <div>
            <button @click="importData">Import</button><br />
            <button @click="removeItem">Remove</button><br />
            <button @click="removeSelectedItems">Remove Multiple</button><br />
            <button @click="printList">Print List</button><br />
          </div>
          <div v-for="(option, index) in dropdownOptions" :key="index">
            <button @click="handleDynamicOption(option.action)">{{ option.label }}</button><br />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import SearchableDropdown from '@/components/SearchableDropdown.vue'
  import { defineComponent,ref } from 'vue';
  export default defineComponent({
    name: 'FilterBar',
    props: {
      filters: {
        type: Array,
        default: () => []
      },
      addButtonLabel: {
        type: String,
        default: 'Add New'
      },
      actionsButtonLabel: {
        type: String,
        default: 'Actions'
      },
      options: {
        type: Array,
        default: () => []
      },
      selectOptions: {
        type: Array,
        default: () => ["Option 1","Option 2"]
      },
      updateValue: {
        type: String,
        default: () => ''
      },
      dropdownWidth: {
        type: String,
        default: () => '300px'
      },
      searchPlaceholder: {
        type: String,
        default: () => 'Select Option...'
      },
      dropdownOptions: {
        type: Array,
        default: () => []
      }
    },
    components:{
      SearchableDropdown
    },
    setup(_,{emit}){
      const dropdown = ref(false);
      const handleAddNew = () =>{
        emit('add-new');
      }
      const handleReset = () =>{
        emit('reset');
      }
      const handleSearch = () =>{
        emit('search');
      }
      const showDropdown = () =>{
        dropdown.value = !dropdown.value;
      }
      const importData = () =>{
        emit('importData');
      }
      const removeItem = () =>{
        emit('removeItem');
      }
      const removeSelectedItems = () =>{
        emit('removeSelectedItems');
      }
      const printList = () =>{
        emit('printList');
      }
      const handleDynamicOption = (option) =>{
        emit('handleDynamicOption');
      }
      const optionSelected = () =>{
        emit('option-selected');
      }
      const clearSearch = () =>{
        emit('clearSearch');
      }

      return{
        dropdown, handleAddNew, handleReset, showDropdown, optionSelected, handleSearch, clearSearch,
        importData, removeItem, removeSelectedItems, printList, handleDynamicOption
      }
    },
  });
  </script>
  
  <style scoped>
  .filter-bar {
    display: flex;
    /* align-items: center; */
    justify-content: space-between;
    padding: 10px;
  }
  
  .filters {
    display: flex;
    gap: 10px;
  }
  
  .filter {
    display: flex;
    align-items: center;
  }
  
  .btn-add-new,
  .btn-search,
  .btn-print {
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
  }
  </style>
  