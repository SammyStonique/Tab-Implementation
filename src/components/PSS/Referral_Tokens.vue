<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewToken"
        :searchFilters="searchFilters"
        @searchPage="searchTokens"
        @resetFilters="resetFilters"
        @removeItem="removeToken"
        @removeSelectedItems="removeTokens"
        @importData="importTransfers"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="tokensList"
        :actions="actions"
        :showTotals="showTotals"
        :idField="idField"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :groupingKey=true
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
            :displayButtons="displayButtons" @handleSubmit="createToken" @handleReset="handleReset"
        />
    </MovableModal>
    <MovableModal v-model:visible="transModalVisible" :title="transTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeTransModal">
        <DynamicForm 
            :fields="formFields1" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="approveToken" @handleReset="handleReset"
        />
    </MovableModal>
    <MovableModal v-model:visible="refModalVisible" :title="refTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="ref_modal_loader" @showLoader="showRefModalLoader" @hideLoader="hideRefModalLoader" @closeModal="closeRefModal">
        <DynamicForm 
            :fields="refFormFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="disburseClientToken" @handleReset="handleRefReset"
        />
    </MovableModal>
    <MovableModal v-model:visible="appModalVisible" :title="appTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="app_modal_loader" @showLoader="showSettleModalLoader" @hideLoader="hideSettleModalLoader" @closeModal="closeModal1">
        <DynamicForm 
            :fields="formFields2" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="settleSale" @handleReset="handleReset1"
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
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";
import Swal from 'sweetalert2';

export default{
    name: 'Referral_Tokens',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('');
        const modal_loader = ref('none');
        const trans_modal_loader = ref('none');
        const ref_modal_loader = ref('none');
        const app_modal_loader = ref('none');
        const memComponentKey = ref(0);
        const prodComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const saleComponentKey = ref(0);
        const title = ref('Referral Token Details');
        const addButtonLabel = ref('New Token');
        const addingRight = ref('Adding Referral Tokens');
        const removingRight = ref('Deleting Referral Tokens');
        const rightsModule = ref('PSS');
        const idField = 'referral_token_id';
        const depModalVisible = ref(false);
        const appModalVisible = ref(false);
        const selectedIds = ref([]);
        const tokensList = ref([]);
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
        const transTitle = ref('Approve/Reject Token');
        const refTitle = ref('Disburse Token Amount');
        const appTitle = ref('Settle Client Sale');
        const transModalVisible = ref(false);
        const refModalVisible = ref(false);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('500px');
        const modal_width = ref('30vw');
        const accArray = computed(() => store.state.Asset_Clients.customerArr);
        const saleArray = computed(() => store.state.Asset_Sales.saleArr);
        const cashbookArr = computed(() => store.state.Ledgers.cashbookLedgerArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date"},
            {label: "Token#", key: "token_code"},
            {label: "Client#", key: "client_code"},
            {label: "Client", key: "client_name"},
            {label: "Sale#", key: "sale_code"},
            {label: "Sale Client", key: "sale_client"},
            {label: "Done By", key: "done_by"},
            {label: "Status", key: "approval_status", textColor: "textColor"},
            {label: "Approved By", key: "approved_by"},
            {label: "Redeemed", key: "redeemed"},
            {label: "Txn#", key: "journal_no"},
            
        ])
        const showTotals = ref(false);
        const actions = ref([
            {name: 'approve/reject', icon: 'fa fa-check-circle', title: 'Approve/Reject Token', rightName: 'Approving Referral Tokens'},
            {name: 'redeem', icon: 'fa fa-sign-in', title: 'Redeem Token', rightName: 'Adding Referral Tokens'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Token', rightName: 'Deleting Referral Tokens'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const tokenID = ref('');
        const customerID = ref('');
        const saleID = ref('');
        const cashbookID = ref('');
        const settledSaleID = ref('');
        const sale_code_search = ref('');
        const client_code_search = ref('');
        const redeemed_search = ref("");
        const client_name_search = ref("");
        const approval_status_search = ref("");
        const from_date_search = ref("");
        const to_date_search = ref("");
        const searchFilters = ref([
            {type:'text', placeholder:"Sale Code...", value: sale_code_search, width:32,},
            {type:'text', placeholder:"Client Code...", value: client_code_search, width:36,},
            {type:'text', placeholder:"Client Name...", value: client_name_search, width:48,},
            {type:'date', title: "From Date", placeholder:"From Date...", value: from_date_search, width:32,},
            {type:'date', title: "To Date",placeholder:"To Date...", value: to_date_search, width:32,},
            {
                type:'dropdown', placeholder:"Status..", value: approval_status_search, width:32,
                options: [{text:'Pending',value:'Pending'},{text:'Approved',value:'Approved'},{text:'Rejected',value:'Rejected'}]
            },
            {
                type:'dropdown', placeholder:"Redeemed Status..", value: redeemed_search, width:36,
                options: [{text:'Yes',value:'Yes'},{text:'No',value:'No'}]
            },
        ]);
        const importTransfers = () =>{
            
        }
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const fetchSaleClients = async() =>{
            await store.dispatch('Asset_Clients/fetchAssetClients', {company:companyID.value})
        };
        const fetchAssetSales = async() =>{
            await store.dispatch('Asset_Sales/fetchAssetSales', {company:companyID.value})
        };
        const fetchClientAssetSales = async(clientID) =>{
            await store.dispatch('Asset_Sales/fetchAssetSales', {company:companyID.value, client: clientID})
        };
        const handleSelectedCustomer = async(option) =>{
            await store.dispatch('Asset_Clients/handleSelectedCustomer', option)
            customerID.value = store.state.Asset_Clients.customerID;
        };
        const clearSelectedCustomer = async() =>{
            await store.dispatch('Asset_Clients/updateState', {customerID: ''});
            customerID.value = store.state.Asset_Clients.customerID;
        };
        const handleSelectedSale = async(option) =>{
            await store.dispatch('Asset_Sales/handleSelectedSale', option)
            saleID.value = store.state.Asset_Sales.saleID;
        };
        const clearSelectedSale = async() =>{
            await store.dispatch('Asset_Sales/updateState', {saleID: ''});
            saleID.value = store.state.Asset_Sales.saleID;
        };
        const handleSelectedClientSale = async(option) =>{
            await store.dispatch('Asset_Sales/handleSelectedSale', option)
            settledSaleID.value = store.state.Asset_Sales.saleID;
        };
        const clearSelectedClientSale = async() =>{
            await store.dispatch('Asset_Sales/updateState', {saleID: ''});
            settledSaleID.value = store.state.Asset_Sales.saleID;
        };
        const formFields = ref([]);
        const clientValue = computed(() => {
            return customerID.value;
        });
        const saleValue = computed(() => {
            return saleID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Client", value: clientValue.value, componentKey: memComponentKey,
                    selectOptions: accArray, optionSelected: handleSelectedCustomer, required: true,
                    searchPlaceholder: 'Select Client ...', dropdownWidth: '500px',
                    clearSearch: clearSelectedCustomer
                },
                {  
                    type:'search-dropdown', label:"Sale", value: saleValue.value, componentKey: prodComponentKey,
                    selectOptions: saleArray, optionSelected: handleSelectedSale, required: true,
                    searchPlaceholder: 'Select Sale...', dropdownWidth: '500px',
                    clearSearch: clearSelectedSale
                },              
                { type: 'date', name: 'date',label: "Date", value: '', required: true },
                { type: 'dropdown', name: 'token_mode',label: "Mode", value: '', placeholder: "", required: true, options: [{ text: 'Cash Payable', value: 'Cash Payable' }, { text: 'Sale Settlement', value: 'Sale Settlement' }] },
                { type: 'number', name: 'amount',label: "Amount", value: 0, required: true,},
            ];
        };

        const formFields1 = ref([]);
        const updateFormFields1 = () => {
            formFields1.value = [
                { type: 'dropdown', name: 'approval_status',label: "Status", value: '', placeholder: "", required: true, options: [{ text: 'Approve', value: 'Approved' }, { text: 'Reject', value: 'Rejected' }] },
            ]
        };

        const addNewToken = async() =>{
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'delete'){
                const refTokenID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    referral_token: refTokenID
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to delete Token?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes Delete Token!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                }).then((result) => {
                    if (result.value) {
                    axios.post(`api/v1/delete-sale-referral-token/`,formData)
                    .then((response)=>{
                        if(response.data.msg == "Success"){
                            Swal.fire("Poof! Token removed succesfully!", {
                                icon: "success",
                            }); 
                            searchTokens();
                        }else{
                        Swal.fire({
                            title: "Error Deleting Token",
                            icon: "warning",
                        });
                        }                   
                    })
                    .catch((error)=>{
                        console.log(error.message);
                        Swal.fire({
                        title: error.message,
                        icon: "warning",
                        });
                    })
                    }else{
                    Swal.fire(`Token has not been deleted!`);
                    }
                })
            }else if(action == 'approve/reject'){
                const approvalStatus = row['approval_status']
                if(approvalStatus == 'Pending'){
                    updateFormFields1();
                    tokenID.value = row['referral_token_id'];
                    transModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                }else{
                    toast.error(`Token Already ${approvalStatus}`)
                }
            }else if( action == 'redeem'){
                const approvalStatus = row['approval_status']
                const redeemedStatus = row['redeemed']
                const tokenMode = row['token_mode']
                if(redeemedStatus == 'Yes'){
                    toast.error(`Token Already Redeemed`);
                    return;
                }
                if(approvalStatus == 'Approved'){
                    if(tokenMode == "Cash Payable"){
                        updateFormFields();
                        tokenID.value = row['referral_token_id'];
                        refModalVisible.value = true;
                        flex_basis.value = '1/2';
                        flex_basis_percentage.value = '50';
                    }else{
                        fetchClientAssetSales(row['asset_sale_client_id'])
                        updateFormFields1();
                        tokenID.value = row['referral_token_id'];
                        appModalVisible.value = true;
                        flex_basis.value = '1/2';
                        flex_basis_percentage.value = '50';
                    }
                }else{
                    toast.error(`Cannot Redeem ${approvalStatus} Token`);
                }
            }
        } 
        const handleReset = async() =>{

            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            customerID.value = "";
            saleID.value = "";
            prodComponentKey.value += 1;
            memComponentKey.value += 1;

        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createToken = async() =>{
            showModalLoader();
            let formData = {
                done_by: '-',
                token_code: '-',
                token_mode: formFields.value[3].value,
                amount: formFields.value[4].value,
                date: formFields.value[2].value,
                approval_status: "Pending",
                redeemed: "No",
                client: customerID.value,
                client_id: customerID.value,
                asset_sale: saleID.value,
                asset_sale_id: saleID.value,
                journal: null,
                journal_id: null,
                approved_by: null,
                approved_by_id: null,
                user: userID.value,
                company: companyID.value
            };

            if(clientValue.value == '' || saleValue.value == ''){
                toast.error('Required Fields Missing!.');
                hideModalLoader();
            }
            else{
                try {
                    const response = await axios.post(`api/v1/create-sale-referral-token/`, formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Success!');
                        handleReset();
                        memComponentKey.value += 1;
                        prodComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the Token.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Token: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchTokens();
                }
            }

        }

        const removeToken = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    referral_token: selectedIds.value,
                }
                try{
                    const response = await axios.post(`api/v1/delete-sale-referral-token/`,formData)
                    if(response && response.status == 200){
                        toast.success("Sucess");
                        searchTokens();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Token: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Token") 
            }else{
                toast.error("Please Select A Token To Remove")
            }
        }
        const removeTokens = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    referral_token: selectedIds.value,
                }
                try{
                    const response = await axios.post(`api/v1/delete-sale-referral-token/`,formData)
                    if(response && response.status == 200){
                        toast.success("Sucess");
                        searchTokens();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Token(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Token To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchTokens = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                sale_code: sale_code_search.value,
                client_code: client_code_search.value,
                client_name: client_name_search.value,
                approval_status: approval_status_search.value,
                redeemed: redeemed_search.value,
                from_date: from_date_search.value,
                to_date: to_date_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            }
            axios
            .post(`api/v1/sale-referral-tokens-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                tokensList.value = response.data.results;
                depResults.value = response.data;
                depArrLen.value = tokensList.value.length;
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
            searchTokens(selectedValue.value);
        };
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTokens();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTokens();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTokens();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTokens();
        }
        const resetFilters = () =>{
            selectedValue.value = 50;
            client_name_search.value = "";
            approval_status_search.value = "";
            sale_code_search.value = "";
            client_code_search.value = "";
            redeemed_search.value = "";
            from_date_search.value = "";
            to_date_search.value = "";
            searchTokens();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            tokenID.value = null;
            hideTransModalLoader();
        };
        const approveToken = async() =>{
            showTransModalLoader();
            let formData = {
                referral_token: tokenID.value,
                approval_status: formFields1.value[0].value,
                user: userID.value,
                company: companyID.value
            }

            axios.post(`api/v1/approve-sale-referral-token/`,formData)
            .then((response)=>{
            if(response.data.msg == "Success"){
                hideTransModalLoader();
                closeTransModal();
                toast.success("Success")
                searchTokens();
            }else{
                toast.error("Error");
                hideTransModalLoader();
            }                   
            })
            .catch((error)=>{
                toast.error(error.message);
                hideTransModalLoader();
            })
        };
        const fetchLedgers = async() =>{
            await store.dispatch('Ledgers/fetchCashbookLedgers', {company:companyID.value, ledger_type: 'Cashbook'})
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            cashbookID.value = store.state.Ledgers.ledgerID;
        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            cashbookID.value = ""
        };
        const refFormFields = ref([
            {  
                type:'search-dropdown', label:"Cashbook", value: cashbookID.value, componentKey: ledComponentKey,
                selectOptions: cashbookArr, optionSelected: handleSelectedLedger, required: true,
                searchPlaceholder: 'Select Cashbook...', dropdownWidth: '550px', updateValue: "",
                clearSearch: clearSelectedLedger
            },
            { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
            { type: 'date', name: 'banking_date',label: "Banking Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
            { type: 'dropdown', name: 'payment_method',label: "Payment Method", value: '', placeholder: "", required: true, options: [{ text: 'Cash', value: 'Cash' }, { text: 'Mpesa', value: 'Mpesa' },{ text: 'Bank Deposit', value: 'Bank Deposit' }, { text: 'Cheque', value: 'Cheque' },{ text: 'Check-off', value: 'Check-off' }, { text: 'RTGS', value: 'RTGS' },{ text: 'EFT', value: 'EFT' }, { text: 'Not Applicable', value: 'Not Applicable' }] },
            { type: 'text', name: 'reference_no',label: "Reference No", value: '', required: true,},
        ]);
        const handleRefReset = () =>{
            for(let i=0; i < refFormFields.value.length; i++){
                refFormFields.value[i].value = '';
            }
            tokenID.value = null;
            cashbookID.value = null;
            ledComponentKey.value +=1;
        }
        const showRefModalLoader = () =>{
            ref_modal_loader.value = "block";
        }
        const hideRefModalLoader = () =>{
            ref_modal_loader.value = "none";
        }
        const disburseClientToken = async() =>{
            showRefModalLoader();
            let formData = {
                cashbook: cashbookID.value,
                issue_date: refFormFields.value[1].value,
                referral_token: tokenID.value,
                banking_date: refFormFields.value[2].value,
                payment_method: refFormFields.value[3].value,
                reference_no: refFormFields.value[4].value,
                user: userID.value,
                company: companyID.value
            }
            axios.post(`api/v1/redeem-sale-referral-token/`,formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success")
                    closeRefModal();
                    searchTokens();
                }else if(response.data.msg == "Exists"){
                    toast.error("Duplicate Disbursement Reference No")
                }else{
                    toast.error("Error Disbursing Token")
                }                   
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message)
                hideRefModalLoader();
            })
            .finally(()=>{
                hideRefModalLoader();
            })
        
        };
        const closeRefModal = () =>{
            refModalVisible.value = false;
            handleRefReset();
            hideRefModalLoader();
        };
        const formFields2 = ref([
            { type: 'date', name: 'issue_date',label: "Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
            {  
                type:'search-dropdown', label:"Sale", value: settledSaleID.value, componentKey: saleComponentKey,
                selectOptions: saleArray, optionSelected: handleSelectedClientSale, required: false,
                searchPlaceholder: 'Select Sale...', dropdownWidth: '500px',
                clearSearch: clearSelectedClientSale
            },
        ]);
        const handleReset1 = () =>{
            formFields2.value[0].value = formatDate(current_date);
            tokenID.value = null;
            settledSaleID.value = null;
            saleComponentKey.value +=1;
        }
        const showSettleModalLoader = () =>{
            app_modal_loader.value = "block";
        }
        const hideSettleModalLoader = () =>{
            app_modal_loader.value = "none";
        }
        const settleSale = async() =>{
            showSettleModalLoader();
            let formData = {
                cashbook: null,
                issue_date: formFields2.value[0].value,
                referral_token: tokenID.value,
                banking_date: null,
                payment_method: null,
                reference_no: null,
                asset_sale: settledSaleID.value,
                user: userID.value,
                company: companyID.value
            }
            axios.post(`api/v1/redeem-sale-referral-token/`,formData)
            .then((response)=>{
                if(response.data.msg == "Success"){
                    toast.success("Success")
                    closeModal1();
                    searchTokens();
                }else if(response.data.msg == "Exists"){
                    toast.error("Duplicate Disbursement Reference No")
                }else{
                    toast.error("Error Disbursing Token")
                }                   
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message)
                hideSettleModalLoader();
            })
            .finally(()=>{
                hideSettleModalLoader();
            })
        
        };
        const closeModal1 = () =>{
            appModalVisible.value = false;
            handleReset1();
            hideSettleModalLoader();
        };
        onMounted(()=>{
            searchTokens();
            fetchSaleClients();
            fetchAssetSales();
            fetchAllLedgers();
            fetchLedgers();
        })
        return{
            title,idField, searchTokens, addButtonLabel, searchFilters, resetFilters, tableColumns, tokensList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewToken,showTotals,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, createToken,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeToken, removeTokens,
            addingRight,removingRight,rightsModule, closeModal,selectSearchQuantity,selectedValue,handleSelectionChange,importTransfers,
            formFields1, transTitle, transModalVisible, trans_modal_loader, showTransModalLoader, hideTransModalLoader, closeTransModal, approveToken
            ,refTitle,refFormFields,refModalVisible,ref_modal_loader,handleRefReset,showRefModalLoader,hideRefModalLoader,closeRefModal,
            disburseClientToken,formFields2,appTitle,appModalVisible,app_modal_loader,handleReset1,showSettleModalLoader, hideSettleModalLoader, closeModal1, settleSale
        }
    }
}
</script>