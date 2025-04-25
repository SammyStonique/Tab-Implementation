<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewRight"
        :searchFilters="searchFilters"
        @searchPage="searchRights"
        @importData="importPermissions"
        @resetFilters="resetFilters"
        @printExcel="printPermissionsList"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="rightsList"
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
            :displayButtons="displayButtons" @handleSubmit="saveRight" @handleReset="handleReset"
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
    name: 'User_Rights',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Right Details');
        const addButtonLabel = ref('New Right');
        const addingRight = ref('Adding User Rights');
        const rightsModule = ref('Settings');
        const idField = 'permission_id';
        const depModalVisible = ref(false);
        const rightsList = ref([]);
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
        const isEditing = computed(()=> store.state.User_Rights.isEditing);
        const selectedRight = computed(()=> store.state.User_Rights.selectedRight);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"permission_name",type: "text", editable: false},
            {label: "Module", key: "module", type: "text", editable: false}
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Right', rightName: 'Editing User Rights'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Right', rightName: 'Deleting User Rights'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const module_search = computed({
            get: () => store.state.User_Rights.module_search,
            set: (value) => store.commit('User_Rights/SET_SEARCH_FILTERS', {"module_search":value}),
        });
        const name_search = computed({
            get: () => store.state.User_Rights.name_search,
            set: (value) => store.commit('User_Rights/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const searchFilters = ref([
            {
                type:'dropdown', placeholder:"Module", value: module_search, width:48,
                options: [{ text: 'HMS', value: 'HMS' }, { text: 'PMS', value: 'PMS' },{ text: 'Accounts', value: 'Accounts' }, { text: 'Inventory', value: 'Inventory' },{ text: 'HR', value: 'HR' }, { text: 'Settings', value: 'Settings' },{ text: 'HHS', value: 'HHS' }, { text: 'MMS', value: 'MMS' }, { text: 'PSS', value: 'PSS' }, { text: 'VSS', value: 'VSS' }]
            },
            {type:'text', placeholder:"Search Name...", value: name_search}
        ]);
        const formFields = ref([]);
        const updateFormFields = (right) => {
            formFields.value = [
            { type: 'dropdown', name: 'module',label: "Module", value: right?.module || '', placeholder: "", required: true, options: [{ text: 'HMS', value: 'HMS' }, { text: 'PMS', value: 'PMS' },{ text: 'Accounts', value: 'Accounts' }, { text: 'Inventory', value: 'Inventory' },{ text: 'HR', value: 'HR' }, { text: 'Settings', value: 'Settings' },{ text: 'HHS', value: 'HHS' }, { text: 'MMS', value: 'MMS' }, { text: 'PSS', value: 'PSS' }, { text: 'VSS', value: 'VSS' }] },
                { type: 'text', name: 'permission_name',label: "Name", value: right?.permission_name || '', required: true },
            ];
        };
        watch(selectedRight, (newRight) => {
            updateFormFields(newRight);
        }, { immediate: true });
        const addNewRight = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("User_Rights/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        };
        
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const rightID = row['permission_id'];
                const permName = row['permission_name'];
                const mod = row['module'];
                await store.dispatch('User_Rights/updateState',{rightID: rightID})
                let formData = {
                    module: mod,
                    permission_name: permName
                }
                await store.dispatch('User_Rights/fetchRight',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const rightID = row['permission_id'];
                const permName = row['permission_name'];
                const mod = row['module'];
                await store.dispatch('User_Rights/updateState',{rightID: rightID})
                let formData = {
                    module: mod,
                    permission_name: permName
                }
                await store.dispatch('User_Rights/deleteRight',formData).
                then(()=>{
                    searchRights();
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
        const createRight = async() =>{
            showModalLoader();
            let formData = {
                module: formFields.value[0].value,
                permission_name: formFields.value[1].value,
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
                    const response = await store.dispatch('User_Rights/createRight', formData);
                    if(response) {
                        hideModalLoader();
                        toast.success('Right created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Right.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Right: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }

        }
        const updateRight = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                module: formFields.value[0].value,
                permission_name: formFields.value[1].value,
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
                    const response = await store.dispatch('User_Rights/updateRight', formData);
                    if (response) {
                        hideModalLoader();
                        toast.success("Right updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Right.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Right: ' + error.message);
                } finally {
                    hideModalLoader();
                    await store.dispatch('User_Rights/updateState',{rightID: ""})
                }
            }
        }
        const saveRight = () =>{
            if(isEditing.value == true){
                updateRight();
            }else{
                createRight();
            }
        }
        const importPermissions = () =>{
            store.commit('pageTab/ADD_PAGE', {'SET':'Import_Permissions'})
            store.state.pageTab.setActiveTab = 'Import_Permissions';
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchRights = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                module: module_search.value,
                permission_name: name_search.value,
            }
            axios
            .post(`api/v1/permissions-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                rightsList.value = response.data.results;
                store.commit('User_Rights/LIST_RIGHTS', rightsList.value)
                depResults.value = response.data;
                depArrLen.value = rightsList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / 1000);
                
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
            
            searchRights();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchRights();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchRights();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchRights();
        }
        const resetFilters = () =>{
            store.commit('User_Rights/RESET_SEARCH_FILTERS')
            searchRights();
        }
        const printPermissionsList = () =>{
            showLoader();
            let formData = {
                module: module_search.value,
                permission_name: name_search.value,
            } 

            axios
            .post("api/v1/export-permissions-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Permissions.xls');
                        document.body.appendChild(link);
                        link.click();
                    }
                })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        onMounted(()=>{
            searchRights();
        })
        return{
            title,idField, searchRights, addButtonLabel, searchFilters, resetFilters, tableColumns, rightsList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewRight,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveRight,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,addingRight,rightsModule,
            importPermissions,printPermissionsList
        }
    }
}
</script>