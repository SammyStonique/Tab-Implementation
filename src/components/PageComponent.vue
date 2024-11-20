<template>
    <PageStyleComponent :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="fixed bg-white w-[93%] z-60" v-if="pageTitle != ''">
                <p class="font-bold text-lg text-black">{{ pageTitle }}</p>
            </div>
            <div class="fixed bg-white w-[93%] z-50">
                <FilterBar 
                    :addButtonLabel="addButtonLabel" 
                    :showAddButton="showAddButton"
                    :filters="searchFilters" 
                    @add-new="handleAddNew"
                    @search="searchPage"
                    @reset="resetFilters"
                    @importData="importData"
                    @removeItem="removeItem"
                    @removeSelectedItems="removeSelectedItems"
                    @printList="printList"
                    :dropdownOptions="dropdownOptions"
                    @handleDynamicOption="handleDynamicOption"
                    :options="options"
                    :addingRight="addingRight"
                    :rightsModule="rightsModule"
                    :dropdownWidth="dropdownWidth"
                    :selectOptions="selectOptions"
                    :updateValue="updateValue"
                    :searchPlaceholder="searchPlaceholder"
                    />
            </div>
            <div class="fixed table w-[93%] top-[13.1rem] z-20">
                <DynamicTable 
                    :columns="columns" 
                    :rows="rows"
                    :idField="idField"
                    :actions="actions"
                    :showTotals="showTotals"
                    :showActions="showActions"
                    @action-click="handleActionClick"
                    @selection-changed="handleSelectionChange"
                    :rightsModule="rightsModule"
                />
            </div>
            <div class="fixed w-[93%] z-30 bottom-5 pb-2 bg-white">
                <MyPagination 
                :count="count"
                :currentPage="currentPage"
                :result="result"
                @loadPrev="loadPrev"
                @loadNext="loadNext"
                @firstPage="firstPage"
                @lastPage="lastPage"
                :showNextBtn="showNextBtn"
                :showPreviousBtn="showPreviousBtn"
            
            />
            </div>
        </template>
    </PageStyleComponent>

</template>

<script>
import { defineComponent} from 'vue';
import FilterBar from '@/components/FilterBar.vue'
import Loader from '@/components/Loader.vue'
import DynamicTable from '@/components/DynamicTable.vue'
import MyPagination from '@/components/MyPagination.vue'
import PageStyleComponent from './PageStyleComponent.vue';

export default defineComponent({
    props:{
        pageTitle:{
            type: String,
            required: false,
            default: () => ''
        },
        addButtonLabel:{
            type: String,
            required: true
        },
        showAddButton: {
            type: Boolean,
            default: true,
            required: false
        },
        dropdownOptions: {
            type: Array,
            default: () => []
        },
        searchFilters:{
            type: Array,
            default: () => []   
        },
        columns:{
            type: Array,
            default: () => []   
        },
        rows:{
            type: Array,
            default: () => []   
        },
        showTotals:{
            type: Boolean,
            default: () => false,
            required: false
        },
        showActions:{
            type: Boolean,
            default: () => true,
            required: false
        },
        actions:{
            type: Array,
            default: () => []   
        },
        idField: {
            type: String,
            default: () => ''
        },
        count:{
            type: Number,
            default: () => 1   
        },
        currentPage:{
            type: Number,
            default: () => 1   
        },
        result:{
            type: Array,
            default: () => [] 
        },
        showNextBtn:{
            type: Boolean,
            default: () => false  
        },
        showPreviousBtn:{
            type: Boolean,
            default: () => false    
        },
        options: {
            type: Array,
            default: () => []
        },
        selectOptions: {
            type: Array,
            default: () => []
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
        loader:{
            type: String,
            default: 'none'
        },
        rightsModule:{
            type: String,
            default: () => ''
        },
        addingRight:{
            type: String,
            default: () => ''
        },

    },
    components:{
        FilterBar, DynamicTable, MyPagination, Loader, PageStyleComponent
    },
    setup(props, { emit }){
        const searchPage = () =>{
            emit('searchPage')
        }
        const resetFilters = () =>{
            emit('resetFilters')
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
        const handleDynamicOption = (option) =>{
            emit('handleDynamicOption', option);
        }
        const printList = () =>{
            emit('printList');
        }
        const loadPrev = () =>{
            emit('loadPrev')
        }
        const loadNext = () =>{
            emit('loadNext')
        }
        const firstPage = () =>{
            emit('firstPage')
        }
        const lastPage = () =>{
            emit('lastPage')
        }
        const handleActionClick = (rowIndex, action, row) =>{
            emit('handleActionClick',rowIndex, action, row)
        }
        const handleAddNew = () =>{
            emit('handleAddNew');
        }
        const showLoader = () =>{
            emit('showLoader');
        }
        const hideLoader = () =>{
            emit('hideLoader');
        }
        const handleSelectionChange = (selectedIds) =>{
            emit('handleSelectionChange', selectedIds);
        }
        return{
            searchPage, resetFilters, loadPrev, loadNext, firstPage, lastPage, handleActionClick, handleAddNew,
            showLoader, hideLoader, importData, removeItem, removeSelectedItems, printList, handleDynamicOption,
            handleSelectionChange
        }
    }
})
</script>

<style>
.subsection{
    min-height: 100vh;
}
.table{
    min-height: 20vh;
    max-height: 20vh;
    overflow-y: scroll;
    overflow-x: scroll;
}
</style>