<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewDeposit"
        :searchFilters="searchFilters"
        @searchPage="searchDeposits"
        @resetFilters="resetFilters"
        @removeItem="removeDeposit"
        @removeSelectedItems="removeDeposits"
        @importData="importDeposits"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="depositsList"
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
            :displayButtons="displayButtons" @handleSubmit="createDeposit" @handleReset="handleReset"
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
    name: 'Share_Deposits',
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
        const title = ref('Share Deposit Details');
        const addButtonLabel = ref('New Share Deposit');
        const addingRight = ref('Adding Share Deposits');
        const rightsModule = ref('MMS');
        const idField = 'share_deposit_id';
        const depModalVisible = ref(false);
        const depositsList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const selectedIds = ref([]);
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
        const accArray = computed(() => store.state.Share_Accounts.accountArr);
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date", type: "text", editable: false},
            {label: "Acc No", key: "account_number", type: "text", editable: false},
            {label: "Member No", key: "member_number", type: "text", editable: false},
            {label: "Member Name", key: "member_name", type: "text", editable: false},
            {label: "Share Product", key: "share_product", type: "text", editable: false},
            {label: "Amount", key: "amount", type: "text", editable: false},
            {label: "Ref. No.", key: "reference_no", type: "text", editable: false},
            {label: "Open. Bal.", key: "opening_balance", type: "text", editable: false},
            {label: "Posting Account", key: "posting_account", type: "text", editable: false},
            {label: "Txn. No.", key: "txn_no", type: "text", editable: false},
        ]);
        const showTotals = ref(true);
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Deposit', rightName: 'Deleting Share Deposits'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const accountID = ref('');
        const ledgerID = ref('');
        const productSearchID = ref('');
        const account_number_search = ref('');
        const name_search = ref('');
        const member_number_search = ref("");
        const products_array = computed({
            get: () => store.state.Shares_Products.productArr,
        });
        const handleSelectedSearchProduct = async(option) =>{
            await store.dispatch('Shares_Products/handleSelectedProduct', option)
            productSearchID.value = store.state.Shares_Products.productID;
        };
        const clearSelectedSearchProduct = async() =>{
            await store.dispatch('Shares_Products/updateState', {productID: ''});
            productSearchID.value = store.state.Shares_Products.productID;
        };
        const searchFilters = ref([
            {type:'text', placeholder:"Account No...", value: account_number_search, width:40,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:36,},
            {type:'text', placeholder:"Search Name...", value: name_search, width:48,},
            {
                type:'search-dropdown', value: products_array, width:48, componentKey: prodSearchComponentKey,
                selectOptions: products_array, optionSelected: handleSelectedSearchProduct,
                searchPlaceholder: 'Share Product...', dropdownWidth: '300px',
                fetchData: store.dispatch('Shares_Products/fetchSharesProducts', {company:companyID.value}),
                clearSearch: clearSelectedSearchProduct
            },
        ]);
        const importDeposits = () =>{
            store.commit('pageTab/ADD_PAGE', {'MMS':'Import_Share_Deposits'})
            store.state.pageTab.mmsActiveTab = 'Import_Share_Deposits';
        }
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedAccount = async(option) =>{
            await store.dispatch('Share_Accounts/handleSelectedAccount', option)
            accountID.value = store.state.Share_Accounts.accountID;
        };
        const clearSelectedAccount = async() =>{
            await store.dispatch('Share_Accounts/updateState', {accountID: ''});
            accountID.value = store.state.Share_Accounts.accountID;
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedProduct = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            ledgerID.value = store.state.Ledgers.ledgerID;
        };
        const formFields = ref([]);
        const accValue = computed(() => {
            return accountID.value;
        });
        const ledgerValue = computed(() => {
            return ledgerID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Share Account", value: accValue.value, componentKey: memComponentKey,
                    selectOptions: accArray, optionSelected: handleSelectedAccount, required: true,
                    searchPlaceholder: 'Select Account...', dropdownWidth: '400px',
                    fetchData: store.dispatch('Share_Accounts/fetchShareAccounts', {company:companyID.value}), clearSearch: clearSelectedAccount
                },
                { type: 'date', name: 'date',label: "Deposit Date", value: '', required: true },
                { type: 'text', name: 'reference_no',label: "Reference No", value: '', required: true },
                { type: 'text', name: 'amount',label: "Amount", value: '', required: true },
                { type: 'dropdown', name: 'opening_balance',label: "Opening Balance", value: 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                {  
                    type:'search-dropdown', label:"Deposit Account", value: ledgerValue.value, componentKey: prodComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedLedger, required: true,
                    searchPlaceholder: 'Select Posting Acc...', dropdownWidth: '400px',
                    fetchData: store.dispatch('Ledgers/fetchLedgers', {company:companyID.value}), clearSearch: clearSelectedProduct
                },
            ];
        };

        const addNewDeposit = () =>{
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const depositID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    share_deposit: depositID
                }
                await store.dispatch('Share_Deposits/deleteShareDeposit',formData).
                then(()=>{
                    searchDeposits();
                })
            }
        } 
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            accountID.value = "";
            ledgerID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createDeposit = async() =>{
            showModalLoader();
            let formData = {
                reference_no: formFields.value[2].value,
                opening_balance: formFields.value[4].value,
                date: formFields.value[1].value,
                amount: formFields.value[3].value,
                share_account: accountID.value,
                share_account_id: accountID.value,
                posting_account: ledgerID.value,
                posting_account_id: ledgerID.value,
                journal: null,
                journal_id: null,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(accValue.value == '' || ledgerValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Share_Deposits/createShareDeposit', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Deposit created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Deposit.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Deposit: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchDeposits();
                }
            }

        }

        const removeDeposit = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    share_deposit: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Share_Deposits/deleteShareDeposit',formData)
                    if(response && response.status == 200){
                        toast.success("Deposit Removed Succesfully");
                        searchDeposits();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Deposit: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Deposit") 
            }else{
                toast.error("Please Select A Deposit To Remove")
            }
        }
        const removeDeposits = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    share_deposit: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Share_Deposits/deleteShareDeposit',formData)
                    if(response && response.status == 200){
                        toast.success("Deposit(s) Removed Succesfully");
                        searchDeposits();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Deposit(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Deposit To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDeposits = () =>{
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
            .post(`api/v1/share-deposits-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                depositsList.value = response.data.results;
                store.commit('Share_Deposits/LIST_DEPOSITS', depositsList.value)
                depResults.value = response.data;
                depArrLen.value = depositsList.value.length;
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
            searchDeposits(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchDeposits();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDeposits();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDeposits();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDeposits();
        }
        const resetFilters = () =>{
            selectedValue.value = 50;
            name_search.value = "";
            account_number_search.value = "";
            member_number_search.value = "";
            prodSearchComponentKey.value += 1;
            productSearchID.value = "";
            searchDeposits();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchDeposits();
        })
        return{
            title,idField, searchDeposits, addButtonLabel, searchFilters, resetFilters, tableColumns, depositsList,showTotals,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewDeposit,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createDeposit,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeDeposit, removeDeposits,
            addingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange,importDeposits
        }
    }
}
</script>