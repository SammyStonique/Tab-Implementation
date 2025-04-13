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
        @importData="importAccounts"
        :addingRight="addingRight"
        :removingRight="removingRight"
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
        :selectedValue="selectedValue"
        @selectSearchQuantity="selectSearchQuantity"
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
    name: 'Share_Accounts',
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
        const title = ref('Share Account Details');
        const addButtonLabel = ref('New Share Account');
        const addingRight = ref('Adding Share Accounts');
        const removingRight = ref('Deleting Share Accounts');
        const rightsModule = ref('MMS');
        const idField = 'share_account_id';
        const depModalVisible = ref(false);
        const selectedIds = ref([]);
        const accountsList = ref([]);
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
        const isEditing = computed(()=> store.state.Share_Accounts.isEditing)
        const selectedAccount = computed(()=> store.state.Share_Accounts.selectedAccount);
        const selectedMember = computed(()=> store.state.Share_Accounts.selectedMember);
        const selectedProduct = computed(()=> store.state.Share_Accounts.selectedProduct);
        const memberArray = computed(() => store.state.Members.memberArr);
        const productArray = computed(() => store.state.Shares_Products.productArr);
        const productAmount = ref(0);
        const computedProdAmnt = computed(() =>  productAmount);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Acc No", key: "account_number", type: "text", editable: false},
            {label: "Member No", key: "member_number", type: "text", editable: false},
            {label: "Member Name", key: "member_name", type: "text", editable: false},
            {label: "Share Product", key: "share_product", type: "text", editable: false},
            {label: "Price", key: "share_price", type: "text", editable: false},
            {label: "Quantity", key: "share_quantity", type: "text", editable: false},
            {label: "Amount", key: "amount", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Account', rightName: 'Editing Share Accounts'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Account', rightName: 'Deleting Share Accounts'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const memberID = ref('');
        const productID = ref('');
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
                clearSearch: clearSelectedSearchProduct
            },
        ]);
        const importAccounts = () =>{
            store.commit('pageTab/ADD_PAGE', {'MMS':'Import_Share_Accounts'})
            store.state.pageTab.mmsActiveTab = 'Import_Share_Accounts';
        }
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
            await store.dispatch('Shares_Products/handleSelectedProduct', option)
            productID.value = store.state.Shares_Products.productID;
            productAmount.value = store.state.Shares_Products.productAmount;
            if(selectedAccount.value){
                selectedAccount.value.share_product.shares_product_id = productID.value;
                productValue.value = productID.value
            }
        };
        const clearSelectedProduct = async() =>{
            await store.dispatch('Shares_Products/updateState', {productID: ''});
            productID.value = store.state.Shares_Products.productID;
        };
        const formFields = ref([]);
        const memberValue = computed(() => {
            return (selectedAccount.value && selectedAccount.value.member && !memberID.value) ? selectedAccount.value.member.member_id : memberID.value;
        });
        const productValue = computed(() => {
            return (selectedAccount.value && selectedAccount.value.share_product && !productID.value) ? selectedAccount.value.share_product.shares_product_id : productID.value;
        });
        const calculateTotalShares = (value) =>{
            productAmount.value = parseFloat(value) * parseFloat(formFields.value[4].value)     
        }
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Member", value: memberValue.value, componentKey: memComponentKey,
                    selectOptions: memberArray, optionSelected: handleSelectedMember, required: true,
                    searchPlaceholder: 'Select Member...', dropdownWidth: '500px', updateValue: selectedMember.value,
                    fetchData: store.dispatch('Members/fetchMembers', {company:companyID.value}), clearSearch: clearSelectedMember
                },
                {  
                    type:'search-dropdown', label:"Share Product", value: productValue.value, componentKey: prodComponentKey,
                    selectOptions: productArray, optionSelected: handleSelectedProduct, required: true,
                    searchPlaceholder: 'Select Share Product...', dropdownWidth: '500px', updateValue: selectedProduct.value,
                    fetchData: store.dispatch('Shares_Products/fetchSharesProducts', {company:companyID.value}), clearSearch: clearSelectedProduct
                },
                { type: 'text', name: 'account_number',label: "Account Number", value: selectedAccount.value?.account_number || '', required: true },
                { type: 'date', name: 'date',label: "Date Opened", value: selectedAccount.value?.date || '', required: true },
                { type: 'text', name: 'share_price',label: "Share Price", value: selectedAccount.value?.share_price || '0', required: true },
                { type: 'text', name: 'share_quantity',label: "Share Quantity", value: selectedAccount.value?.share_quantity || '0', required:true , method: calculateTotalShares },
                { type: 'text', name: 'amount',label: "Amount", value: selectedAccount.value?.amount || computedProdAmnt.value, required: false, disabled: true },
                {required: false}
            ];
        };
        watch([selectedAccount, selectedMember, selectedProduct], () => {
            if (selectedAccount.value && selectedMember.value && selectedProduct.value) {
                memComponentKey.value += 1;
                prodComponentKey.value += 1;
                updateFormFields();
            }
            
        }, { immediate: true });
        const addNewAccount = () =>{
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Share_Accounts/updateState",{selectedAccount:null, selectedMember:null, selectedProduct:null,isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const accountID = row[idField];
                let formData = {
                    company: companyID.value,
                    share_account: accountID
                }
                await store.dispatch('Share_Accounts/fetchShareAccount',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/3';
                    flex_basis_percentage.value = '33.333';
                })
                
            }else if(action == 'delete'){
                const accountID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    share_account: accountID
                }
                await store.dispatch('Share_Accounts/deleteShareAccount',formData).
                then(()=>{
                    searchAccounts();
                })
            }
        } 
        const handleReset = () =>{
            store.dispatch("Share_Accounts/updateState",{selectedAccount:null, selectedMember:null, selectedProduct:null,isEditing:false})
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].name == "share_price" || formFields.value[i].name == "share_quantity" || formFields.value[i].name == "amount"){
                    formFields.value[i].value = '0';
                }else{
                    formFields.value[i].value = '';
                }
                
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
                share_price: formFields.value[4].value,
                share_quantity: formFields.value[5].value,
                member: memberID.value,
                member_id: memberID.value,
                share_product: productID.value,
                share_product_id: productID.value,
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
                    const response = await store.dispatch('Share_Accounts/createShareAccount', formData);
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
                share_price: formFields.value[4].value,
                share_quantity: formFields.value[5].value,
                member: memberValue.value,
                member_id: memberValue.value,
                share_product: productValue.value,
                share_product_id: productValue.value,
                company: companyID.value,
                share_account: selectedAccount.value.share_account_id
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
                    const response = await store.dispatch('Share_Accounts/updateShareAccount', formData);
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
                    share_account: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Share_Accounts/deleteShareAccount',formData)
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
                    share_account: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Share_Accounts/deleteShareAccount',formData)
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
                product: productSearchID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/share-accounts-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                accountsList.value = response.data.results;
                store.commit('Share_Accounts/LIST_ACCOUNTS', accountsList.value)
                depResults.value = response.data;
                depArrLen.value = accountsList.value.length;
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
            searchAccounts(selectedValue.value);
        };
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
            selectedValue.value = 50;
            name_search.value = "";
            account_number_search.value = "";
            member_number_search.value = "";
            prodSearchComponentKey.value += 1;
            productSearchID.value = "";
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
            addingRight,removingRight,rightsModule, closeModal,handleSelectionChange,selectSearchQuantity,selectedValue,importAccounts
        }
    }
}
</script>