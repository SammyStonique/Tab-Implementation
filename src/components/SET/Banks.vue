<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewBank"
        :searchFilters="searchFilters"
        @searchPage="searchBanks"
        @resetFilters="resetFilters"
        @printList="printBanksList"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
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
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveBank" @handleReset="handleReset"
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
    name: 'Banks',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Bank Details');
        const addButtonLabel = ref('New Bank');
        const addingRight = ref('Adding Company Bank');
        const rightsModule = ref('Settings');
        const idField = 'bank_id';
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
        const isEditing = computed(()=> store.state.Banks.isEditing)
        const selectedBank = computed(()=> store.state.Banks.selectedBank);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"bank_code",type: "text", editable: false},
            {label: "Name", key: "bank_name", type: "text", editable: false}
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Bank', rightName: 'Editing Company Bank'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Bank', rightName: 'Deleting Company Bank'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const code_search = ref('');
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Search Code...", value: code_search},
            {type:'text', placeholder:"Search Name...", value: name_search}
        ]);
        const formFields = ref([]);
        const updateFormFields = (bank) => {
            formFields.value = [
                { type: 'text', name: 'bank_code',label: "Code", value: bank?.bank_code || '', required: true },
                { type: 'text', name: 'bank_name',label: "Name", value: bank?.bank_name || '', required: true },
            ];
        };
        watch(selectedBank, (newBank) => {
            updateFormFields(newBank);
        }, { immediate: true });
        const addNewBank = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Banks/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const bankID = row[idField];
                let formData = {
                    company: companyID.value,
                    bank: bankID
                }
                await store.dispatch('Banks/fetchBank',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const bankID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    bank: bankID
                }
                await store.dispatch('Banks/deleteBank',formData).
                then(()=>{
                    searchBanks();
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
        const createBank = async() =>{
            showModalLoader();
            let formData = {
                bank_code: formFields.value[0].value,
                bank_name: formFields.value[1].value,
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
                    const response = await store.dispatch('Banks/createBank', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Bank created successfully!');
                        handleReset();
                        searchBanks();
                    }else {
                        toast.error('An error occurred while creating the Bank.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Bank: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }

        }
        const updateBank = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                bank_code: formFields.value[0].value,
                bank_name: formFields.value[1].value,
                company: companyID.value,
                bank: selectedBank.value.bank_id
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
                    const response = await store.dispatch('Banks/updateBank', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Bank updated successfully!");
                        handleReset();
                        searchBanks();
                    } else {
                        toast.error('An error occurred while updating the Bank.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Bank: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }
        }
        const saveBank = () =>{
            if(isEditing.value == true){
                updateBank();
            }else{
                createBank();
            }
        };
        const importBanks = () =>{
            store.commit('pageTab/ADD_PAGE', {'SET':'Import_Banks'})
            store.state.pageTab.setActiveTab = 'Import_Banks';
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchBanks = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                bank_code: code_search.value,
                bank_name: name_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/banks-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                depList.value = response.data.results;
                store.commit('Banks/LIST_BANKS', depList.value)
                depResults.value = response.data;
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
            
            searchBanks();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchBanks();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchBanks();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchBanks();
        }
        const resetFilters = () =>{
            name_search.value = "";
            code_search.value = "";
            searchBanks();
        };
        const closeModal = async() =>{
            await store.dispatch("Banks/updateState",{isEditing:false, selectedBank:null})
            depModalVisible.value = false;
            handleReset();
        };
        const printBanksList = () =>{
            showLoader();
            let formData = {
                code: code_search.value,
                name: name_search.value,
                company_id: companyID.value
            } 

            axios
            .post("api/v1/export-banks-excel/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Banks.xlsx');
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
        // const printDepartmentsList = () =>{
        //     showLoader();
        //     let formData = {
        //         code: code_search.value,
        //         name: name_search.value,
        //         company_id: companyID.value
        //     } 

        //     axios
        //     .post("api/v1/export-departments-excel/", formData, { responseType: 'blob' })
        //         .then((response)=>{
        //             if(response.status == 200){
        //                 const blob1 = new Blob([response.data]);
        //                 // Convert blob to URL
        //                 const url = URL.createObjectURL(blob1);
        //                 PrintJS({printable: url, type: 'pdf'});
        //             }
        //         })
        //     .catch((error)=>{
        //         console.log(error.message);
        //     })
        //     .finally(()=>{
        //         hideLoader();
        //     })
        // }

        onMounted(()=>{
            searchBanks();
        })
        return{
            title,idField, searchBanks, addButtonLabel, searchFilters, resetFilters, tableColumns, depList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewBank,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveBank,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,addingRight,rightsModule,closeModal,
            printBanksList
        }
    }
}
</script>