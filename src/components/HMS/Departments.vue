<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewDepartment"
        :searchFilters="searchFilters"
        @searchPage="searchDepartments"
        @resetFilters="resetFilters"
        :columns="tableColumns"
        :rows="depList"
        :actions="actions"
        :idField="idField"
        @handleActionClick="handleActionClick"
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
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveDepartment" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Departments',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Department Details');
        const addButtonLabel = ref('New Department');
        const idField = 'department_id';
        const depModalVisible = ref(false);
        const depList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Departments.isEditing)
        const selectedDepartment = computed(()=> store.state.Departments.selectedDepartment);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"code",type: "text", editable: false},
            {label: "Name", key: "name", type: "text", editable: false}
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Department'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Department'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
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
        ]);
        const formFields = ref([]);
        const updateFormFields = (department) => {
            formFields.value = [
                { type: 'text', name: 'code',label: "Code", value: department?.code || '', required: true },
                { type: 'text', name: 'name',label: "Name", value: department?.name || '', required: true },
            ];
        };
        watch(selectedDepartment, (newDepartment) => {
            updateFormFields(newDepartment);
        }, { immediate: true });
        const addNewDepartment = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Departments/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const depID = row[idField];
                let formData = {
                    company: companyID.value,
                    department: depID
                }
                await store.dispatch('Departments/fetchDepartment',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const depID = row[idField];
                let formData = {
                    company: companyID.value,
                    department: depID
                }
                await store.dispatch('Departments/deleteDepartment',formData).
                then(()=>{
                    searchDepartments();
                })
            }
        } 
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createDepartment = async() =>{
            showModalLoader();
            let formData = {
                code: formFields.value[0].value,
                name: formFields.value[1].value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Departments/createDepartment', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Department created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the department.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create department: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }

        }
        const updateDepartment = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                code: formFields.value[0].value,
                name: formFields.value[1].value,
                company: companyID.value,
                department: selectedDepartment.value.department_id
            }
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Departments/updateDepartment', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Department updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the department.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update department: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }
        }
        const saveDepartment = () =>{
            if(isEditing.value == true){
                updateDepartment();
            }else{
                createDepartment();
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDepartments = () =>{
            showLoader();
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
                pageCount.value = Math.ceil(depCount.value / 50);
                
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDepartments();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDepartments();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDepartments();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDepartments();
        }
        const resetFilters = () =>{
            store.commit('Departments/RESET_SEARCH_FILTERS')
            searchDepartments();
        }
        onMounted(()=>{
            searchDepartments();
        })
        return{
            title,idField, searchDepartments, addButtonLabel, searchFilters, resetFilters, tableColumns, depList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewDepartment,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveDepartment,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader
        }
    }
}
</script>