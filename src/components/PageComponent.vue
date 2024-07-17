<template>
    <div class="main-content z-10 bg-gray-100 px-4 py-4 text-sm">
        <div class="subsection fixed w-[97%] rounded bg-white">
            <div class="md:px-8 w-full">
                <div class="fixed bg-white w-[93%] z-50">
                    <FilterBar 
                        :addButtonLabel="addButtonLabel" 
                        :filters="searchFilters" 
                        @search="searchPage"
                        @reset="resetFilters"
                        :options="options"
                        :dropdownWidth="dropdownWidth"
                        :selectOptions="selectOptions"
                        :updateValue="updateValue"
                        :searchPlaceholder="searchPlaceholder"
                        />
                </div>
                <div class="fixed table w-[93%] top-60 z-20">
                    <DynamicTable :columns="columns" :rows="rows"/>
                </div>
                <div class="fixed w-[93%] z-30 bottom-6 pb-2 bg-white">
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
            </div>
        </div>
    </div>

</template>

<script>
import { defineComponent, ref } from 'vue';
import FilterBar from '@/components/FilterBar.vue'
import DynamicTable from '@/components/DynamicTable.vue'
import MyPagination from '@/components/MyPagination.vue'

export default defineComponent({
    props:{
        addButtonLabel:{
            type: String,
            required: true
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

    },
    components:{
        FilterBar, DynamicTable, MyPagination
    },
    setup(props, { emit }){
        const searchPage = () =>{
            emit('searchPage')
        }
        const resetFilters = () =>{
            emit('resetFilters')
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
        return{
            searchPage, resetFilters, loadPrev, loadNext, firstPage, lastPage
        }
    }
})
</script>

<style>
.main-content{
    z-index: -1;
    margin-left: 1px;
    margin-top: 90px;
    min-height: 100vh;
}
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