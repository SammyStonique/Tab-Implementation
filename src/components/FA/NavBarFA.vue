<template>
    <div class="navbar flex top-0 w-full text-sm sticky-navbar bg-white border-b border-slate-300 shadow-sm shadow-slate-200 px-6 h-10">
        <button class="fixed inset-0 bg-gray-50 opacity-15 cursor-default w-full" v-if="dropdown" @click="closeDropdown"></button>
        <div class="flex">
            <div class="web-links py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="showHomePage">
                    <i class="fa fa-home pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Home Page</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="openPage({'FA':'Dashboard'})">
                    <i class="fa fa-tachometer pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Dashboard</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="openPage({'FA':'Chart_Of_Accounts'})">
                    <i class="fa fa-briefcase pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Chart Of Accounts</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="openPage({'FA':'Client_Categories'})">
                    <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Client Categories</p>
                    </button>
            </div> 
            <div class="web-links dropdown">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="showInvoicesDropdown">
                    <i class="fa fa-file-invoice pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Invoices</p>
                </button>
                </div>
                <div class="dropdown-content w-40 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="invoices_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'FA':'General_Invoices'})">
                            <i class="fa fa-file-invoice pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Invoices</p>
                        </button>

                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'FA':'General_Receipts'})">
                            <i class="fa fa-pencil-square-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Receipts</p>
                        </button>

                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'FA':'Customers'})">
                            <i class="fa fa-user pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Customers</p>
                        </button>

                    </div>
                </div>
            </div>
            <div class="web-links dropdown">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showBillsDropdown">
                        <i class="fa fa-credit-card pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Bills</p>
                    </button>
                </div>
                <div class="dropdown-content w-40 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="bills_dropdown">       
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'FA':'General_Bills'})">
                            <i class="fa fa-credit-card pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Bills</p>
                        </button>

                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'FA':'Payment_Vouchers'})">
                            <i class="fa fa-pencil-square-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Payments</p>
                        </button>

                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'FA':'Vendors'})">
                            <i class="fa fa-truck pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Vendors</p>
                        </button>

                    </div>
                </div>
            </div>
            <div class="web-links py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="openPage({'FA':'Journals'})">
                    <i class="fa fa-book pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Journals</p>
                    </button>
            </div>
            <div class="web-links dropdown">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showTaxesDropdown">
                        <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Taxes</p>
                    </button>
                </div>
                <div class="dropdown-content w-48 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="taxes_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'FA':'Tax_Mapping'})">
                            <i class="fa fa-universal-access pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Tax Mapping</p>
                        </button>

                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'FA':'Vat_Transactions'})">
                            <i class="fa fa-address-card pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">VAT Transactions</p>
                        </button>

                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'FA':'Withholding_Vat'})">
                            <i class="fa fa-address-book-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Withholding VAT</p>
                        </button>

                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'FA':'Withholding_Tax'})">
                            <i class="fa fa-list-ul pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Withholding Tax</p>
                        </button>

                    </div>
                </div>
            </div>
            <div class="web-links py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex" @click="openPage({'FA':'Fiscal_Periods'})">
                    <i class="fa fa-clock-o pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Fiscal Periods</p>
                </button>
            </div>
            <div class="web-links dropdown">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showReportsDropdown">
                        <i class="fa fa-line-chart pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Reports</p>
                    </button>
                </div>
                <div class="dropdown-content w-48 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="reports_dropdown">
                <div class="py-2 px-3 pl-4 w-full  hover:bg-slate-500 hover:w-full">
                    <button class="flex text-sm" @click="openPage({'FA':'Income_Statement'})">
                        <i class="fa fa-bar-chart pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Income Statement</p>
                    </button>
                </div>
                <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                    <button class="flex text-sm" @click="openPage({'FA':'Balance_Sheet'})">
                        <i class="fa fa-balance-scale pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Balance Sheet</p>
                    </button>
                </div>
                <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                    <button class="flex text-sm" @click="openPage({'FA':'Trial_Balance'})">
                        <i class="fa fa-book pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Trial Balance</p>
                    </button>
                </div>
                </div>
            </div>             
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { defineComponent } from 'vue';
export default defineComponent({
    setup(_, { emit }){
        const store = useStore();
        const taxes_dropdown = ref(false);
        const invoices_dropdown = ref(false);
        const reports_dropdown = ref(false);
        const bills_dropdown = ref(false);
        const userDetails = ref([]);
        const dropdown = ref(false);

        const showInvoicesDropdown = () =>{
            dropdown.value = true;
            taxes_dropdown.value = false;
            reports_dropdown.value  = false;
            bills_dropdown.value  = false;
            invoices_dropdown.value  = !invoices_dropdown.value ;
        }
        const showBillsDropdown = () =>{
            dropdown.value = true;
            invoices_dropdown.value = false;
            reports_dropdown.value = false;
            taxes_dropdown.value = false;
            bills_dropdown.value = !bills_dropdown.value;
        }
        const showReportsDropdown = () =>{
            dropdown.value = true;
            taxes_dropdown.value = false;
            invoices_dropdown.value = false;
            bills_dropdown.value  = false;
            reports_dropdown.value = !reports_dropdown.value;
        }
        const showTaxesDropdown = () =>{
            dropdown.value = true;
            invoices_dropdown.value = false;
            reports_dropdown.value = false;
            bills_dropdown.value  = false;
            taxes_dropdown.value = !taxes_dropdown.value;
        }
        const closeDropdown = () =>{
            invoices_dropdown.value = false;
            reports_dropdown.value  = false;
            bills_dropdown.value  = false;
            taxes_dropdown.value = false;
            dropdown.value = false;
        }
        const openPage = (pageName) =>{
            closeDropdown();
            store.commit('pageTab/ADD_PAGE', pageName);
            emit('openPage', pageName)
        };
        const showHomePage = () =>{
            store.commit('modulesTab/MINIMIZE_TAB')
        };
        return{
            dropdown, taxes_dropdown,invoices_dropdown, bills_dropdown, reports_dropdown, userDetails,
            showInvoicesDropdown, showBillsDropdown, showTaxesDropdown, showReportsDropdown, closeDropdown,
            openPage,showHomePage
        }
    },

});
</script>

<style>
.navbar{
  z-index: 4000;
}

</style>