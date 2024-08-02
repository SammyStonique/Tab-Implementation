<template>
    <PageComponent 
        :addButtonLabel="addButtonLabel"
        :searchFilters="searchFilters"
        @searchPage="searchDepartments"
        @resetFilters="resetFilters"
        :columns="tableColumns"
        :rows="depList"
        :actions="actions"
        :idField="idField"
        :count="depCount"
        :currentPage="currentPage"
        :result="depArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
    />
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted } from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";

export default{
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();
        const addButtonLabel = ref('New Department');
        const depList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const tableColumns = ref([
            {label: "Code", key:"code"},
            {label: "Name", key: "name"}
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Department'}
        ])
        const companyID = ref('9e14bcef-d3c1-400c-a8c0-66d7b25cc5ff');
        const code_search = computed({
            get: () => store.state.Departments.code_search,
            set: (value) => store.commit('Departments/SET_SEARCH_FILTERS', {"code_search":value}),
        });
        const name_search = computed({
            get: () => store.state.Departments.name_search,
            set: (value) => store.commit('Departments/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Search Code...", value: code_search},
            {type:'text', placeholder:"Search Name...", value: name_search}
        ])
        const searchDepartments = () =>{
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                code: code_search.value,
                name: name_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/department-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                depList.value = response.data.results;
                store.commit('departments/LIST_DEPARTMENTS', depList.value)
                depResults.value = response.data;
                console.log("THE DEP RESULTS IS ",depResults.value.count);
                depArrLen.value = depList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / 10);
                
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDepartments();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDepartments();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDepartments();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDepartments();
            // scrollToTop();
        }
        const resetFilters = () =>{
            store.commit('Departments/RESET_SEARCH_FILTERS')
            searchDepartments();
        }
        onMounted(()=>{
            searchDepartments();
        })
        return{
            searchDepartments, addButtonLabel, searchFilters, resetFilters, tableColumns, depList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, actions
        }
    }
}
</script>