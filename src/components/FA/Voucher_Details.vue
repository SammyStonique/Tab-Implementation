<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="createPaymentVoucher" @handleReset="handleReset"> 
                    <template v-slot:additional-content>                  
                        <div class="px-3 min-h-[220px]">
                            <DynamicTable :key="tableKey" :columns="receiptColumns" :rows="receiptRows" :showActions="showActions" :idField="idField" :rightsModule="rightsModule" :actions="actions" @action-click="deletePaymentLine"/>
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
    name: 'Voucher_Details',
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
        const rightsModule = ref('Accounts');
        const tableKey = ref(0);
        const mainComponentKey = ref(0);
        const tntComponentKey = ref(0);
        const ledComponentKey = ref(0);
        const vouComponentKey = ref(0);
        const propComponentKey = ref(0);
        const receipt_totals = ref(0);
        const receiptTotals = ref(0);
        const receipt_memo = ref('');
        const itemsArray = ref([]);
        const prepModalVisible = ref(false);
        const title = ref('Add Prepayment');
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
        const flex_basis_additional = ref('');
        const flex_basis_percentage_additional = ref('');
        const pettyCashID = ref('');
        const pettyArray = computed(() => store.state.Petty_Cash.cashArr);
        const availableAmount = ref(0);
        const categoryArray = computed(() => store.state.Petty_Cash_Item_Categories.categoryArr);
        const receiptRows = computed(() => {
            return store.state.Petty_Cash_Item_Categories.paymentItemsArray;
        });
        
        const receiptColumns = ref([
            {label: "Item Category", key:"category_name", type: "text", editable: false},
            {label: "Sub Category", key:"sub_category", type: "dropdown", editable: false},
            {label: "Payment Description", key:"description", type: "text", editable: true, minWidth:"700px", maxWidth:"700px"},
            {label: "Total", key: "total_amount", type: "text", editable: true},
        ]);

        const actions = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Payment Line', rightName: "Adding Payment Voucher"},
        ])

        const deletePaymentLine = (rowIndex, action, row) =>{
            store.dispatch('Petty_Cash_Item_Categories/removeVoucherLine', rowIndex);
        }
        const fetchCategories = async() =>{
            await store.dispatch('Petty_Cash_Item_Categories/fetchItemCategories', {company:companyID.value})
        };
        const fetchPettyCashes = async() =>{
            await store.dispatch('Petty_Cash/fetchPettyCashes', {company:companyID.value})
        };
        const handleSelectedPettyCash = async(option) =>{
            await store.dispatch('Petty_Cash/handleSelectedPettyCash', option)
            pettyCashID.value = store.state.Petty_Cash.cashID;
            availableAmount.value = store.state.Petty_Cash.availAmount;
        };
        const clearSelectedPettyCash = async() =>{
            await store.dispatch('Petty_Cash/updateState', {cashID: '', availAmount: 0});
            pettyCashID.value = ""
        }
        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Petty_Cash_Item_Categories/handleSelectedCategory', option)
            vouComponentKey.value += 1;
        };
        const checkMaxAmount = (value) =>{
            if(availableAmount.value < value){
                receipt_totals.value = 0;
                receipt_totals.value = 0;
                formFields.value[5].value = 0;
                toast.error(`Max Available Petty Cash Amount is ${availableAmount.value}`);
            }
        }
        const formFields = ref([]);
        const updateFormFields = () =>{
            formFields.value = [
                { type: 'text', name: 'paid_to',label: "Issued To", value: '', required: true,},
                {
                    type:'search-dropdown', label:"Petty Cash", value: pettyCashID.value, componentKey: ledComponentKey,
                    selectOptions: pettyArray, optionSelected: handleSelectedPettyCash, required: true,
                    searchPlaceholder: 'Select Petty Cash...', dropdownWidth: '400px', updateValue: "",
                    fetchData: fetchPettyCashes(), clearSearch: clearSelectedPettyCash()  
                },
                { type: 'date', name: 'issue_date',label: "Recording Date", value: formatDate(current_date), required: true, maxDate: formatDate(current_date) },
                { type: 'dropdown', name: 'payment_method',label: "Payment Method", value: '', placeholder: "", required: true, options: [{ text: 'Cash', value: 'Cash' }, { text: 'Mpesa', value: 'Mpesa' },{ text: 'Bank Deposit', value: 'Bank Deposit' }, { text: 'Cheque', value: 'Cheque' },{ text: 'Check-off', value: 'Check-off' }, { text: 'RTGS', value: 'RTGS' },{ text: 'EFT', value: 'EFT' }, { text: 'Not Applicable', value: 'Not Applicable' }] },
                { type: 'text', name: 'reference_no',label: "Reference No", value: '', required: true,},
                { type: 'number', name: 'total_amount',label: "Amount", value: receipt_totals.value || 0, required: true, method: checkMaxAmount},
                {
                    type:'search-dropdown', label:"Select Category", value: "", componentKey: vouComponentKey,
                    selectOptions: categoryArray, optionSelected: handleSelectedCategory, required: true,
                    fetchData: fetchCategories(),searchPlaceholder: 'Select Category...', dropdownWidth: '400px', updateValue: "",  
                },
                {type:'text-area', label:"Memo", value: receipt_memo.value, textarea_rows: '3', textarea_cols: '56', required: true},
                
            ]
        };
        watch([receipt_memo, receipt_totals], () => {
            if (receipt_memo.value.length) {
                formFields.value[7].value = receipt_memo.value;
            }else if(receipt_totals.value == 0){
                receipt_memo.value = "";
            }
        }, { immediate: true })
        const handleReset = () =>{
            store.dispatch('Petty_Cash_Item_Categories/updateState', {paymentItemsArray: []})
            store.dispatch('Petty_Cash/updateState', {cashID: '', availAmount: 0})
            mainComponentKey.value += 1;
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].type == 'number'){
                    formFields.value[i].value = 0;
                }else{
                    formFields.value[i].value = '';
                }
                
            }
            pettyCashID.value = '';
            propComponentKey.value += 1;
            ledComponentKey.value += 1;
            vouComponentKey.value += 1;
            receipt_totals.value = 0;
            receiptTotals.value = 0;
            availableAmount.value = 0;
            receipt_memo.value = "";
            formFields.value[2].value = formatDate(current_date);
        }
        watch([pettyCashID], () => {
            if (pettyCashID.value !="") {
                formFields.value[1].value = pettyCashID.value;
            }   
        }, { immediate: true })

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createPaymentVoucher = async() =>{
            showLoader();
            if(formFields.value[7].value == ""){
                let rcptMemo = ""
                for(let i=0; i<receiptRows.value.length; i++){
                    if(receiptRows.value[i].payment_allocation > 0){
                        rcptMemo = rcptMemo + receiptRows.value[i].description + ', ';
                    }
                }
                formFields.value[7].value = rcptMemo;
            }
            receiptTotals.value = 0;
            for(let i=0; i< receiptRows.value.length; i++){
                receiptTotals.value += Number(receiptRows.value[i].total_amount);
            }
            let formData = {
                company: companyID.value,
                paid_to: formFields.value[0].value,
                petty_cash: pettyCashID.value,
                petty_cash_id: pettyCashID.value,
                voucher_no: "-",
                approval_status: "Pending",
                description: formFields.value[7].value,
                date: formFields.value[2].value,
                payment_method: formFields.value[3].value,
                reference_no: formFields.value[4].value,
                amount: receiptTotals.value,
                items_array: receiptRows.value,
                journal: null,
                journal_id: null,
                user: userID.value
            }
            
            errors.value = [];
            for(let i=0; i < (formFields.value.length); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(pettyCashID.value == ''){
                errors.value.push('Error');
            }

            if(Number(receiptTotals.value) <= 0 || (formFields.value[5].value != receiptTotals.value)){
                toast.error('Invalid Voucher Amount');
                hideLoader();
            }
            else{
                if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();                 
                }else{            
                    try {
                        const response = await store.dispatch('Petty_Cash_Vouchers/createPettyCashVoucher', formData);
                        if (response && response.status === 201) {
                            hideLoader();
                            toast.success('Voucher created successfully!');
                            handleReset();
                            mainComponentKey.value += 1;
                            propComponentKey.value += 1;
                            ledComponentKey.value += 1;
                            tntComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while creating the Voucher.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to create Voucher: ' + error.message);
                    } finally {
                        hideLoader();
                    }              
                }
            }
            
        }

        const autoPopulatePaymentAlloc = (row) =>{
            if(row.allocation_status == false){
                row.payment_allocation = row.due_amount;
                row.bal_after_alloc = 0;
                receipt_totals.value += Number(row.payment_allocation);
                row.allocation_status = true;
            }                 
        };
        const allocateInputAmount = (amount) =>{
            receipt_totals.value += amount;
        };

        watch([receipt_totals], () => {
            if (receipt_totals.value) {
                formFields.value[6].value = receipt_totals.value;
            } 
        }, { immediate: true });

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }

        onBeforeMount(()=>{ 
            updateFormFields();
            ledComponentKey.value += 1;
            propComponentKey.value += 1;
            tntComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            
        })

        return{
            formFields, flex_basis, flex_basis_percentage, displayButtons, createPaymentVoucher, mainComponentKey,
            handleReset, loader, showLoader, hideLoader, tableKey, receiptColumns, receiptRows, showActions, idField,
            autoPopulatePaymentAlloc, allocateInputAmount,actions,rightsModule,
            title, modal_loader, modal_left, modal_top, modal_width, prepModalVisible, showModalLoader, hideModalLoader,
            flex_basis_additional, flex_basis_percentage_additional, deletePaymentLine, 
        }
    }
})
</script>