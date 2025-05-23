<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveSharesProduct" @handleReset="handleReset"> 
                </DynamicForm>
            </div>
            
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch } from 'vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Share_Product_Details',
    components:{
        PageStyleComponent, DynamicForm,
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const whlComponentKey = ref(0);
        const componentKey = ref(0);
        const catComponentKey = ref(0);
        const intComponentKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const displayButtons = ref(true);
        const isEditing = computed(()=> store.state.Shares_Products.isEditing);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const selectedProduct = computed(()=> store.state.Shares_Products.selectedProduct);
        const selectedWithholdingLedger = computed(()=> store.state.Shares_Products.selectedWithholdingLedger);
        const selectedDeclarationLedger = computed(()=> store.state.Shares_Products.selectedDeclarationLedger);
        const selectedCategory = computed(()=> store.state.Shares_Products.selectedCategory);
        const categoryArray = computed(() => store.state.Member_Categories.categoryArr);
        const categoryID = ref('');
        const ledgerArray = computed(() => store.state.Ledgers.ledgerArr);
        const intLedgerID = ref('');
        const whlLedgerID = ref('');

        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Member_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Member_Categories.categoryID;
            if(selectedProduct.value){
                selectedProduct.value.member_category.member_category_id = categoryID.value;
                categoryValue.value = categoryID.value
            }
        };
        const clearSelectedCategory = async() =>{
            await store.dispatch('Member_Categories/updateState', {categoryID: ''});
            categoryID.value = store.state.Member_Categories.categoryID;
        };
        const fetchAllLedgers = async() =>{
            await store.dispatch('Ledgers/fetchLedgers', {company:companyID.value})
        };
        const handleSelectedDeclarationLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            intLedgerID.value = store.state.Ledgers.ledgerID;
            if(selectedProduct.value){
                selectedProduct.value.declaration_posting_account.ledger_id = intLedgerID.value;
                intLedgerValue.value = intLedgerID.value
            }
        };
        const clearSelectedDeclarationLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            intLedgerID.value = store.state.Ledgers.ledgerID;
        };
        const handleSelectedWithholdingLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            whlLedgerID.value = store.state.Ledgers.ledgerID;
            if(selectedProduct.value){
                selectedProduct.value.withholding_posting_account.ledger_id = whlLedgerID.value;
                whlLedgerValue.value = whlLedgerID.value
            }
        };
        const clearSelectedWithholdingLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: ''});
            whlLedgerID.value = store.state.Ledgers.ledgerID;
        };
        const formFields = ref([]);
        const categoryValue = computed(() => {
           return (selectedProduct.value && selectedProduct.value.member_category && !categoryID.value) ? selectedProduct.value.member_category.member_category_id : categoryID.value;

        });
        const intLedgerValue = computed(() => {
            return (selectedProduct.value && selectedProduct.value.declaration_posting_account && !intLedgerID.value) ? selectedProduct.value.declaration_posting_account.ledger_id : intLedgerID.value;
        });
        const whlLedgerValue = computed(() => {
            return (selectedProduct.value && selectedProduct.value.withholding_posting_account && !whlLedgerID.value) ? selectedProduct.value.withholding_posting_account.ledger_id : whlLedgerID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                {  
                    type:'search-dropdown', label:"Member Category", value: categoryValue.value, componentKey: catComponentKey,
                    selectOptions: categoryArray, optionSelected: handleSelectedCategory, required: false,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '450px', updateValue: selectedCategory.value,
                    fetchData: store.dispatch('Member_Categories/fetchMemberCategories', {company:companyID.value}), clearSearch: clearSelectedCategory
                },
                { type: 'text', name: 'product_code',label: "Code", value: selectedProduct.value?.product_code || '', required: false },
                { type: 'text', name: 'product_name',label: "Name", value: selectedProduct.value?.product_name || '', required: true },
                { type: 'date', name: 'date',label: "Effective Date", value: selectedProduct.value?.date || '', required: true, placeholder: '' },
                { type: 'dropdown', name: 'share_type',label: "Share Type", value: selectedProduct.value?.share_type || '', placeholder: "", required: true, options: [{ text: 'Capital', value: 'Capital' }, { text: 'Ordinary', value: 'Ordinary' },{ text: 'Preferential', value: 'Preferential' }, { text: 'Reserved', value: 'Reserved' }] },
                { type: 'text', name: 'minimum_share_price',label: "Share Price", value: selectedProduct.value?.minimum_share_price || '0', required: true },
                { type: 'text', name: 'minimum_share_quantity',label: "Min Share Qty.", value: selectedProduct.value?.minimum_share_quantity || '0', required: true },
                { type: 'text', name: 'dividend_rate',label: "Dividend Rate", value: selectedProduct.value?.dividend_rate || '0', required: false },
                { type: 'dropdown', name: 'dividend_calculation',label: "Dividend Calculation", value: selectedProduct.value?.dividend_calculation || 'Declared Rate', placeholder: "", required: true, options: [{ text: 'Declared Rate', value: 'Declared Rate' }, { text: 'Amount', value: 'Amount' }] },
                { type: 'dropdown', name: 'mandatory',label: "Mandatory", value: selectedProduct.value?.mandatory || 'Yes', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'dropdown', name: 'withdrawable',label: "Withdrawable", value: selectedProduct.value?.withdrawable || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'dropdown', name: 'transferable',label: "Transferable", value: selectedProduct.value?.transferable || 'Yes', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },
                { type: 'dropdown', name: 'guaranteeable',label: "Loan Guarantee", value: selectedProduct.value?.guaranteeable || 'No', placeholder: "", required: true, options: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }] },

                {  
                    type:'search-dropdown', label:"Declared Dividend Posting Account", value: intLedgerValue.value, componentKey: intComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedDeclarationLedger, required: true,
                    searchPlaceholder: 'Select Posting Acc...', dropdownWidth: '450px', updateValue: selectedDeclarationLedger.value,
                    fetchData: store.dispatch('Ledgers/fetchLedger', {company:companyID.value}), clearSearch: clearSelectedDeclarationLedger
                },
                {  
                    type:'search-dropdown', label:"Dividend Withholding Posting Account", value: whlLedgerValue.value, componentKey: whlComponentKey,
                    selectOptions: ledgerArray, optionSelected: handleSelectedWithholdingLedger, required: true,
                    searchPlaceholder: 'Select Posting Acc...', dropdownWidth: '450px', updateValue: selectedWithholdingLedger.value,
                    fetchData: store.dispatch('Ledgers/fetchLedger', {company:companyID.value}), clearSearch: clearSelectedWithholdingLedger
                },
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            categoryID.value = '';
            intLedgerID.value = '';
            whlLedgerID.value = '';
            catComponentKey.value += 1;
            intComponentKey.value += 1;
            whlComponentKey.value += 1;
            mainComponentKey.value += 1;

        }

        watch([selectedProduct, selectedCategory, selectedDeclarationLedger, selectedWithholdingLedger], () => {
            if (selectedProduct.value && selectedCategory.value && selectedDeclarationLedger.value && selectedWithholdingLedger.value) {
                intComponentKey.value += 1;
                whlComponentKey.value += 1;
                catComponentKey.value += 1;
                mainComponentKey.value += 1;
                updateFormFields();
            }
            else if(selectedProduct.value && selectedDeclarationLedger.value && selectedWithholdingLedger.value){
                intComponentKey.value += 1;
                whlComponentKey.value += 1;
                mainComponentKey.value += 1;
                updateFormFields();
            }
            else{
                updateFormFields();
            }
        }, { immediate: true });
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createSharesProduct = async() =>{
            showLoader();
            let formData = {
                company: companyID.value,
                product_code: formFields.value[1].value || '-',
                product_name: formFields.value[2].value,
                status: "Active",
                date: formFields.value[3].value,
                charge_mode: formFields.value[4].value,
                minimum_share_price: formFields.value[5].value,
                minimum_share_quantity: formFields.value[6].value,
                dividend_rate: formFields.value[7].value,
                dividend_calculation: formFields.value[8].value,
                mandatory: formFields.value[9].value,
                withdrawable: formFields.value[10].value,
                transferable: formFields.value[11].value,
                guaranteeable: formFields.value[12].value,
                declaration_posting_account: intLedgerID.value,
                declaration_posting_account_id: intLedgerID.value,
                member_category: categoryID.value,
                member_category_id: categoryID.value,
                withholding_posting_account: whlLedgerID.value,
                withholding_posting_account_id: whlLedgerID.value,
            }

            errors.value = [];
            for(let i=1; i < (formFields.value.length - 1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(intLedgerValue.value == '' || whlLedgerValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();                 
            }else{            
                try {
                    const response = await store.dispatch('Shares_Products/createSharesProduct', formData);
                    if (response && response.status === 201) {
                        hideLoader();
                        toast.success('Product created successfully!');
                        handleReset();
                        mainComponentKey.value += 1;
                        catComponentKey.value += 1;
                        intComponentKey.value += 1;
                        whlComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the Product.');
                        hideLoader();
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Product: ' + error.message);
                } finally {
                    hideLoader();
                }              
            }
        }

        const updateSharesProduct = async() => {
            showLoader();
            errors.value = [];
            for(let i=2; i < (formFields.value.length -1); i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(intLedgerValue.value == '' || whlLedgerValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
                    hideLoader();
            }else{
                const updatedSharesProduct = {
                    shares_product: selectedProduct.value.shares_product_id,
                    company: companyID.value,
                    product_code: formFields.value[1].value || '-',
                    product_name: formFields.value[2].value,
                    status: selectedProduct.value.status,
                    date: formFields.value[3].value,
                    charge_mode: formFields.value[4].value,
                    minimum_share_price: formFields.value[5].value,
                    minimum_share_quantity: formFields.value[6].value,
                    dividend_rate: formFields.value[7].value,
                    dividend_calculation: formFields.value[8].value,
                    mandatory: formFields.value[9].value,
                    withdrawable: formFields.value[10].value,
                    transferable: formFields.value[11].value,
                    guaranteeable: formFields.value[12].value,
                    declaration_posting_account: intLedgerValue.value,
                    declaration_posting_account_id: intLedgerValue.value,
                    member_category: categoryID.value,
                    member_category_id: categoryID.value,
                    withholding_posting_account: whlLedgerValue.value,
                    withholding_posting_account_id: whlLedgerValue.value,
                };
       
                try {
                        const response = await store.dispatch('Shares_Products/updateSharesProduct', updatedSharesProduct);
                        if (response && response.status === 200) {
                            hideLoader();
                            toast.success('Product updated successfully!');
                            handleReset();
                            await store.dispatch('Member_Categories/updateState',{categoryID:''})
                            await store.dispatch('Ledgers/updateState',{ledgerID:''})
                            await store.dispatch("Shares_Products/updateState",{selectedProduct:null,selectedCategory:null,selectedDeclarationLedger:null,selectedWithholdingLedger:null})
                            catComponentKey.value += 1;
                            intComponentKey.value += 1;
                            whlComponentKey.value += 1;
                            mainComponentKey.value += 1;
                        } else {
                            toast.error('An error occurred while updating the Product.');
                            hideLoader();
                        }
                    } catch (error) {
                        console.error(error.message);
                        toast.error('Failed to update Product: ' + error.message);
                    } finally {
                        hideLoader();
                    }
            }                    
        };

        const saveSharesProduct = () =>{
            if(isEditing.value == true){
                updateSharesProduct();
            }else{
                createSharesProduct();
            }
        }
        
        onBeforeMount(()=>{ 
            updateFormFields();
            catComponentKey.value += 1;
            intComponentKey.value += 1;
            whlComponentKey.value += 1;
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        })
        onMounted(()=>{
            fetchAllLedgers();
        })

        return{
            componentKey, formFields, flex_basis, flex_basis_percentage,
            displayButtons, saveSharesProduct, mainComponentKey,
            handleReset, isEditing, loader, showLoader, hideLoader,
        }
    }
})
</script>