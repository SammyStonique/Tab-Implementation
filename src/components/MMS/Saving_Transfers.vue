<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewTransfer"
        :searchFilters="searchFilters"
        @searchPage="searchTransfers"
        @resetFilters="resetFilters"
        @removeItem="removeTransfer"
        @removeSelectedItems="removeTransfers"
        @importData="importTransfers"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="transfersList"
        :actions="actions"
        :showTotals="showTotals"
        :idField="idField"
        @handleSelectionChange="handleSelectionChange"
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
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader"  @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="createTransfer" @handleReset="handleReset"
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
    name: 'Saving_Transfers',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const memComponentKey = ref(0);
        const prodComponentKey = ref(0);
        const prodSearchComponentKey = ref(0);
        const title = ref('Saving Transfer Details');
        const addButtonLabel = ref('New Saving Transfer');
        const addingRight = ref('Adding Saving Transfers');
        const removingRight = ref('Deleting Saving Transfers');
        const rightsModule = ref('MMS');
        const idField = 'saving_transfer_id';
        const depModalVisible = ref(false);
        const selectedIds = ref([]);
        const transfersList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
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
        const accArray = computed(() => store.state.Saving_Accounts.accountArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date", type: "text", editable: false},
            {label: "Acc No.", key: "account_number_from", type: "text", editable: false},
            {label: "Member From", key: "member_name_from", type: "text", editable: false},
            {label: "Saving Product", key: "saving_product", type: "text", editable: false},
            {label: "Acc No.", key: "account_number_to", type: "text", editable: false},
            {label: "Member To", key: "member_name_to", type: "text", editable: false},
            {label: "Saving Product", key: "saving_product", type: "text", editable: false},
            {label: "Amount", key: "amount", type: "number", editable: false},
            {label: "Txn. No.", key: "txn_no", type: "text", editable: false},
            {label: "Done By", key: "done_by", type: "text", editable: false},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Transfer', rightName: 'Deleting Saving Transfers'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const accountID = ref('');
        const accountToID = ref('');
        const productSearchID = ref('');
        const account_number_search = ref('');
        const name_search = ref('');
        const member_number_search = ref("");
        const products_array = computed({
            get: () => store.state.Savings_Products.productArr,
        });
        const handleSelectedSearchProduct = async(option) =>{
            await store.dispatch('Savings_Products/handleSelectedProduct', option)
            productSearchID.value = store.state.Savings_Products.productID;
        };
        const clearSelectedSearchProduct = async() =>{
            await store.dispatch('Savings_Products/updateState', {productID: ''});
            productSearchID.value = store.state.Savings_Products.productID;
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Account No...", value: account_number_search, width:40,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:36,},
            {type:'text', placeholder:"Search Name...", value: name_search, width:48,},
            {
                type:'search-dropdown', value: products_array, width:48, componentKey: prodSearchComponentKey,
                selectOptions: products_array, optionSelected: handleSelectedSearchProduct,
                searchPlaceholder: 'Saving Product...', dropdownWidth: '300px',
                fetchData: store.dispatch('Savings_Products/fetchSavingsProducts', {company:companyID.value}),
                clearSearch: clearSelectedSearchProduct
            },
        ]);
        const importTransfers = () =>{
            store.commit('pageTab/ADD_PAGE', {'MMS':'Import_Saving_Transfers'})
            store.state.pageTab.mmsActiveTab = 'Import_Saving_Transfers';
        }
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedAccount = async(option) =>{
            await store.dispatch('Saving_Accounts/handleSelectedAccount', option)
            accountID.value = store.state.Saving_Accounts.accountID;
        };
        const clearSelectedAccount = async() =>{
            await store.dispatch('Saving_Accounts/updateState', {accountID: ''});
            accountID.value = store.state.Saving_Accounts.accountID;
        };
        const handleSelectedAccountTo = async(option) =>{
            await store.dispatch('Saving_Accounts/handleSelectedAccount', option)
            accountToID.value = store.state.Saving_Accounts.accountID;
        };
        const clearSelectedAccountTo = async() =>{
            await store.dispatch('Saving_Accounts/updateState', {accountID: ''});
            accountToID.value = store.state.Saving_Accounts.accountID;
        };
        const formFields = ref([]);
        const accValue = computed(() => {
            return accountID.value;
        });
        const accToValue = computed(() => {
            return accountToID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Saving Account From", value: accValue.value, componentKey: memComponentKey,
                    selectOptions: accArray, optionSelected: handleSelectedAccount, required: true,
                    searchPlaceholder: 'Select Account From...', dropdownWidth: '500px',
                    fetchData: store.dispatch('Saving_Accounts/fetchSavingAccounts', {company:companyID.value, transferrable:"Yes"}), clearSearch: clearSelectedAccount
                },
                {  
                    type:'search-dropdown', label:"Saving Account To", value: accToValue.value, componentKey: prodComponentKey,
                    selectOptions: accArray, optionSelected: handleSelectedAccountTo, required: true,
                    searchPlaceholder: 'Select Account To...', dropdownWidth: '500px',
                    clearSearch: clearSelectedAccountTo
                },
                { type: 'date', name: 'date',label: "Transfer Date", value: '', required: true },
                { type: 'text', name: 'amount',label: "Amount", value: '', required: true },
                
            ];
        };

        const addNewTransfer = () =>{
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const transferID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    saving_transfer: transferID
                }
                await store.dispatch('Saving_Transfers/deleteSavingTransfer',formData).
                then(()=>{
                    searchTransfers();
                })
            }
        } 
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            accountID.value = "";
            accountToID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createTransfer = async() =>{
            showModalLoader();
            let formData = {
                done_by: '-',
                date: formFields.value[2].value,
                amount: formFields.value[3].value,
                saving_account_from: accountID.value,
                saving_account_from_id: accountID.value,
                saving_account_to: accountToID.value,
                saving_account_to_id: accountToID.value,
                journal: null,
                journal_id: null,
                user: userID.value,
                company: companyID.value
            };
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(accValue.value == '' || accToValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Saving_Transfers/createSavingTransfer', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Transfer created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Transfer.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Transfer: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchTransfers();
                }
            }

        }

        const removeTransfer = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    saving_transfer: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Saving_Transfers/deleteSavingTransfer',formData)
                    if(response && response.status == 200){
                        toast.success("Transfer Removed Succesfully");
                        searchTransfers();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Transfer: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Transfer") 
            }else{
                toast.error("Please Select A Transfer To Remove")
            }
        }
        const removeTransfers = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    saving_transfer: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Saving_Transfers/deleteSavingTransfer',formData)
                    if(response && response.status == 200){
                        toast.success("Transfer(s) Removed Succesfully");
                        searchTransfers();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Transfer(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Transfer To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchTransfers = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                account_number: account_number_search.value,
                member_name: name_search.value,
                member_number: member_number_search.value,
                product: productSearchID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/saving-transfers-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                transfersList.value = response.data.results;
                store.commit('Saving_Transfers/LIST_TRANSFERS', transfersList.value)
                depResults.value = response.data;
                depArrLen.value = transfersList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / selectedValue.value);
                
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
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchTransfers(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTransfers();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTransfers();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTransfers();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTransfers();
        }
        const resetFilters = () =>{
            selectedValue.value = 50;
            name_search.value = "";
            account_number_search.value = "";
            member_number_search.value = "";
            prodSearchComponentKey.value += 1;
            productSearchID.value = "";
            searchTransfers();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchTransfers();
        })
        return{
            title,idField, searchTransfers, addButtonLabel, searchFilters, resetFilters, tableColumns, transfersList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewTransfer,showTotals,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createTransfer,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeTransfer, removeTransfers,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange,importTransfers
        }
    }
}
</script>