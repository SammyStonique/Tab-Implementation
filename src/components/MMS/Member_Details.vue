<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="mt-6">
                <h2><strong>Member Details</strong></h2>
                <DynamicForm  :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" :displayButtons="displayButtons" @handleSubmit="saveMember" @handleReset="handleReset"> 
                    <template v-slot:additional-content>
                        <div class="border border-slate-200 rounded relative py-1.5 mt-3 px-2 min-h-[180px]">
                            <h1 class="font-bold absolute top-[-13px] left-5 bg-white">Emergency Contact Details</h1>
                            <div class="tabs pt-2">
                                <button v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"@click="selectTab(index)">
                                    {{ tab }}
                                </button>
                            </div>
                            <div class="tab-content">
                                <div v-show="activeTab == 0">
                                    <DynamicForm :fields="additionalFields" :flex_basis="additional_flex_basis" :flex_basis_percentage="additional_flex_basis_percentage" @handleReset="handleReset"/>
                                </div>
                                <div v-show="activeTab == 1">
                                    <div class="text-left p-2">
                                        <SearchableDropdown 
                                            :key="chargeComponentKey"
                                            :options="chargeArr"
                                            :dropdownWidth="chargesDropdownWidth"
                                            :searchPlaceholder="chargesSearchPlaceholder"
                                            @option-selected="handleSelectedCharge"
                                            @fetchData="fetchData"
                                        />
                                    </div>                      
                                    <DynamicTable :key="tableKey" :columns="chargeColumns" :rows="chargeRows" :idField="idFieldCharge" :actions="actionCharges" @action-click="deleteCharge" :rightsModule="rightsModule" />
                                </div>
                                <div v-show="activeTab == 2">
                                    <div class="text-left p-2">
                        
                                    </div>                      
                                </div>
                            </div>
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
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '@/components/DynamicTable.vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default defineComponent({
    name: 'Member_Details',
    components:{
         DynamicForm,PageStyleComponent,SearchableDropdown,DynamicTable
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        // const tabs = ref(['Contact Details','Charge Details']);
        const tabs = ref(['Contact Details']);
        const mainComponentKey = ref(0);
        const depComponentKey = ref(0);
        const userComponentKey = ref(0);
        const currComponentKey = ref(0);
        const chargeComponentKey = ref(0);
        const activeTab = ref(0);
        const rightsModule = ref('MMS');
        const displayButtons = ref(true);
        const componentKey = ref(0);
        const tableKey = ref(0);
        const errors = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const selectedMember = computed(()=> store.state.Members.selectedMember);
        const selectedCategory = computed(()=> store.state.Members.selectedCategory);
        const selectedCurrency = computed(()=> store.state.Members.selectedCurrency);
        const selectedSponsor = computed(()=> store.state.Members.selectedSponsor);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const additional_flex_basis = ref('');
        const additional_flex_basis_percentage = ref('');
        const isEditing = computed(()=> store.state.Members.isEditing);
        const catArray = computed(() => store.state.Member_Categories.categoryArr);
        const sponsorArr = computed(() => store.state.Member_Sponsors.sponsorArr);
        const currencyArray = computed(() => store.state.Currencies.currencyArr);
        const chargeArr = computed(() => store.state.Membership_Fees.feeArr);
        const chargesDropdownWidth = ref('400px');
        const chargesSearchPlaceholder = ref('Select Charge...');
        const categoryID = ref('');
        const sponsorID = ref('');
        const currencyID = ref('');
        const chargeColumns = ref([
            {label: "Name", key:"fee_name", type: "text", editable: false},
            {label: "Charge Mode", key:"charge_mode", type: "text", editable: false},
            {label: "Amount", key: "default_amount", type: "number", editable: true},
        ]);
        const chargeRows = computed(() => {
            return store.state.Membership_Fees.feeArray;
        });
        const idFieldCharge = 'membership_fee_id';
        const actionCharges = ref([
            {name: 'delete', icon: 'fa fa-minus-circle', title: 'Remove Charge', rightName: 'Adding Members'},
        ])
        const fetchMemberCategories = async() =>{
            await store.dispatch('Member_Categories/fetchMemberCategories', {company:companyID.value});
        };
        const handleSelectedCategory = async(option) =>{
            await store.dispatch('Member_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Member_Categories.categoryID;
        };
        const clearSelectedCategory = async() =>{
            await store.dispatch('Member_Categories/updateState', {categoryID: ''});
            categoryID.value = store.state.Member_Categories.categoryID;   
            if(selectedMember.value && selectedMember.value.member_category != ""){
                selectedMember.value.member_category.member_category_id = categoryID.value;
                categoryValue.value = categoryID.value
            } 
        };
        const fetchMemberSponsors = async() =>{
            await store.dispatch('Member_Sponsors/fetchMemberSponsors', {company:companyID.value});
        };
        const handleSelectedSponsor = async(option) =>{
            await store.dispatch('Member_Sponsors/handleSelectedSponsor', option)
            sponsorID.value = store.state.Member_Sponsors.sponsorID;
        };
        const clearSelectedSponsor = async() =>{
            await store.dispatch('Member_Sponsors/updateState', {sponsorID: ''});
            sponsorID.value = store.state.Member_Sponsors.sponsorID;
            if(selectedMember.value && selectedMember.value.member_sponsor != ""){
                selectedMember.value.member_sponsor.member_sponsor_id = sponsorID.value;
                sponsorValue.value = sponsorID.value
            } 
        };
        const handleSelectedCurrency = async(option) =>{
            await store.dispatch('Currencies/handleSelectedCurrency', option)
            currencyID.value = store.state.Currencies.currencyID;
            if(selectedMember.value){
                selectedMember.value.member_currency.currency_id = currencyID.value;
            }
        }
        const clearSelectedCurrency = async() =>{
            await store.dispatch('Currencies/updateState', {currencyID: ''});
            currencyID.value = store.state.Currencies.currencyID;
        }

        const fetchCurrencies = async() =>{
            await store.dispatch('Currencies/fetchCurrencies', {company:companyID.value})
        };
        const fetchCharges = async() =>{
            await store.dispatch('Membership_Fees/fetchMembershipFees', {company:companyID.value})
        };
        const formFields = ref();
        const currencyValue = computed(() => {
           return (selectedMember.value && selectedMember.value.member_currency && !currencyID.value) ? selectedMember.value.member_currency.currency_id : currencyID.value;
        });
        const categoryValue = computed(() => {
           return (selectedMember.value && selectedMember.value.member_category && !categoryID.value) ? selectedMember.value.member_category.member_category_id : categoryID.value;
        });
        const sponsorValue = computed(() => {
           return (selectedMember.value && selectedMember.value.member_sponsor && !sponsorID.value) ? selectedMember.value.member_sponsor.member_sponsor_id : sponsorID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'member_number',label: "Member Number", value: selectedMember.value?.member_number || '', required: false },
                { type: 'dropdown', name: 'membership_type',label: "Membership Type", value: selectedMember.value?.membership_type || '', placeholder: "", required: true, options: [{ text: 'Individual', value: 'Individual' }, { text: 'Business', value: 'Business' }, { text: 'Joint', value: 'Joint' }, { text: 'Group', value: 'Group' }] },
                { type: 'date', name: 'joining_date',label: "Joining Date", value: selectedMember.value?.joining_date || '', required: true, placeholder: '' },
                { type: 'text', name: 'member_name',label: "Member Name", value: selectedMember.value?.member_name || '', required: true },
                { type: 'text', name: 'phone_number',label: "Phone Number", value: selectedMember.value?.phone_number || '', required: true, placeholder: '' },
                { type: 'text', name: 'id_number',label: "ID Number", value: selectedMember.value?.id_number || '', required: true, placeholder: '' },
                { type: 'date', name: 'dob',label: "D.O.B", value: selectedMember.value?.dob || null, required: false, placeholder: '' },
                { type: 'dropdown', name: 'gender',label: "Gender", value: selectedMember.value?.gender || '', placeholder: "", required: true, options: [{ text: 'Male', value: 'Male' }, { text: 'Female', value: 'Female' }, { text: 'Others', value: 'Others' }, { text: 'Not Applicable', value: 'Not Applicable' }] },
                { type: 'text', name: 'email',label: "Email", value: selectedMember.value?.email || '', required: false },
                { type: 'text', name: 'kra_pin',label: "Tax Pin", value: selectedMember.value?.kra_pin || '', required: false },
                { type: 'dropdown', name: 'marital_status',label: "Marital Status", value: selectedMember.value?.marital_status || '', placeholder: "", required: true, options: [{ text: 'Single', value: 'Single' }, { text: 'Married', value: 'Married' },{ text: 'Separated', value: 'Separated' }, { text: 'Divorced', value: 'Divorced' },{ text: 'Widowed', value: 'Widowed' },{ text: 'Not Applicable', value: 'Not Applicable' }] },
                { type: 'text', name: 'country',label: "Country", value: selectedMember.value?.country || 'Kenya', required: true },
                { type: 'text', name: 'address',label: "Address", value: selectedMember.value?.address || '', required: false },
                { type: 'text', name: 'shif_number',label: "Shif No", value: selectedMember.value?.shif_number || '', required: false },
                { type: 'text', name: 'nssf_number',label: "Nssf No", value: selectedMember.value?.nssf_number || '', required: false },
                {  
                    type:'search-dropdown', label:"Currency", value: currencyValue.value, componentKey: currComponentKey,
                    selectOptions: currencyArray, optionSelected: handleSelectedCurrency, required: true,
                    searchPlaceholder: 'Select Currency...', dropdownWidth: '500px', updateValue: selectedCurrency.value,
                    clearSearch: clearSelectedCurrency
                },
                {  
                    type:'search-dropdown', label:"Category", value: categoryValue.value, componentKey: depComponentKey,
                    selectOptions: catArray, optionSelected: handleSelectedCategory, required: false,
                    searchPlaceholder: 'Select Category...', dropdownWidth: '500px', updateValue: selectedCategory.value,
                    clearSearch: clearSelectedCategory
                },
                {  
                    type:'search-dropdown', label:"Sponsor", value: sponsorValue.value, componentKey: userComponentKey,
                    selectOptions: sponsorArr, optionSelected: handleSelectedSponsor, required: false,
                    searchPlaceholder: 'Select Sponsor...', dropdownWidth: '500px', updateValue: selectedSponsor.value,
                    clearSearch: clearSelectedSponsor
                },
            ];
        };

        const additionalFields = ref();
        const updateAdditionalFormFields = () => {
            additionalFields.value = [
                { type: 'text', name: 'contact_names',label: "Name", value: selectedMember.value?.contact_names ||'', required: false },
                { type: 'text', name: 'contact_phone_number',label: "Phone Number", value: selectedMember.value?.contact_phone_number ||'', required: false },
                { type: 'text', name: 'contact_email',label: "Email", value: selectedMember.value?.contact_email ||'', required: false },
                { type: 'text', name: 'contact_relationship',label: "Relationship", value: selectedMember.value?.contact_relationship ||'', required: false },
            ];
        };

        watch([categoryID, sponsorID], () => {
            if (categoryID.value != "") {
                formFields.value[16].value = categoryID.value;
            }
            if(sponsorID.value != ""){
                formFields.value[17].value = sponsorID.value;
            }
        }, { immediate: true });

        watch([selectedMember, selectedCurrency, selectedCategory, selectedSponsor], () => {
            if (selectedMember.value && selectedCurrency.value && selectedCategory.value && selectedSponsor.value) {
                depComponentKey.value += 1;
                userComponentKey.value += 1;
                currComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();

            }
            else if(selectedMember.value && selectedCurrency.value && selectedCategory.value){
                currComponentKey.value += 1;
                depComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                
            }else if(selectedMember.value && selectedCurrency.value && selectedSponsor.value){
                currComponentKey.value += 1;
                userComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                
            }else if(selectedMember.value && selectedCurrency.value){
                currComponentKey.value += 1;
                updateFormFields();
                updateAdditionalFormFields();
                
            }else if(selectedMember.value){
                updateFormFields();
                updateAdditionalFormFields();
            }
        }, { immediate: true });

        const handleReset = async() =>{
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].label != 'Country'){
                    formFields.value[i].value = '';
                }
            }
            for(let i=0; i < additionalFields.value.length; i++){
                additionalFields.value[i].value = '';
            }
            await store.dispatch('Membership_Fees/updateState', {feeArray: []});
            await store.dispatch('Members/updateState', {selectedMember: null, selectedSponsor: null, selectedCurrency: null, selectedCategory: null, isEditing:false});
            mainComponentKey.value += 1;
            userComponentKey.value += 1;
            currComponentKey.value += 1;
            depComponentKey.value += 1;
            currencyID.value = "";
            sponsorID.value = "";
            categoryID.value = "";
        }
         
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        } 
        const createMember = async() =>{
            showLoader();
            let formData = {
                member_number: formFields.value[0].value || '-',
                member_name: formFields.value[3].value,
                gender: formFields.value[7].value,
                id_number: formFields.value[5].value,
                kra_pin: formFields.value[9].value,
                dob: formFields.value[6].value,
                phone_number: formFields.value[4].value,
                email: formFields.value[8].value,
                country: formFields.value[11].value,
                address: formFields.value[12].value,
                contact_phone_number: additionalFields.value[1].value,
                contact_email: additionalFields.value[2].value,
                contact_relationship: additionalFields.value[3].value,
                contact_names: additionalFields.value[0].value,
                active_status: 'Active',
                membership_type: formFields.value[1].value,
                marital_status: formFields.value[10].value,
                joining_date: formFields.value[2].value,
                shif_number: formFields.value[13].value,
                nssf_number: formFields.value[14].value,
                member_currency: currencyID.value,
                member_currency_id: currencyID.value,
                member_category: categoryID.value,
                member_category_id: categoryID.value,
                member_sponsor: sponsorID.value,
                member_sponsor_id: sponsorID.value,
                charges: chargeRows.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(currencyValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideLoader();
            }else{
                try {
                    const response = await store.dispatch('Members/createMember', formData);
                    if(response && response.status === 201) {
                        hideLoader();
                        toast.success('Member created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Member.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Member: ' + error.message);
                } finally {
                    hideLoader();
                }
            }

        }
        const updateMember = async() =>{
            showLoader();
            errors.value = [];
            let formData = {
                member: selectedMember.value.member_id,
                member_number: formFields.value[0].value,
                member_name: formFields.value[3].value,
                gender: formFields.value[7].value,
                id_number: formFields.value[5].value,
                kra_pin: formFields.value[9].value,
                dob: formFields.value[6].value,
                phone_number: formFields.value[4].value,
                email: formFields.value[8].value,
                country: formFields.value[11].value,
                address: formFields.value[12].value,
                contact_phone_number: additionalFields.value[1].value,
                contact_email: additionalFields.value[2].value,
                contact_relationship: additionalFields.value[3].value,
                contact_names: additionalFields.value[0].value,
                active_status: selectedMember.value.active_status,
                membership_type: formFields.value[1].value,
                marital_status: formFields.value[10].value,
                joining_date: formFields.value[2].value,
                shif_number: formFields.value[13].value,
                nssf_number: formFields.value[14].value,
                member_currency: currencyValue.value,
                member_currency_id: currencyValue.value,
                member_category: categoryValue.value,
                member_category_id: categoryValue.value,
                member_sponsor: sponsorValue.value,
                member_sponsor_id: sponsorValue.value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true && formFields.value[i].type != 'search-dropdown'){
                    errors.value.push('Error');
                }
            }
            if(currencyValue.value == ''){
                errors.value.push('Error');
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Members/updateMember', formData);
                    if (response && response.status === 200) {
                        hideLoader();
                        toast.success("Member updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Member.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Member: ' + error.message);
                } finally {
                    hideLoader();
                }
            }
        }
        const saveMember = () =>{
            if(isEditing.value == true){
                updateMember();
            }else{
                createMember();
            }
        };

        const selectTab = (index) => {
            activeTab.value = index;
        };
        
        const handleSelectedCharge = async(option) =>{
            await store.dispatch('Membership_Fees/handleSelectedFee', option);
            chargeComponentKey.value += 1;
        }
        const deleteCharge = (rowIndex, action, row) =>{
            store.dispatch('Membership_Fees/removeMembershipFee', rowIndex);
            tableKey.value += 1;
        }
        
        onBeforeMount(()=>{ 
            fetchCharges();
            updateFormFields();
            updateAdditionalFormFields();
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '20';
            additional_flex_basis.value = '1/3';
            additional_flex_basis_percentage.value = '33.333';
        })
        onMounted(()=>{
            fetchCurrencies();
            fetchMemberCategories();
            fetchMemberSponsors();
        })

        return{
            tabs,componentKey, formFields, additionalFields, flex_basis, flex_basis_percentage, additional_flex_basis,
            additional_flex_basis_percentage, mainComponentKey,handleReset, loader, showLoader, hideLoader,
            displayButtons,saveMember,chargeArr,chargesDropdownWidth,chargesSearchPlaceholder,selectTab,handleSelectedCharge,
            deleteCharge,activeTab,rightsModule,idFieldCharge,chargeRows,chargeColumns,actionCharges,chargeComponentKey
        }
    }
})
</script>

<style scoped>
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
    padding: 3px;
    margin-top: 10px !important;
}
</style>