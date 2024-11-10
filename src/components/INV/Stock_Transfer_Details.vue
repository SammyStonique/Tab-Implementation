<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createStockTransfer" @handleReset="handleReset"> 
                    <template v-slot:additional-content>                    
                        <div class="px-3 min-h-[220px]">
                            <DynamicTable :key="tableKey" :columns="itemColumns" :rows="itemRows" :showActions="showActions" :idField="idField" :actions="actions" @action-click="deleteItemLine"/>
                        </div>
                    </template>
                </DynamicForm>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import MovableModal from '@/components/MovableModal.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { useDateFormatter } from '@/composables/DateFormatter';
import DynamicTable from '@/components/DynamicTable.vue';

export default defineComponent({
    name: 'Stock_Transfer_Details',
    components:{
        PageStyleComponent, DynamicForm, DynamicTable, MovableModal
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const { formatDate } = useDateFormatter();
        const current_date = new Date();
        const loader = ref('none');
        const modal_loader = ref('none');
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const outComponentKey = ref(0);
        const itemComponentKey = ref(0);
        const transfer_totals = ref(0);
        const transferTotals = ref(0);
        const transfer_memo = ref('');
        const transferItemsArr = ref([]);
        const title = ref('');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('32vw');
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const displayButtons = ref(true);
        const showActions = ref(true);
        const idField = ref('');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const outletFromID = ref('');
        const outletToID = ref('');
        const itemID = ref('');
        const outletArray = computed(() => store.state.Retail_Outlets.outletArr);
        const itemArray = computed(() => store.state.Items_Catalog.itemsArr);
        const stockType = ref('');
        const itemRows = computed(() => store.state.Items_Catalog.lineItemsArray);
        const itemColumns = ref([
            {label: "Item", key:"inventory_item_name", type: "text", editable: false},
            {label: "Available", key:"available_batch_count", type: "text", editable: false},
            {label: "Qty", key: "quantity", type: "number", editable: true},
            {label: "P. Price", key: "purchase_price", type: "number", editable: false},
            {label: "S. Price", key: "selling_price", type: "number", editable: false},
            {label: "Total", key: "total_amount", type: "text", editable: false},
        ]);

        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Invoice Line'},
        ])

        const deleteItemLine = (rowIndex, action, row) =>{
            store.dispatch('Items_Catalog/removeItemLine', rowIndex);
        }
        const fetchRetailOutlets = async() =>{
            await store.dispatch('Retail_Outlets/fetchOutlets', {company:companyID.value})
        };
        const handleSelectedOutletFrom = async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletFromID.value = store.state.Retail_Outlets.outletID;  
        };
        const clearSelectedOutletFrom = async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletFromID.value = ""
        }
        const handleSelectedOutletTo = async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletToID.value = store.state.Retail_Outlets.outletID;  
        };
        const clearSelectedOutletTo = async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: ''});
            outletToID.value = ""
        };
        const fetchItems = async(stock_type) =>{
            if(outletFromID.value && stock_type){
                await store.dispatch('Items_Catalog/fetchItems', {company_id:companyID.value, outlet:outletFromID.value, stock_type:stock_type})
            }
        };
        const handleSelectedItem = async(option) =>{
            await store.dispatch('Items_Catalog/handleSelectedItem', option)
            itemComponentKey.value += 1;
        };
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'date', name: 'date',label: "Transfer Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                {
                    type:'search-dropdown', label:"Outlet From", value: outletFromID.value, componentKey: outComponentKey,
                    selectOptions: outletArray, optionSelected: handleSelectedOutletFrom, required: true,
                    searchPlaceholder: 'Select Outlet From...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchRetailOutlets(), clearSearch: clearSelectedOutletFrom()  
                },
                {
                    type:'search-dropdown', label:"Outlet To", value: outletToID.value, componentKey: outComponentKey,
                    selectOptions: outletArray, optionSelected: handleSelectedOutletTo, required: true,
                    searchPlaceholder: 'Select Outlet To...', dropdownWidth: '400px', updateValue: "",
                    // fetchData: fetchRetailOutlets(),
                    clearSearch: clearSelectedOutletTo()  
                },
                { type: 'dropdown', name: 'stock_type',label: "Stock Type", value: stockType.value, placeholder: "", required: true, method: fetchItems, options: [{ text: 'Stocked', value: 'Stocked' }, { text: 'Serialized', value: 'Serialized' },{ text: 'Non Stocked', value: 'Non Stocked' }, { text: 'Service', value: 'Service' }] },
                {
                    type:'search-dropdown', label:"Item", value: itemID.value, componentKey: itemComponentKey,
                    selectOptions: itemArray, optionSelected: handleSelectedItem, required: true,
                    searchPlaceholder: 'Select Item...', dropdownWidth: '400px', updateValue: "",
                },
                {type:'text-area', label:"Memo", value: transfer_memo.value, textarea_rows: '2', textarea_cols: '50', required: true},
                
            ]
        };

        watch([outletFromID, stockType], () => {
            if(outletFromID.value && stockType.value != ""){
                fetchItems(stockType.value) 
            }
            
        }, { immediate: true });

        const handleReset = () =>{
            store.dispatch('Items_Catalog/updateState', { lineItemsArray: []})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            outletFromID.value = '';
            outletToID.value = '';
            outComponentKey.value += 1;
            transfer_totals.value = 0;
            transferTotals.value = 0;
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createStockTransfer = async() =>{
            showLoader();
            transferItemsArr.value = [];
            transferTotals.value = 0;
            transfer_totals.value = 0;

            for(let i=0; i<itemRows.value.length; i++){
                transfer_totals.value += itemRows.value[i].quantity;
                let transItem ={
                    "inventory_item": itemRows.value[i].inventory_item_id,
                    "quantity": itemRows.value[i].quantity,
                    "purchase_price": itemRows.value[i].purchase_price,
                    "selling_price": itemRows.value[i].selling_price,
                }
                transferItemsArr.value.push(transItem);
            }

            let formData = {
                company: companyID.value,
                from_location: outletFromID.value,
                to_location: outletToID.value,
                notes: formFields.value[5].value,
                transfer_date: formFields.value[0].value,
                date: formFields.value[0].value,
                items_array: transferItemsArr.value,
                quantity: transfer_totals.value,
                user: userID.value
            }
            console.log("THE FORM DATA IS ",formData)
            errors.value = [];
            if(outletFromID.value == '' || outletToID.value == ''  || formFields.value[5].value == '' || formFields.value[0].value == ''){
                errors.value.push('Error');
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }
            else{
                if(Number(transfer_totals.value) <= 0){
                    toast.error('Invalid Transfer Quantity');
                    hideLoader();
                }else if(outletFromID.value == outletToID.value){
                    toast.error('Cannot Transfer To Same Outlet');
                    hideLoader();
                }
                else{            
                    try {
                        const response = await store.dispatch('Stock_Transfers/createStockTransfer', formData);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Stock Transfer Done successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            outComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating Stock Transfer.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Stock Transfer: ' + error.message);
                    } finally {
                        hideLoader();
                    }              
                }
            }
            
        }

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }

        onBeforeMount(()=>{ 
            store.dispatch('Items_Catalog/updateState', { lineItemsArray: []})
            updateFormFields();
            outComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        })
        onMounted(()=>{

        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createStockTransfer, mainComponentKey,
            handleReset, loader, showLoader, hideLoader, tableKey, itemColumns, itemRows, showActions, actions, deleteItemLine, idField,
            title, modal_loader, modal_left, modal_top, modal_width, showModalLoader, hideModalLoader,
        }
    }
})
</script>