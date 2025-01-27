<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewAccount"
        :searchFilters="searchFilters"
        @searchPage="searchAccounts"
        @resetFilters="resetFilters"
        @removeItem="removeAccount"
        @removeSelectedItems="removeAccounts"
        :addingRight="addingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="accountsList"
        :actions="actions"
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
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader"  @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveAccount" @handleReset="handleReset"
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
    name: 'Saving_Accounts',
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
        const title = ref('Saving Account Details');
        const addButtonLabel = ref('New Saving Account');
        const addingRight = ref('Adding Saving Accounts');
        const rightsModule = ref('MMS');
        const idField = 'saving_account_id';
        const depModalVisible = ref(false);
        const selectedIds = ref([]);
        const accountsList = ref([]);
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
        const isEditing = computed(()=> store.state.Saving_Accounts.isEditing)
        const selectedAccount = computed(()=> store.state.Saving_Accounts.selectedAccount);
        const selectedMember = computed(()=> store.state.Saving_Accounts.selectedMember);
        const selectedProduct = computed(()=> store.state.Saving_Accounts.selectedProduct);
        const memberArray = computed(() => store.state.Members.memberArr);
        const productArray = computed(() => store.state.Savings_Products.productArr);
        const productMinAmount = ref(0);
        const computedProdMinAmnt = computed(() =>  productMinAmount);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Acc No", key: "account_number", type: "text", editable: false},
            {label: "Member No", key: "member_number", type: "text", editable: false},
            {label: "Member Name", key: "member_name", type: "text", editable: false},
            {label: "Saving Product", key: "saving_product", type: "text", editable: false},
            {label: "Amount", key: "amount", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Account', rightName: 'Editing Saving Accounts'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Account', rightName: 'Deleting Saving Accounts'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const memberID = ref('');
        const productID = ref('');
        const account_number_search = ref('');
        const name_search = ref('');
        const member_number_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Account No...", value: account_number_search, width:40,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:36,},
            {type:'text', placeholder:"Search Name...", value: name_search, width:48,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedMember = async(option) =>{
            await store.dispatch('Members/handleSelectedMember', option)
            memberID.value = store.state.Members.memberID;
            if(selectedAccount.value){
                selectedAccount.value.member.member_id = memberID.value;
                memberValue.value = memberID.value
            }
        };
        const clearSelectedMember = async() =>{
            await store.dispatch('Members/updateState', {memberID: ''});
            memberID.value = store.state.Members.memberID;
        };
        const handleSelectedProduct = async(option) =>{
            await store.dispatch('Savings_Products/handleSelectedProduct', option)
            productID.value = store.state.Savings_Products.productID;
            productMinAmount.value = store.state.Savings_Products.productMinAmount;
            if(selectedAccount.value){
                selectedAccount.value.saving_product.savings_product_id = productID.value;
                productValue.value = productID.value
            }
        };
        const clearSelectedProduct = async() =>{
            await store.dispatch('Savings_Products/updateState', {productID: ''});
            productID.value = store.state.Savings_Products.productID;
        };
        const formFields = ref([]);
        const memberValue = computed(() => {
            return (selectedAccount.value && selectedAccount.value.member && !memberID.value) ? selectedAccount.value.member.member_id : memberID.value;
        });
        const productValue = computed(() => {
            return (selectedAccount.value && selectedAccount.value.saving_product && !productID.value) ? selectedAccount.value.saving_product.savings_product_id : productID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Member", value: memberValue.value, componentKey: memComponentKey,
                    selectOptions: memberArray, optionSelected: handleSelectedMember, required: true,
                    searchPlaceholder: 'Select Member...', dropdownWidth: '400px', updateValue: selectedMember.value,
                    fetchData: store.dispatch('Members/fetchMembers', {company:companyID.value}), clearSearch: clearSelectedMember
                },
                {  
                    type:'search-dropdown', label:"Saving Product", value: productValue.value, componentKey: prodComponentKey,
                    selectOptions: productArray, optionSelected: handleSelectedProduct, required: true,
                    searchPlaceholder: 'Select Saving Product...', dropdownWidth: '400px', updateValue: selectedProduct.value,
                    fetchData: store.dispatch('Savings_Products/fetchSavingsProducts', {company:companyID.value}), clearSearch: clearSelectedProduct
                },
                { type: 'text', name: 'account_number',label: "Account Number", value: selectedAccount.value?.account_number || '', required: true },
                { type: 'date', name: 'date',label: "Date Opened", value: selectedAccount.value?.date || '', required: true },
                { type: 'text', name: 'amount',label: "Amount", value: selectedAccount.value?.amount || computedProdMinAmnt.value, required: true },
            ];
        };
        watch([selectedAccount, selectedMember, selectedProduct], () => {
            if (selectedAccount.value && selectedMember.value && selectedProduct.value) {
                memComponentKey.value += 1;
                prodComponentKey.value += 1;
                updateFormFields();
            }
            else{
                updateFormFields();
            }
        }, { immediate: true });
        const addNewAccount = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Saving_Accounts/updateState",{selectedAccount:null, selectedMember:null, selectedProduct:null,isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const accountID = row[idField];
                let formData = {
                    company: companyID.value,
                    saving_account: accountID
                }
                await store.dispatch('Saving_Accounts/fetchSavingAccount',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const accountID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    saving_account: accountID
                }
                await store.dispatch('Saving_Accounts/deleteSavingAccount',formData).
                then(()=>{
                    searchAccounts();
                })
            }
        } 
        const handleReset = () =>{
            store.dispatch("Saving_Accounts/updateState",{selectedAccount:null, selectedMember:null, selectedProduct:null,isEditing:false})
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            memberID.value = "";
            productID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createAccount = async() =>{
            showModalLoader();
            let formData = {
                account_number: formFields.value[2].value,
                date: formFields.value[3].value,
                amount: formFields.value[4].value,
                member: memberID.value,
                member_id: memberID.value,
                saving_product: productID.value,
                saving_product_id: productID.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(memberValue.value == '' || productValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Saving_Accounts/createSavingAccount', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Account created successfully!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Account.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Account: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAccounts();
                }
            }

        }
        const updateAccount = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                account_number: formFields.value[2].value,
                date: formFields.value[3].value,
                amount: formFields.value[4].value,
                member: memberValue.value,
                member_id: memberValue.value,
                saving_product: productValue.value,
                saving_product_id: productValue.value,
                company: companyID.value,
                saving_account: selectedAccount.value.saving_account_id
            }
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type !='search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(memberValue.value == '' || productValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Saving_Accounts/updateSavingAccount', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Account updated successfully!");
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while updating the Account.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Account: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchAccounts();
                }
            }
        }
        const saveAccount = () =>{
            if(isEditing.value == true){
                updateAccount();
            }else{
                createAccount();
            }
        }
        const removeAccount = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    saving_account: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Saving_Accounts/deleteSavingAccount',formData)
                    if(response && response.status == 200){
                        toast.success("Account Removed Succesfully");
                        searchAccounts();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Account: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Account") 
            }else{
                toast.error("Please Select An Account To Remove")
            }
        }
        const removeAccounts = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    saving_account: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Saving_Accounts/deleteSavingAccount',formData)
                    if(response && response.status == 200){
                        toast.success("Account(s) Removed Succesfully");
                        searchAccounts();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Account(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select An Account To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAccounts = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                account_number: account_number_search.value,
                member_name: name_search.value,
                member_number: member_number_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/saving-accounts-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                accountsList.value = response.data.results;
                store.commit('Saving_Accounts/LIST_ACCOUNTS', accountsList.value)
                depResults.value = response.data;
                depArrLen.value = accountsList.value.length;
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
            
            searchAccounts();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAccounts();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAccounts();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAccounts();
        }
        const resetFilters = () =>{
            name_search.value = "";
            account_number_search.value = "";
            member_number_search.value = "";
            searchAccounts();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchAccounts();
        })
        return{
            title,idField, searchAccounts, addButtonLabel, searchFilters, resetFilters, tableColumns, accountsList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewAccount,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveAccount,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeAccount, removeAccounts,
            addingRight,rightsModule, closeModal,handleSelectionChange
        }
    }
}
</script>