<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewGroup"
            :searchFilters="searchFilters"
            @searchPage="searchGroups"
            @resetFilters="resetFilters"
            @removeItem="removeGroup"
            @removeSelectedItems="removeGroups"
            @printList="printGroupsList"
            @printExcel="downloadGroupsExcel"
            @printCSV="downloadGroupsCSV"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="groupsList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            :count="propCount"
            :currentPage="currentPage"
            :result="propArrLen"
            @loadPrev="loadPrev"
            @loadNext="loadNext"
            @firstPage="firstPage"
            @lastPage="lastPage"
            :showNextBtn="showNextBtn"
            :showPreviousBtn="showPreviousBtn"
            :selectedValue="selectedValue"
            @selectSearchQuantity="selectSearchQuantity"
        />
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveGroup" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';

export default{
    name: 'Pay_Groups',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const propComponentKey = ref(0);
        const idField = 'pay_group_id';
        const addButtonLabel = ref('New Pay Group');
        const addingRight = ref('Adding Pay Group');
        const removingRight = ref('Deleting Pay Group');
        const rightsModule = ref('HR');
        const title = ref('Pay Group Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const groupsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('300px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const cycleID = ref('');
        const isEditing = computed(()=> store.state.Pay_Groups.isEditing);
        const selectedGroup = computed(()=> store.state.Pay_Groups.selectedGroup);
        const selectedCycle = computed(()=> store.state.Pay_Groups.selectedCycle);
        const cycleArray = computed(() => store.state.Pay_Cycles.cycleArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Group Name", key:"pay_group_name"},
            {label: "Taxed", key:"taxation_status"},
            {label: "Pay Cycle", key: "pay_cycle_name"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Group', rightName: 'Editing Pay Group'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Group', rightName: 'Deleting Pay Group'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const group_name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Group Name...", value: group_name_search, width:56,},
  
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedCycle = async(option) =>{
            await store.dispatch('Pay_Cycles/handleSelectedPayCycle', option)
            cycleID.value = store.state.Pay_Cycles.cycleID;
        };
        const clearSelectedCycle = async() =>{
            await store.dispatch('Pay_Cycles/updateState', {cycleID: ''});
            cycleID.value = store.state.Pay_Cycles.cycleID;
        };
        const formFields = ref([]);
        const cycleValue = computed(() => {
           return (selectedGroup.value && selectedGroup.value.pay_cycle && !cycleID.value) ? selectedGroup.value.pay_cycle.pay_cycle_id : cycleID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Pay Cycle", value: cycleValue.value, componentKey: propComponentKey,
                    selectOptions: cycleArray, optionSelected: handleSelectedCycle, required: true,
                    searchPlaceholder: 'Select Pay Cycle...', dropdownWidth: '500px', updateValue: selectedCycle.value,
                    fetchData: store.dispatch('Pay_Cycles/fetchPayCycles', {company:companyID.value}),
                    clearSearch: clearSelectedCycle
                },
                { type: 'text', name: 'pay_group_name',label: "Group Name", value: selectedGroup.value?.pay_group_name || '', required: true },
                { type: 'dropdown', name: 'taxation_status',label: "Taxed", value: selectedGroup.value?.taxation_status || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            propComponentKey.value += 1;
            cycleID.value = '';
        }

        watch([selectedGroup, selectedCycle], () => {
            if (selectedGroup.value && selectedCycle.value) {
                propComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });
        
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createPayGroup = async() =>{
            showModalLoader();
            let formData = {
                pay_group_name: formFields.value[1].value,
                taxation_status: formFields.value[2].value || 'No',
                pay_cycle: cycleID.value,
                pay_cycle_id: cycleID.value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(cycleValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Pay_Groups/createPayGroup', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Pay Group created successfully!');
                        handleReset();
                        propComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Pay Group.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Pay Group: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchGroups();
                }
            }
        }
        const updatePayGroup = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                pay_group: selectedGroup.value.pay_group_id,
                pay_group_name: formFields.value[1].value,
                taxation_status: formFields.value[2].value || 'No',
                pay_cycle: cycleID.value,
                pay_cycle_id: cycleID.value,
                company: companyID.value
            }

            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].type != 'search-dropdown'  && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(propertyValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Pay_Groups/updatePayGroup', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        propComponentKey.value += 1;
                        toast.success("Pay Group updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Pay Group.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update unit: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Pay_Groups/updateState",{selectedGroup:null})
                    searchGroups();
                }             
            }
        }
        const saveGroup = () =>{
            if(isEditing.value == true){
                updatePayGroup();
            }else{
                createPayGroup();
            }
        }
        const removeGroup = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    pay_group: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Pay_Groups/deletePayGroup',formData)
                    if(response && response.status == 200){
                        toast.success("Pay Group Removed Succesfully");
                        searchGroups();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Pay Group: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Pay Group") 
            }else{
                toast.error("Please Select A Pay Group To Remove")
            }
        }
        const removeGroups = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    pay_group: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Pay_Groups/deletePayGroup',formData)
                    if(response && response.status == 200){
                        toast.success("Pay Group(s) Removed Succesfully");
                        searchGroups();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Pay Group: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Pay Group To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchGroups = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                pay_group_name: group_name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/pay-groups-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                groupsList.value = response.data.results;
                store.commit('Pay_Groups/LIST_GROUPS', groupsList.value)
                propResults.value = response.data;
                propArrLen.value = groupsList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / selectedValue.value);
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchGroups(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            group_name_search.value = "";
            searchGroups();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchGroups();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchGroups();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchGroups();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchGroups();
            // scrollToTop();
        }
        const addNewGroup = () =>{
            store.dispatch("Pay_Groups/updateState",{selectedCycle:null, selectedGroup:null});
            propComponentKey.value += 1;
            handleReset();
            updateFormFields();
            propModalVisible.value = true;
            store.dispatch("Pay_Groups/updateState",{isEditing:false})
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const groupID = row['pay_group_id'];
                let formData = {
                    company: companyID.value,
                    pay_group: groupID
                }
                await store.dispatch('Pay_Groups/fetchPayGroup',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const groupID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    pay_group: groupID
                }
                await store.dispatch('Pay_Groups/deletePayGroup',formData).
                then(()=>{
                    searchGroups();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printGroupsList = () =>{
            showLoader();
            let formData = {
                pay_group_name: group_name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-pay-groups-pdf/", formData, { responseType: 'blob' })
                .then((response)=>{
                    if(response.status == 200){
                        const blob1 = new Blob([response.data]);
                        // Convert blob to URL
                        const url = URL.createObjectURL(blob1);
                        PrintJS({printable: url, type: 'pdf'});
                    }
                })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const downloadGroupsExcel = () =>{
            showLoader();
            let formData = {
                pay_group_name: group_name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios.post("api/v1/export-pay-groups-excel/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Pay Groups.xlsx');
                document.body.appendChild(link);
                link.click();
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const downloadGroupsCSV = () =>{
            showLoader();
            let formData = {
                pay_group_name: group_name_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios.post("api/v1/export-pay-groups-csv/", formData, { responseType: 'blob' })
            .then((response)=>{
                if(response.status == 200){
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Pay Groups.csv');
                document.body.appendChild(link);
                link.click();
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        onBeforeMount(()=>{
            searchGroups();
            
        })
        return{
            title, searchGroups,resetFilters, addButtonLabel, searchFilters, tableColumns, groupsList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewGroup, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveGroup, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeGroup, removeGroups,addingRight,removingRight,rightsModule,printGroupsList,selectSearchQuantity,selectedValue,
            downloadGroupsCSV,downloadGroupsExcel
        }
    }
};
</script>