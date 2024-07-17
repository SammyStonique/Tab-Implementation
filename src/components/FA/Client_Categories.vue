<template>
    <div class="main-content grid grid-rows-12 bg-gray-100 px-4 py-4 text-sm">
        <div class="subsection row-span-2 rounded-lg bg-white w-full">
            <div class="md:px-4  w-full">
                <!-- <div class="mb-4 flex items-end h-20 border-b-2 border-gray-300 mb-3 pb-3">
                    <div class="basis-1/4 pl-3">
                        <button class="rounded bg-green-400 text-white px-3 py-2" @click="showModal"><i class="fa fa-plus" aria-hidden="true"></i> New Category</button>
                    </div>
                    <div class="basis-3/4">
                        <div class="flex items-end">
                            <div class="basis-1/2 pl-3 items-center">
                                <input type="text" class="rounded pl-3 border-2 border-gray-200 text-lg" name="name" id="" placeholder="Name..." v-model="category_name_search"  @keyup.enter="searchClientCategory">
                            </div>
                        </div>
                    </div>
                    <div class="basis-1/8 pl-3 w-36">
                        <button class="rounded-lg bg-green-400 text-white px-3 py-2" @click="searchClientCategory"><i class="fa fa-binoculars" aria-hidden="true"></i> Search</button>
                    </div>
                    <div class="basis-1/8 pl-3 w-36">
                        <div class="print-dropdown">
                            <button class="rounded-lg bg-green-400 text-white px-3 py-2" @click="showDropdown">Options<i class="fa fa-caret-down pl-2" aria-hidden="true"></i></button>
                            <button class="fixed inset-button inset-0 bg-gray-50 opacity-25 cursor-default w-full" v-if="showOptions" @click="showOptions = !showOptions"></button>
                        </div>
                        <div class="options-container absolute right-25 pt-4 pb-2 rounded border border-gray-200 bg-white shadow-slate-400 shadow-xl" v-if="showOptions">
                            <button @click="printReport" class="pl-3 hover:bg-slate-500 hover:rounded hover:w-full">Print List</button><br />
                            <button @click="exportClientCategoryPDF" class="pl-3 hover:bg-slate-500 hover:rounded hover:w-full">Export PDF</button><br />
                            <button @click="exportClientCategoryExcel" class="pl-3 hover:bg-slate-500 hover:rounded hover:w-full">Export Excel</button>
                            <button @click="exportClientCategoryCSV" class="pl-3 hover:bg-slate-500 hover:rounded hover:w-full">Export CSV</button>
                        </div>
                    </div>
                </div> -->
                <div class="">
                    <FilterBar :addButtonLabel="addButtonLabel" :filters="searchFilters" @search="searchClientCategory"/>
                </div>
                <!-- MODAL component for adding a new category -->
                <Modal v-show="isModalVisible" @close="closeModal" :index="index">
                    <template v-slot:header> Category Details </template>
                    <template v-slot:body>
                    <form action="" @submit.prevent="">
                    <div class="flex mb-6">
                        <div class="basis-1/2">
                            <label for="">Name<em>*</em></label><br />
                            <input type="text" name="" id="" class="rounded border border-gray-600 text-lg pl-2" v-model="category_name">
                        </div>
                        <div class="basis-1/2">

                        </div>
                    </div>
                    <div class="text-center" v-if="isEditing">
                        <button class="rounded border bg-green-400 w-36 py-2 px-4 text-white text-lg" @click="updateCategory(index)">Update</button>
                    </div>
                    <div class="text-center" v-else>
                        <button class="rounded border bg-green-400 w-36 py-2 px-4 text-white text-lg" @click="createCategory">Save</button>
                    </div>

                    </form>
                    </template>
                    <template v-slot:footer> We Value Your Partnership </template>
                </Modal>

                <div class="shadow overflow-hidden rounded border-b border-gray-200 row-span-8">
                    <table class="min-w-full bg-white"> 
                        <thead class="bg-gray-800 text-white">
                            <tr class="rounded bg-slate-800 text-white font-semibold text-sm uppercase">
                                <th>#</th>
                                <th class="text-left py-2 px-4">Name</th>
                                <th class="text-left py-2 px-4"></th>
                                <th class="text-left py-2 px-4"></th>
                                <th class="text-left py-2 px-4"></th>
                                <th class="text-left py-2 px-4"></th>
                                <th class="text-left py-2 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        
                        <tr v-for="(cat,index) in categoryList" :key="cat.category_id" class="even:bg-gray-100">
                            <td>{{ index + 1 }}.</td>
                            <td class="text-left py-2 px-4">{{ cat.category_name }}</td>
                            <th class="text-left py-2 px-4"></th>
                            <th class="text-left py-2 px-4"></th>
                            <th class="text-left py-2 px-4"></th>
                            <th class="text-left py-2 px-4"></th>
                            <td class="text-right right-0">
                                <div class="flex">
                                    <div class="basis-1/6">
                                        <button @click="editCategory(index)"><i class="fa fa-pencil" aria-hidden="true" title="Edit"></i></button>
                                    </div>
                                    <div class="basis-1/6">
                                        <button @click="removeCategory(index)"><i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i></button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>   
                </div>
                <div class="pagination row-span-2">
                    <MyPagination 
                    :count="catCount"
                    :currentPage="currentPage"
                    :result="catArrLen"
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
import axios from 'axios';
import { ref, computed, onMounted} from 'vue';
import { useStore } from 'vuex';
import FilterBar from '@/components/FilterBar.vue';

export default{
    name: 'ClientCategoryView',
    props:['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        FilterBar
    },
    setup(){
        const store = useStore();
        const addButtonLabel = ref('New Category');
        const category_name_search = computed({
            get: () => store.state.Client_Categories.category_name_search,
            set: (value) => store.commit('Client_Categories/SET_SEARCH_FILTERS', {"category_name_search":value}),
        });
        const searchFilters = ref([
            { type:'text', placeholder:"Search Category...", value: category_name_search, width:48,},
            { type:'text', placeholder:"Search Name...", width:48,},
            
        ])
        const companyID = ref('9e14bcef-d3c1-400c-a8c0-66d7b25cc5ff');
        const currentPage = ref(1);
        const categoryList = computed({
            get: () => store.state.Client_Categories.categoryList,
            set: (value) => store.commit('Client_Categories/LIST_CLIENT_CATEGORIES', value),
        });
        const searchClientCategory = () =>{
            let formData = {
                category_name: category_name_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/client-category-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                categoryList.value = response.data.results;
                store.commit('Client_Categories/LIST_CLIENT_CATEGORIES', categoryList.value)
            })
        }
        onMounted(()=>{
            searchClientCategory();
        })
        return{
            searchClientCategory,
            categoryList, addButtonLabel, searchFilters,category_name_search
        }
    }

}
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.main-content{
    z-index: -1;
    margin-left: 1px;
    margin-top: 90px;
    min-height: 100vh;
}
.subsection{
    min-height: 100vh;
}
.pagination{
    bottom: 20px;
}
em{
  color: red;
}
.options-container {
  width: 150px;

}
.dropdown-button{
    z-index: 1;
}
.inset-button{
    min-height: 100vh;
}

</style>