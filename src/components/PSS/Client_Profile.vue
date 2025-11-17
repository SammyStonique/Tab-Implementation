<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[750px]">
                <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Client Details</h1>
                <div class="tabs pt-2">
                    <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                        {{ tab }}
                    </button>
                </div>
                <div class="tab-content mt-3">
                    <div v-if="activeTab == 0">
                        <div class="flex">
                            <div class="basis-1/2 border-left border-gray-400">
                                <h1 class="font-bold mb-10">Client Biodata</h1>
                                <table class="w-full">
                                    <tr class="text-left">
                                        <td class="font-bold ">Client Code:</td>
                                        <td> {{ saleClient.client_code }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Client Name:</td>
                                        <td>{{ saleClient.client_name }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Email:</td>
                                        <td>{{ saleClient.email }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold">Phone No:</td>
                                        <td>{{ saleClient.phone_number }}</td>
                                        
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Address:</td>
                                        <td>{{ saleClient.invoicing_address }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Pin No:</td>
                                        <td>{{ saleClient.pin_no }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Town:</td>
                                        <td>{{ saleClient.town }}</td>
                                        <td></td>
                                        <td></td>
                                        <td class="font-bold pt-3">Country:</td>
                                        <td>{{ saleClient.country }}</td>
                                    </tr>
                                    <tr class="text-left">
                                        <td class="font-bold pt-3">Currency:</td>
                                        <td>{{ saleClient.invoicing_address }}</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    
                                </table>
                            </div>
                        </div>
                    </div>
                    <div v-if="activeTab == 1" class="text-left">                                 
                        <DynamicTable :key="tableKey" :rightsModule="rightsModule" :columns="salesColumns" :rows="computedSaleRows" :idField="idFieldSale" :showTotals="showTotals" :groupingKey=true :actions="actionsSales" @action-click="saleActionClick" />
                    </div> 
                    <div v-show="activeTab == 2">                  
                        <DynamicTable :key="documentTableKey" :rightsModule="rightsModule" :columns="documentColumns" :rows="computedDocumentRows" :idField="idFieldDocument" :actions="actionsDocument" @action-click="documentActionClick"/>
                    </div> 
                    <div v-show="activeTab == 3">                  
                        <DynamicTable :key="tokenTableKey" :rightsModule="rightsModule" :columns="tokenColumns" :rows="computedTokenRows" :idField="idFieldToken" :actions="actionsUtility" @action-click="tokenActionClick" 
                                        :showActions="showActions" :showTotals="hideTotals"/>
                    </div>  
                    <div v-show="activeTab == 4">                  
                        <DynamicTable :key="transferTableKey" :rightsModule="rightsModule" :columns="transferColumns" :rows="computedTransferRows" :idField="idFieldTransfer" :actions="actionsUtility" @action-click="transferActionClick" 
                                        :showActions="showActions" :showTotals="showTotals" :groupingKey=true />
                    </div>  
                     
                </div>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch, reactive } from 'vue';
import PageStyleComponent from '../PageStyleComponent.vue';
import FilterBar from "@/components/FilterBar.vue";
import DynamicTable from '@/components/DynamicTable.vue';
import DynamicForm from '../NewDynamicForm.vue';
import MovableModal from '@/components/MovableModal.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import axios from 'axios';
import PrintJS from 'print-js';
import Swal from 'sweetalert2';

export default defineComponent({
    name: 'Client_Profile',
    components:{
        PageStyleComponent, DynamicTable, MovableModal, DynamicForm,FilterBar
    },
    setup(props,{emit}){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const showAddButton = ref(false);
        const dep_modal_loader = ref('none');
        const util_modal_loader = ref('none');
        const tnt_modal_loader = ref('none');
        const rightsModule = ref('PSS');
        const allowedRights = ref([]);
        const depModalVisible = ref(false);
        const printModalVisible = ref(false);
        const pdfUrl = ref(null);
        const printTitle = ref('Print Sale Statement');
        const displayButtons = ref(true);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const tabs = ref(['Client Details','Sales','Documents','Referral Tokens','Unit Transfers']);
        const activeTab = ref(0);
        const mainComponentKey = ref(0);
        const tableKey = ref(0);
        const tokenTableKey = ref(0);
        const scheduleTableKey = ref(0);
        const statementTableKey = ref(0);
        const documentTableKey = ref(0);
        const idFieldSale = ref('asset_sale_id');
        const idFieldToken = ref('utility_id');
        const idFieldStatement = ref('');
        const clientID = computed(()=> store.state.Asset_Clients.selectedClientID);
        const computedSaleRows = computed(()=> store.state.Asset_Clients.selectedSales);
        const computedTokenRows = computed(()=> store.state.Asset_Clients.selectedTokens);
        const computedTransferRows = computed(()=> store.state.Asset_Clients.selectedTransfers);
        const computedDocumentRows = computed(()=> store.state.Asset_Clients.selectedDocuments);
        const clientDetails = computed(()=> store.state.Asset_Clients.clientDetails);
        const saleClient = computed(()=> store.state.Asset_Clients.saleClient);
        // const saleAsset = computed(()=> store.state.Asset_Clients.saleAsset);
        const salesColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Code", key:"sale_code", type:"link"},
            {label: "Sales Plan", key:"payment_plan"},
            {label: "Currency", key:"client_currency"},
            {label: "Amount", key:"formatted_total_amount", type:"number"},
            {label: "Done By", key:"done_by"},
            {label: "Status", key:"approval_status", textColor: "textColor"},
            {label: "Exempt", key:"exempt_penalty"},
            {label: "Due", key:"sale_due_date"},
            {label: "Status", key:"sale_status", txtColor: "textStatusColor"},
        ]);
        const showTotals = ref(true);
        const hideTotals = ref(false);
        const actionsSales = ref([
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Sale', rightName: 'Viewing Asset Sales'},
        ]);

        const tokenColumns = ref([
            {type: "checkbox"},
            {label: "Date", key: "date"},
            {label: "Token#", key: "token_code"},
            {label: "Sale#", key: "sale_code"},
            {label: "Sale Client", key: "sale_client"},
            {label: "Done By", key: "done_by"},
            {label: "Status", key: "approval_status", textColor: "textColor"},
            {label: "Approved By", key: "approved_by"},
            {label: "Redeemed", key: "redeemed"},
            {label: "Txn#", key: "journal_no"},
        ]);
        const documentColumns = ref([
            {label: "Document Name", key:"document_name", type: "text"},
        ]);
        const actionsDocument = ref([
            {name: 'preview', icon: 'fa fa-paperclip', title: 'View Document',rightName: 'Adding Sale Documents'},
        ]);

        const actionsUtility = ref([

        ]);
        const showActions = ref(false);

        const transferColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "From Unit#", key: "unit_number"},
            {label: "Transfer Asset", key: "transfer_asset"},
            {label: "To Unit#", key: "new_unit_number"},
            {label: "Transfer Amnt", key: "formatted_amount", type:"number"},
            {label: "Done By", key:"done_by"},
            {label: "Status", key:"approval_status", textColor:"textColor"},
            {label: "Approved By", key:"approved_by"},
            {label: "Journal#", key:"journal_no"},
        ]);

        const selectTab = async(index) => {
            showLoader();
            let formData = {
                company: companyID.value,
                asset_sale_client: clientID.value
            }
            let formData1 = {
                company: companyID.value,
                asset_sale_client: clientDetails.value.asset_sale_client_id,
                page_size: "1000"
            }
            if( index == 1){
                activeTab.value = index;
                await store.dispatch('Asset_Clients/fetchClientDetails',formData)
                .then(()=>{
                    hideLoader();
                })
            }
            else if( index == 3){
                activeTab.value = index;
                hideLoader();
            }else{
                activeTab.value = index;
                hideLoader();
            }

        };

        const showLoader = () =>{
            loader.value = "block";
        };
        const hideLoader = () =>{
            loader.value = "none";
        };

        const saleActionClick = async(rowIndex, action, row) =>{
            if(action == 'view'){
                const saleID = row['asset_sale_id'];
                const applicationStatus = row['approval_status']
                if(applicationStatus == 'Approved'){
                    let formData = {
                        company: companyID.value,
                        asset_sale: saleID
                    }
                    await store.dispatch('Asset_Sales/fetchSaleDetails',formData).
                    then(()=>{
                        store.commit('pageTab/ADD_PAGE', {'PSS':'Sale_Profile'})
                        store.state.pageTab.pssActiveTab = 'Sale_Profile';
                    })
                }else{
                    toast.error(`Cannot View ${applicationStatus} Sale`)
                }
            }
        }
        const previewDocument = (formData) =>{
            showLoader();
            axios
            .post("api/v1/preview-asset-sale-document-pdf/", formData, { responseType: 'blob' })
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
        const documentActionClick = async(rowIndex, action, row) =>{
            if( action == 'preview'){
                const docID = row['sale_document_id'];
                let formData = {
                    sale_document: docID,
                    company: companyID.value
                } 
                previewDocument(formData);
                
            }
        }

        const tokenActionClick = async(rowIndex, action, row) =>{
            
        }
        const formFields = ref([
 
        ]);

        const handleDepReset = () =>{

        }
        const showDepModalLoader = () =>{
            dep_modal_loader.value = "block";
        }
        const hideDepModalLoader = () =>{
            dep_modal_loader.value = "none";
        }
        const additionalFields = ref([

        ]);
        

        const isDisabled =(permissionName) =>{
            const permission = allowedRights.value.find(p => p.permission_name === permissionName);
            return permission ? !permission.right_status : true;
        };
        onBeforeMount(()=>{
            clientDetails.value = store.state.Asset_Clients.clientDetails;
        });
        onMounted(()=>{

        });

        return{
            tabs, activeTab, mainComponentKey, salesColumns, tokenColumns, selectTab, loader, showLoader, hideLoader, formFields, additionalFields,showTotals,
            tableKey,tokenTableKey, idFieldSale, idFieldToken, actionsSales, actionsUtility, computedSaleRows, computedTokenRows,computedTransferRows,hideTotals,
            scheduleTableKey, salesColumns, actionsSales,showActions,clientDetails,saleClient, saleActionClick,showAddButton, transferColumns,     
            saleActionClick,tnt_modal_loader, dep_modal_loader, util_modal_loader, depModalVisible, displayButtons,
            documentActionClick,documentColumns,documentTableKey,actionsDocument,computedDocumentRows,printModalVisible,pdfUrl, printTitle,
            modal_top, modal_left, modal_width, showDepModalLoader, hideDepModalLoader, handleDepReset,
            flex_basis, flex_basis_percentage, tokenActionClick,rightsModule,isDisabled,
        }
    }
})
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
}
.tab {
    padding: 2px 20px 2px 20px;
    cursor: pointer;
}

.tab.active {
    border-bottom: 2px solid #000;
}

.tab-content {
    padding: 1px;
}

.table{
    min-height: 15vh;
    max-height: 15vh;
    overflow-y: scroll;
    overflow-x: scroll;
}

</style>