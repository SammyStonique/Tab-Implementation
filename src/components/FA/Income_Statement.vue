<template>
    <div class="z-10">
        <PageStyleComponent :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="fixed bg-white w-[97%] z-50">
                <FilterBar 
                    :addButtonLabel="addButtonLabel" 
                    :showAddButton="showAddButton"
                    :filters="searchFilters" 
                    @add-new=""
                    @search="searchIncomeStatement"
                    @reset="resetFilters"
                    @printList="printList"
                    :dropdownOptions="dropdownOptions"
                    @handleDynamicOption="handleDynamicOption"
                    :options="options"
                    :dropdownWidth="dropdownWidth"
                    :selectOptions="selectOptions"
                    :updateValue="updateValue"
                    :searchPlaceholder="searchPlaceholder"
                    />
            </div>
            <div class="table-container  min-h-[330px] mt-20 uppercase">
                  <table class="min-w-full bg-white chart-of-accounts-table" style="width: 100%;"> 
                      <thead class="bg-gray-800 text-white">
                          <tr class="rounded bg-slate-800 text-white font-semibold text-xs uppercase">
                            <th class="text-left py-2 px-2" style="width: 30%;">Account</th>
                            <th class="text-left py-2 px-2" v-for="month in months_array" :key="month">{{ month }}</th>
                          </tr>
                      </thead>
                      <tbody>
                        <tr>
                            <td class="text-left py-2 font-bold text-xs">Income</td>
                        </tr>
                        <tr v-for="(monthlyData, account) in formattedIncomeData" :key="account" class="even:bg-gray-100 text-xs">
                            <td class="text-left py-1 px-2" :style="account === 'Totals' ? 'font-weight: bold;' : ''">{{ account }}</td>
                            <td class="text-left py-1 px-2"  v-for="month in months_array" :key="month" :style="account === 'Totals' ? 'font-weight: bold;' : ''">{{ Number(monthlyData[month]).toLocaleString() }}</td>
                        </tr>

                        <tr>
                            <td class="text-left py-2 font-bold text-xs">Expenses</td>
                        </tr>
                        <tr v-for="(monthlyData, account) in formattedExpensesData" :key="account" class="even:bg-gray-100 mb-6 text-xs">
                            <td class="text-left py-1 px-2" :style="account === 'Totals' ? 'font-weight: bold;' : ''">{{ account }}</td>
                            <td class="text-left py-1 px-2"  v-for="month in months_array" :key="month" :style="account === 'Totals' ? 'font-weight: bold;' : ''">{{ Number(monthlyData[month]).toLocaleString() }}</td>
                        </tr>
                        <tr class="mt-6 text-sm">
                            <td style="font-weight: bold;">Net Profit/Loss</td>
                            <td v-for="month in months_array" :key="month" style="font-weight: bold;">
                                {{ Number(netProfitLoss[month]).toLocaleString() }}
                            </td>
                        </tr>
                      </tbody>
                  </table>   
                </div>

    </template>
    </PageStyleComponent>
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="">
            <DynamicForm 
                :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
                :displayButtons="displayButtons" @handleSubmit="" @handleReset="handleReset"
            />
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import MovableModal from '@/components/MovableModal.vue'
import DynamicTable from '../DynamicTable.vue';
import FilterBar from "../FilterBar.vue";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Income_Statement',
    components:{
        PageStyleComponent, MovableModal,DynamicTable, FilterBar
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = '';
        const addButtonLabel = ref('');
        const showAddButton = ref(false);
        const title = ref('');
        const submitButtonLabel = ref('Add');
        const periodComponentKey = ref(0);
        const selectedIds = ref([]);
        const start_date = ref('');
        const periodList = ref([]);
        const currentPage = ref(1);
        const propModalVisible = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const periodName = ref('');
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const showModal = ref(false);
        const periodsArray = computed(()=> store.state.Fiscal_Periods.periodArr);
        const income_accounts = ref([]);
        const expense_accounts = ref([]);
        const months = ref(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
        const months_array = ref([]);
        const fiscal_periods_array = computed(()=> store.state.Fiscal_Periods.periodsList);;
        const fiscal_periods = ref([]);
        
        const incomeAccountNames = computed (() =>{
            return Object.keys(income_accounts.value);
        });
        const formattedIncomeData = computed(() => {
            // Initialize an object to hold the formatted data
            const data = {};
            // Initialize an object to hold the totals for each month
            const totals = {};

            // Initialize the totals for each month to 0
            for (const month of months.value) {
                totals[month] = 0;
            }

            // Iterate through each account in the income_accounts
            for (const account in income_accounts.value) {
                // Initialize an object to hold the monthly income for the account
                data[account] = {};

                // Iterate through each month and set the income value or 0
                for (const month of months.value) {
                    const value = income_accounts.value[account][month] || 0;
                    data[account][month] = value;
                    // Add the value to the monthly total
                    totals[month] += value;
                }
            }

            // Add the totals row to the data
            data['Totals'] = totals;
            return data;
        });
        const expenseAccountNames = computed (() =>{
            return Object.keys(expense_accounts.value);
        });
        const formattedExpensesData = computed(() => {
            // Initialize an object to hold the formatted data
            const data = {};
            // Initialize an object to hold the totals for each month
            const totals = {};

            // Initialize the totals for each month to 0
            for (const month of months.value) {
                totals[month] = 0;
            }

            // Iterate through each account in the expense_accounts
            for (const account in expense_accounts.value) {
                // Initialize an object to hold the monthly expenses for the account
                data[account] = {};

                // Iterate through each month and set the value or 0
                for (const month of months.value) {
                    const value = expense_accounts.value[account][month] || 0;
                    data[account][month] = value;
                    // Add the value to the monthly total
                    totals[month] += value;
                }
            }

            // Add the totals row to the data
            data['Totals'] = totals;
            return data;
        });
        const netProfitLoss = computed(() => {
            const net = {};
            for (const month of months.value) {
                const incomeTotal = formattedIncomeData.value['Totals'][month] || 0;
                const expenseTotal = formattedExpensesData.value['Totals'][month] || 0;
                net[month] = incomeTotal - expenseTotal;
            }
            return net;
        });
        const actions = ref([
           
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const fetchFiscalPeriods = async() =>{
            await store.dispatch('Fiscal_Periods/fetchFiscalPeriods', {company:companyID.value})
        };
        const handleSearchFiscalPeriod = async(option) =>{
            await store.dispatch('Fiscal_Periods/handleSelectedPeriod', option)
            periodName.value = store.state.Fiscal_Periods.periodName;

            for(let i=0; i<fiscal_periods_array.value.length; i++){
                if((fiscal_periods_array.value[i].period_name) === option){
                    start_date.value = fiscal_periods_array.value[i].start_date;
                    const date = new Date(start_date.value);
                    const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
                    generateMonthsFrom(monthName);
                    searchIncomeStatement(); 
                }
            } 
        };
        const clearSearchFiscalPeriod = async() =>{
            await store.dispatch('Fiscal_Periods/updateState', {periodName: ''});
            periodName.value = ""
        };
        const searchFilters = ref([
            {
                type:'search-dropdown', value: periodName.value, width:64, componentKey: periodComponentKey,
                selectOptions: periodsArray, optionSelected: handleSearchFiscalPeriod,
                searchPlaceholder: 'Fiscal Period Search...', dropdownWidth: '300px',
                fetchData: fetchFiscalPeriods(), clearSearch: clearSearchFiscalPeriod()             
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };

        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }


        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const generateMonthsFrom = (startMonth) =>{
            const Months = months.value;

            const startIndex = Months.indexOf(startMonth);
            
            if (startIndex === -1) {
                throw new Error('Invalid month name');
            }
            // return [...months.slice(startIndex), ...months.slice(0, startIndex)];
            months_array.value = [...Months.slice(startIndex), ...Months.slice(0, startIndex)];
        };

        const searchIncomeStatement = () =>{
            showLoader();
            let formData = {
                fiscal_period: periodName.value,
                company: companyID.value
            } 
            axios
            .post(`api/v1/income-statement-search/`,formData)
            .then((response)=>{
                income_accounts.value = response.data.income;
                expense_accounts.value = response.data.expenses;
            })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        const resetFilters = () =>{
            searchIncomeStatement();
        }

        onBeforeMount(()=>{
        
            
        })
        return{
            showAddButton,title, searchIncomeStatement,resetFilters, addButtonLabel, searchFilters, periodList,
            idField, actions, propModalVisible,
            submitButtonLabel, showModal, showLoader, loader, hideLoader, modal_loader, modal_top, modal_left, modal_width,displayButtons,
            showModalLoader, hideModalLoader, formFields, handleSelectionChange, flex_basis,flex_basis_percentage,
            months_array, formattedIncomeData, formattedExpensesData, netProfitLoss, expenseAccountNames, incomeAccountNames
        }
    }
};
</script>

<style scoped>
.table-container thead th {
  position: sticky;
  top: 0;
  background: #3b4252;
}
.chart-of-accounts-table{
    min-height: 50vh;
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}
</style>