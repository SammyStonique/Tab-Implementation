<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewRefund"
            :searchFilters="searchFilters"
            @searchPage="searchRefunds"
            @resetFilters="resetFilters"
            @removeItem="removeRefund"
            @removeSelectedItems="removeRefunds"
            @printList="printList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="refundList"
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
                :displayButtons="displayButtons" @handleSubmit="createRefund" @handleReset="handleReset"
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
    name: 'Petty_Cash_Refunds',
    components:{
        PageComponent, MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'petty_cash_refund_id';
        const addButtonLabel = ref('New Refund');
        const addingRight = ref('Adding Petty Cash Refund');
        const removingRight = ref('Deleting Petty Cash Refunds');
        const rightsModule = ref('Accounts');
        const title = ref('Refund Details');
        const submitButtonLabel = ref('Add');
        const ledComponentKey = ref(0);
        const selectedIds = ref([]);
        const refundList = ref([]);
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
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const ledgerID = ref('');
        const voucherID = ref('');
        const isEditing = computed(()=> store.state.Petty_Cash_Refunds.isEditing);
        const selectedRefund = computed(()=> store.state.Petty_Cash_Refunds.selectedRefund);
        const selectedVoucher = computed(()=> store.state.Petty_Cash_Refunds.selectedVoucher);
        const voucherArray = computed(() => store.state.Petty_Cash_Vouchers.voucherArr);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Petty Cash", key:"petty_cash"},
            {label: "Voucher#", key:"voucher"},
            {label: "Description", key:"description"},
            {label: "Amount", key: "amount"},
            {label: "Journal", key: "journal"},
        ])
        const actions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Refund', rightName: 'Deleting Petty Cash Refunds'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const from_date_search = ref('');
        const to_date_search = ref('');
        const searchFilters = ref([
            {type:'date', title:"Date From...", value: from_date_search, width:36,},
            {type:'date', title:"Date To...", value: to_date_search, width:36,},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedVoucher = async(option) =>{
            await store.dispatch('Petty_Cash_Vouchers/handleSelectedVoucher', option);
            voucherID.value = store.state.Petty_Cash_Vouchers.voucherID;
        }
        const formFields = ref([]);
        const voucherValue = computed(() => {
           return (selectedRefund.value && selectedRefund.value.voucher && !voucherID.value) ? selectedRefund.value.voucher.petty_cash_voucher_id : voucherID.value;

        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Petty Cash Voucher", value: voucherValue.value, componentKey: ledComponentKey,
                    selectOptions: voucherArray, optionSelected: handleSelectedVoucher, required: true,
                    searchPlaceholder: 'Select Voucher...', dropdownWidth: '500px', updateValue: selectedVoucher.value,
                    fetchData: store.dispatch('Petty_Cash_Vouchers/fetchPettyCashVouchers', {company:companyID.value})
                },
                { type: 'date', name: 'date',label: "Date", value: selectedRefund.value?.date || '', placeholder: "", required: true},
                { type: 'number', name: 'amount',label: "Amount", value: selectedRefund.value?.amount || 0, required: true },
                
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            voucherID.value = '';
            formFields.value[2].value = 0;
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createRefund = async() =>{
            showModalLoader();
            let formData = {
                date: formFields.value[1].value,
                amount: formFields.value[2].value,
                journal: null,
                journal_id: null,
                voucher: voucherID.value,
                voucher_id: voucherID.value,
                company: companyID.value
            }

            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != "search-dropdown"){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(voucherValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Petty_Cash_Refunds/createPettyCashRefund', formData);
                    if (response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Success!');
                        handleReset();
                        ledComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Refund.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Refund: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchRefunds();
                }
            }
        }
        const removeRefund = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    petty_cash_refund: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Petty_Cash_Refunds/deletePettyCashRefund',formData)
                    if(response && response.status == 200){
                        toast.success("Refund Removed Succesfully");
                        searchRefunds();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Refund: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Refund") 
            }else{
                toast.error("Please Select A Refund To Remove")
            }
        }
        const removeRefunds = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    petty_cash_refund: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Petty_Cash_Refunds/deletePettyCashRefund',formData)
                    if(response && response.status == 200){
                        toast.success("Refund(s) Removed Succesfully");
                        searchRefunds();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Refund: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Refund To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchRefunds = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/petty-cash-refunds-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                refundList.value = response.data.results;
                store.commit('Petty_Cash_Refunds/LIST_REFUNDS', refundList.value)
                propResults.value = response.data;
                propArrLen.value = refundList.value.length;
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
            searchRefunds(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            currentPage.value = 1;
            from_date_search.value = "";
            to_date_search.value = "";
            searchRefunds();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchRefunds();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchRefunds();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchRefunds();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchRefunds();
            // scrollToTop();
        }
        const addNewRefund = () =>{
            updateFormFields();
            store.dispatch("Petty_Cash_Refunds/updateState",{selectedRefund:null, selectedVoucher:null, isEditing:false})
            voucherID.value = "";
            ledComponentKey.value += 1;
            propModalVisible.value = true;
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const refundID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    petty_cash_refund: refundID
                }
                await store.dispatch('Petty_Cash_Refunds/deletePettyCashRefund',formData).
                then(()=>{
                    searchRefunds();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
            handleReset();
        }
        onBeforeMount(()=>{
            searchRefunds();
            
        })
        return{
            title, searchRefunds,resetFilters, addButtonLabel, searchFilters, tableColumns, refundList,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewRefund, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, createRefund, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            removeRefund, removeRefunds,addingRight,removingRight,rightsModule,
        }
    }
};
</script>