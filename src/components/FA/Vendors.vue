<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewVendor"
            :searchFilters="searchFilters"
            @searchPage="searchVendors"
            @resetFilters="resetFilters"
            @importData="importVendors"
            @removeItem="removeVendor"
            @removeSelectedItems="removeVendors"
            @printList="printList"
            :columns="tableColumns"
            :rows="vendorList"
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
        />
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="saveVendor" @handleReset="handleReset"
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

export default{
    name: 'Vendors',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'vendor_id';
        const addButtonLabel = ref('New Vendor');
        const title = ref('Vendor Details');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const vendorList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
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
        const isEditing = computed(()=> store.state.Vendors.isEditing);
        const selectedVendor = computed(()=> store.state.Vendors.selectedVendor);
        const selectedCategory = computed(()=> store.state.Vendors.selectedCategory);
        const categoryArray = computed(()=> store.state.Client_Categories.categoryArr)
        const categoryID = ref('');
        const categorySearchID = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"vendor_code"},
            {label: "Name", key:"vendor_name"},
            {label: "Category", key:"category"},
            {label: "Email", key: "email"},
            {label: "Pin No", key:"pin_no"},
            {label: "Phone No", key:"phone_number"},
            {label: "Contact Person", key:"contact_person"},
            {label: "Address", key:"invoicing_address"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Vendor'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Vendor'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        
        const vendor_code_search = computed({
            get: () => store.state.Vendors.vendor_code_search,
            set: (value) => store.commit('Vendors/SET_SEARCH_FILTERS', {"vendor_code_search":value}),
        });
        const vendor_name_search = computed({
            get: () => store.state.Vendors.vendor_name_search,
            set: (value) => store.commit('Vendors/SET_SEARCH_FILTERS', {"vendor_name_search":value}),
        });
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
            {type:'text', placeholder:"Code...", value: vendor_code_search, width:40,},
            {type:'text', placeholder:"Name...", value: vendor_name_search, width:48,},
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
            return (selectedVendor.value && selectedVendor.value.category && !categoryID.value) ? selectedVendor.value.category.category_id : categoryID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Category", value: categoryValue.value, componentKey: catComponentKey,
                    selectOptions: categoryArray, optionSelected: handleSelectedCategory, required: true,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '500px', updateValue: selectedCategory.value,
                    fetchData: fetchCategories(), clearSearch: clearSelectedCategory()
                },
                { type: 'text', name: 'vendor_name',label: "Name", value: selectedVendor.value?.vendor_name || '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: selectedVendor.value?.phone_number || '', required: true },
                { type: 'text', name: 'email',label: "Email", value: selectedVendor.value?.email || '', required: true },
                { type: 'text', name: 'pin_no',label: "Tax Pin No", value: selectedVendor.value?.pin_no || '', required: true },
                { type: 'text', name: 'contact_person',label: "Contact Person", value: selectedVendor.value?.contact_person || '', required: true },
                { type: 'text', name: 'invoicing_address',label: "Address", value: selectedVendor.value?.invoicing_address || '', required: true },
            ];
        };
        const handleReset = () =>{
            for(let i=1; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            categoryID.value = "";
            catComponentKey.value += 1;
        }

        watch([selectedVendor, selectedCategory], () => {
            if (selectedVendor.value && selectedCategory.value) {
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
        const createVendor = async() =>{
            showModalLoader();
            let formData = {
                vendor_name: formFields.value[1].value,
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
                    const response = await store.dispatch('Vendors/createVendor', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Vendor created successfully!');
                        handleReset();
                    } else {
                        toast.error('An error occurred while creating the Vendor.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Vendor: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchVendors();
                }
            }
        }
        const updateVendor = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                vendor: selectedVendor.value.vendor_id,
                vendor_name: formFields.value[1].value,
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
                    const response = await store.dispatch('Vendors/updateVendor', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Vendor updated successfully!");              
                    } else {
                        toast.error('An error occurred while updating the Vendor.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Vendor: ' + error.message);
                } finally {
                    hideModalLoader();
                    propModalVisible.value = false;
                    store.dispatch("Vendors/updateState",{selectedVendor:null, selectedCategory:null,})
                    searchVendors();
                }             
            }
        }
        const saveVendor = () =>{
            if(isEditing.value == true){
                updateVendor();
            }else{
                createVendor();
            }
        }
        const importVendors = () =>{
            store.commit('pageTab/ADD_PAGE', {'FA':'Import_Vendors'})
            store.state.pageTab.faActiveTab = 'Import_Vendors';
        }
        const removeVendor = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    vendor: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Vendors/deleteVendor',formData)
                    if(response && response.status == 200){
                        toast.success("Vendor Removed Succesfully");
                        searchVendors();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Vendor: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Vendor") 
            }else{
                toast.error("Please Select A Vendor To Remove")
            }
        }
        const removeVendors = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    vendor: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Vendors/deleteVendor',formData)
                    if(response && response.status == 200){
                        toast.success("Vendor(s) Removed Succesfully");
                        searchVendors();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Vendor: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Vendor To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchVendors = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                vendor_name: vendor_name_search.value,
                vendor_code: vendor_code_search.value,
                category: categorySearchID.value,
                company_id: companyID.value
            } 
            axios
            .post(`api/v1/vendor-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                vendorList.value = response.data.results;
                store.commit('Vendors/LIST_VENDORS', vendorList.value)
                propResults.value = response.data;
                propArrLen.value = vendorList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / 50);
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
        }
        const resetFilters = () =>{
            store.commit('Vendors/RESET_SEARCH_FILTERS');
            catComponentKey.value += 1;
            categorySearchID.value = "";
            searchVendors();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchVendors();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchVendors();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchVendors();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchVendors();
            // scrollToTop();
        }
        const addNewVendor = () =>{
            updateFormFields();
            store.dispatch("Vendors/updateState",{selectedVendor:null, selectedCategory:null, isEditing:false})
            propModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const vendorID = row[idField];
                let formData = {
                    company: companyID.value,
                    vendor: vendorID
                }
                await store.dispatch('Vendors/fetchVendor',formData)
                propModalVisible.value = true;
                flex_basis.value = '1/3';
                flex_basis_percentage.value = '33.333';

            }else if(action == 'delete'){
                const vendorID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    vendor: vendorID
                }
                await store.dispatch('Vendors/deleteVendor',formData).
                then(()=>{
                    searchVendors();
                })
            }else if(action == 'view'){
                const vendorID = row[idField];
                let formData = {
                    company: companyID.value,
                    vendor: vendorID
                }
                await store.dispatch('Vendors/fetchVendor',formData)
                store.commit('pageTab/ADD_PAGE', {'FA':'Vendor_Statement'})
                store.state.pageTab.faActiveTab = 'Vendor_Statement';
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchVendors();
            
        })
        return{
            title, searchVendors,resetFilters, addButtonLabel, searchFilters, tableColumns, vendorList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewVendor, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, saveVendor, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            importVendors, removeVendor, removeVendors, handleReset,
        }
    }
};
</script>