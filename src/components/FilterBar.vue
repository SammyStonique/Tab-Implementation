<template>
  <div class="filter-bar items-end h-16 border-b-2 border-gray-300 w-full mb-1">
    <button @click="handleAddNew" v-if="showAddButton" class="rounded bg-green-400 text-xs  text-white px-2 py-1.5" :class="{ 'disabled': isDisabled(`${addingRight}`) }"><i class="fa fa-plus" aria-hidden="true"></i> {{ addButtonLabel }}</button>
    <div class="flex text-base flex-wrap gap-x-3 max-w-[1000px]">
      <div v-for="(filter, index) in filters" :key="index" class="filter items-end pt-0.5">
        <div v-if="filter.type === 'text'" class="mr-2 text-sm">
          <input v-model="filter.value" type="text" :class="`bg-slate-100 rounded pl-3 pt-0.4 border border-gray-400 w-${filter.width}`" :placeholder="filter.placeholder"/>
        </div>
        <div v-if="filter.type === 'date'" class="mr-2 text-sm">
          <input v-model="filter.value" type="date" :class="`bg-slate-100 rounded pl-3 pt-0.4 border border-gray-400 text-sm w-${filter.width}`" :placeholder="filter.placeholder" :title="filter.title"/>
        </div>
        <div v-else-if="filter.type === 'dropdown'" class="text-sm">
          <select v-model="filter.value" :class="`rounded border border-gray-400 bg-slate-100 text-sm pl-2 pt-0.5 w-${filter.width}`">
            <option value="" selected disabled>{{ filter.placeholder }}</option>
            <option v-for="(option, index) in filter.options" :key="index" :value="option.value">{{ option.text }}</option>
          </select>
        </div>
        <div v-else-if="filter.type === 'search-dropdown'" class="text-sm">
          <SearchableDropdown  
            :key="filter.componentKey"         
            :options="filter.selectOptions"
            :updateValue="filter.updateValue"
            :dropdownWidth="filter.dropdownWidth"
            :dropdownHeight="dropdownHeight"
            :searchPlaceholder="filter.searchPlaceholder"
            @option-selected="filter.optionSelected"
            @clearSearch="filter.clearSearch"
            @fetchData="filter.fetchData"
          />
        </div>
      </div>
    </div>

    <div>
      <button @click="handleSearch" class="rounded bg-green-400 text-xs mr-2  text-white px-2 py-1.5"><i class="fa fa-binoculars" aria-hidden="true"></i> Search</button>
      <button @click="handleReset" class="rounded bg-green-400 text-xs  text-white px-2 py-1.5"><i class="fa fa-refresh" aria-hidden="true"></i> Reset</button>
    </div>
    <div>
      <button @click="showDropdown" class="rounded bg-green-400 text-xs  text-white px-2 py-1.5">{{ actionsButtonLabel }} <i class="fa fa-caret-down pl-2" aria-hidden="true"></i></button>
      <button class="fixed inset-0 bg-gray-50 opacity-15 cursor-default w-full" v-if="dropdown" @click="dropdown = !dropdown"></button>
      <div class="text-left text-sm mt-1.5 absolute right-1 rounded bg-white w-56 py-1.5 px-1.5 shadow-md shadow-slate-500" v-if="dropdown">
        <div class="actionsDropdown ">
          <button @click="importData" class="hover:bg-slate-500 hover:w-full"><i class="fa fa-file-import text-blue-500 mr-2 text-xs" aria-hidden="true"></i> Import</button><br />
          <button @click="removeItem" class="hover:bg-slate-500 hover:w-full" :class="{ 'disabled': isDisabled(`${removingRight}`) }"><i class="fa fa-times-circle text-red-500 mr-2 text-xs" aria-hidden="true"></i> Remove</button><br />
          <button @click="removeSelectedItems" class="hover:bg-slate-500 hover:w-full" :class="{ 'disabled': isDisabled(`${removingRight}`) }"><i class="fa fa-times-circle text-red-500 mr-2 text-xs" aria-hidden="true"></i> Remove Multiple</button><br />
          <button @click="displaySideDropdown"><i class="fa fa-caret-left pl-2" aria-hidden="true"></i> Print List</button><br />
        </div>
        <div v-for="(option, index) in dropdownOptions" :key="index">
          <button :class="{ 'disabled': isDisabled(`${option.rightName}`) }" @click="handleDynamicOption(option.action)" class="hover:bg-slate-500 hover:w-full"><i :class="['fa', option.icon, option.colorClass,'mr-2']" style="font-size: 12px;" aria-hidden="true"></i> {{ option.label }}</button><br />
        </div>
      </div>
      <div class="relative">        
        <div class="absolute left-[-296px] top-20 w-36 bg-white rounded shadow-md py-1.5 px-2 text-sm text-left" v-if="hoverDropdown" @mouseover="hoverDropdown = true" @mouseleave="hoverDropdown = false">
          <button @click="printList" class="hover:bg-slate-500 hover:w-full">Print List PDF</button><br />
          <button @click="printExcel" class="hover:bg-slate-500 hover:w-full">Download Excel</button><br />
          <button @click="printCSV" class="hover:bg-slate-500 hover:w-full">Download CSV</button><br />
        </div>
      </div>
    </div>
  </div>
  <MovableModal v-model:visible="printModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
      :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
  />
</template>

<script>
import SearchableDropdown from '@/components/SearchableDropdown.vue'
import MovableModal from './MovableModal.vue';
import { ref, computed, defineComponent, onMounted, onBeforeMount} from 'vue';
import axios from "axios";
import { useStore } from "vuex";

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
    showAddButton: {
      type: Boolean,
      default: true,
      required: false
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
    },
    printModalVisible:{
      type: Boolean,
      default: () => false
    },
    title:{
      type: String,
      default: () => ''
    },
    modal_left:{
      type: String,
      default: () => ''
    },
    modal_top:{
      type: String,
      default: () => ''
    },
    modal_width:{
      type: String,
      default: () => ''
    },
    modal_loader:{
      type: String,
      default: () => ''
    },
    rightsModule:{
      type: String,
      default: () => ''
    },
    addingRight:{
      type: String,
      default: () => ''
    },
    removingRight:{
      type: String,
      default: () => ''
    }
  },
  components:{
    SearchableDropdown, MovableModal
  },
  setup(props,{emit}){
    const store = useStore(); 
    const dropdown = ref(false);
    const hoverDropdown =  ref(false);
    const allowedRights = computed(()=> store.state.userData.permissions);
    const dropdownHeight = ref('22px');
    const companyID = computed(()=> store.state.userData.company_id);
    const userID = computed(()=> store.state.userData.user_id);
    const handleAddNew = () =>{
      if(!isDisabled(props.addingRight) ){
        emit('add-new');
      }
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
      if(!isDisabled(props.removingRight) ){
        emit('removeItem');
      }
    };
    const removeSelectedItems = () =>{
      if(!isDisabled(props.removingRight) ){
        emit('removeSelectedItems');
      }
    };
    const displaySideDropdown = () =>{
      hoverDropdown.value = !hoverDropdown.value;
    }
    const printList = () =>{
      emit('printList');
    };
    const printExcel = () =>{
      emit('printExcel');
    };
    const printCSV = () =>{
      emit('printCSV');
    };
    const handleDynamicOption = (option) =>{
      emit('handleDynamicOption', option);
    };
    const optionSelected = () =>{
      emit('option-selected');
    };
    const clearSearch = () =>{
      emit('clearSearch');
    };
    const showModalLoader = () =>{
      emit('showModalLoader')
    };
    const hideModalLoader = () =>{
      emit('hideModalLoader')
    };

    const isDisabled =(permissionName) =>{
        const permission = allowedRights.value.find(p => p.rightName === permissionName);
        return permission ? !permission.right_status : true;
    };
    onBeforeMount(() =>{
      
    })

    return{
      dropdown, dropdownHeight, handleAddNew, handleReset, showDropdown, optionSelected, handleSearch, clearSearch,
      importData, removeItem, removeSelectedItems, printList, handleDynamicOption, showModalLoader,
      hideModalLoader,isDisabled,hoverDropdown,printExcel,printCSV,displaySideDropdown
    }
  },
});
</script>

<style scoped>
.actionsDropdown{
  z-index: 10000 !important;
}
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.filter-bar {
  display: flex;
  /* align-items: center; */
  justify-content: space-between;
  padding: 4px;
  z-index: 1000;
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
