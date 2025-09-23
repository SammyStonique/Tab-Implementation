<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewDebtor"
            :searchFilters="searchFilters"
            @searchPage="searchDebtors"
            @resetFilters="resetFilters"
            @importData="importDebtors"
            @removeItem="removeDebtor"
            @removeSelectedItems="removeDebtors"
            @printList="printCustomersList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="debtorList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            :groupingKey=true
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
                :displayButtons="displayButtons" @handleSubmit="saveDebtor" @handleReset="handleReset"
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
    name: 'Customers',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'customer_id';
        const addButtonLabel = ref('New Debtor');
        const title = ref('Debtor Details');
        const addingRight = ref('Adding Debtor');
        const rightsModule = ref('Accounts');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const debtorList = ref([]);
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
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const catComponentKey = ref(0);
        const isEditing = computed(()=> store.state.Customers.isEditing);
        const selectedCustomer = computed(()=> store.state.Customers.selectedCustomer);
        const selectedCategory = computed(()=> store.state.Customers.selectedCategory);
        const categoryArray = computed(()=> store.state.Client_Categories.categoryArr)
        const categoryID = ref('');
        const categorySearchID = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"customer_code"},
            {label: "Name", key:"customer_name"},
            {label: "Category", key:"category"},
            {label: "Email", key: "email"},
            {label: "Pin No", key:"pin_no"},
            {label: "Phone No", key:"phone_number"},
            {label: "Contact Person", key:"contact_person"},
            {label: "Address", key:"invoicing_address"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Debtor', rightName: 'Editing Debtor'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement', rightName: 'View Debtor Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Debtor', rightName: 'Deleting Debtor'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        
        const customer_code_search = ref("");
        const customer_name_search = ref("");
        const fetchCategories = async() =>{
            await store.dispatch('Client_Categories/fetchClientCategories', {company:companyID.value})
        };
        const handleSearchCategory = async(option) =>{
            await store.dispatch('Client_Categories/handleSelectedCategory', option)
            categorySearchID.value = store.state.Client_Categories.categoryID;
        };
        const clearSearchCategory = async() =>{
            await store.dispatch('Client_Categories/updateState', {categoryID: ''});
            categorySearchID.value = ""
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Code...", value: customer_code_search, width:40,},
            {type:'text', placeholder:"Name...", value: customer_name_search, width:48,},
            {
                type:'search-dropdown', value: categorySearchID.value, width:64, componentKey: catComponentKey,
                selectOptions: categoryArray, optionSelected: handleSearchCategory,
                searchPlaceholder: 'Category Search...', dropdownWidth: '300px',
                fetchData: fetchCategories(), clearSearch: clearSearchCategory()             
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        
        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Client_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Client_Categories.categoryID;
        };
        const clearSelectedCategory = async() =>{
            await store.dispatch('Client_Categories/updateState', {categoryID: ''});
            categoryID.value = ""
        };
        const formFields = ref([]);
        const categoryValue = computed(() => {
            return (selectedCustomer.value && selectedCustomer.value.category && !categoryID.value) ? selectedCustomer.value.category.category_id : categoryID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Category", value: categoryValue.value, componentKey: catComponentKey,
                    selectOptions: categoryArray, optionSelected: handleSelectedCategory, required: true,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '500px', updateValue: selectedCategory.value,
                    fetchData: fetchCategories(), clearSearch: clearSelectedCategory()
                },
                { type: 'text', name: 'customer_name',label: "Name", value: selectedCustomer.value?.customer_name || '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: selectedCustomer.value?.phone_number || '', required: true },
                { type: 'text', name: 'email',label: "Email", value: selectedCustomer.value?.email || '', required: true },
                { type: 'text', name: 'pin_no',label: "Tax Pin No", value: selectedCustomer.value?.pin_no || '', required: true },
                { type: 'text', name: 'contact_person',label: "Contact Person", value: selectedCustomer.value?.contact_person || '', required: true },
                { type: 'text', name: 'invoicing_address',label: "Address", value: selectedCustomer.value?.invoicing_address || '', required: true },
            ];
        };
        const handleReset = () =>{
            for(let i=1; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            categoryID.value = "";
            catComponentKey.value += 1;
        }

        watch([selectedCustomer, selectedCategory], () => {
            if (selectedCustomer.value && selectedCategory.value) {
                updateFormFields();
                catComponentKey.value += 1;
            }
            
        }, { immediate: true });
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createCustomer = async() =>{
            showModalLoader();
            let formData = {
                customer_name: formFields.value[1].value,
                contact_person: formFields.value[5].value,
                email: formFields.value[3].value,
                phone_number: formFields.value[2].value,
                pin_no: formFields.value[4].value,
                category: categoryID.value,
                category_id: categoryID.value,
                invoicing_address: formFields.value[6].value,
                company: companyID.value
            }
  
            errors.value = [];
            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(categoryID.value == ""){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Customers/createCustomer', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Debtor created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Debtor.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Debtor: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchDebtors();
                }
            }
        }
        const updateCustomer = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                customer: selectedCustomer.value.customer_id,
                customer_name: formFields.value[1].value,
                contact_person: formFields.value[5].value,
                email: formFields.value[3].value,
                phone_number: formFields.value[2].value,
                pin_no: formFields.value[4].value,
                category: categoryValue.value,
                category_id: categoryValue.value,
                invoicing_address: formFields.value[6].value,
                company: companyID.value
            }

            for(let i=1; i < formFields.value.length; i++){
                if(formFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            if(categoryValue.value == ""){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Customers/updateCustomer', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Debtor updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Debtor.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Debtor: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Customers/updateState",{selectedCustomer:null,  selectedCategory:null,})
                    searchDebtors();
                }             
            }
        }
        const saveDebtor = () =>{
            if(isEditing.value == true){
                updateCustomer();
            }else{
                createCustomer();
            }
        }
        const importDebtors = () =>{
            store.commit('pageTab/ADD_PAGE', {'FA':'Import_Debtors'})
            store.state.pageTab.faActiveTab = 'Import_Debtors';
        }
        const removeDebtor = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    customer: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Customers/deleteCustomer',formData)
                    if(response && response.status == 200){
                        toast.success("Debtor Removed Succesfully");
                        searchDebtors();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Debtor: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Debtor") 
            }else{
                toast.error("Please Select A Debtor To Remove")
            }
        }
        const removeDebtors = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    customer: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Customers/deleteCustomer',formData)
                    if(response && response.status == 200){
                        toast.success("Customer(s) Removed Succesfully");
                        searchDebtors();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Customer: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Customer To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDebtors = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                customer_name: customer_name_search.value,
                customer_code: customer_code_search.value,
                category: categorySearchID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/customer-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                debtorList.value = response.data.results;
                store.commit('Customers/LIST_CUSTOMERS', debtorList.value)
                propResults.value = response.data;
                propArrLen.value = debtorList.value.length;
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
            searchDebtors(selectedValue.value);
        };
        const resetFilters = () =>{
            customer_code_search.value = "";
            customer_name_search.value = "";
            catComponentKey.value += 1;
            categorySearchID.value = "";
            searchDebtors();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDebtors();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDebtors();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDebtors();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDebtors();
            // scrollToTop();
        }
        const addNewDebtor = () =>{
            updateFormFields();
            store.dispatch("Customers/updateState",{selectedCustomer:null, selectedCategory:null, isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const customerID = row[idField];
                let formData = {
                    company: companyID.value,
                    customer: customerID
                }
                await store.dispatch('Customers/fetchCustomer',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const customerID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    customer: customerID
                }
                await store.dispatch('Customers/deleteCustomer',formData).
                then(()=>{
                    searchDebtors();
                })
            }else if(action == 'view'){
                const customerID = row[idField];
                let formData = {
                    company: companyID.value,
                    customer: customerID
                }
                await store.dispatch('Customers/fetchCustomer',formData)
                store.commit('pageTab/ADD_PAGE', {'INV':'Debtor_Statement'})
                store.state.pageTab.invActiveTab = 'Debtor_Statement';
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        };
        const printCustomersList = () =>{
            showLoader();

            let formData = {
                customer_name: customer_name_search.value,
                customer_code: customer_code_search.value,
                category: categorySearchID.value,
                company_id: companyID.value
            }
            axios
            .post("api/v1/export-customers-pdf/", formData, { responseType: 'blob' })
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
        }
        onBeforeMount(()=>{
            searchDebtors();
            
        })
        return{
            title, searchDebtors,resetFilters, addButtonLabel, searchFilters, tableColumns, debtorList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewDebtor, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveDebtor, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importDebtors, removeDebtor, removeDebtors, handleReset,printCustomersList,addingRight,rightsModule,selectSearchQuantity,selectedValue
        }
    }
};
</script>