<template>
    <div class="navbar flex top-0 w-full text-sm sticky-navbar bg-white border-b border-slate-300 shadow-sm shadow-slate-200 px-6 h-10">
        <button class="fixed inset-0 bg-gray-50 opacity-15 cursor-default w-full" v-if="dropdown" @click="closeDropdown"></button>
        <div class="flex">
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex">
                    <i class="fa fa-home pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Home Page</p>
                </button>
            </div>
            <div class="web-links py-1.5 px-2.5 w-32 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="openPage({'INV':'Dashboard'})">
                    <i class="fa fa-tachometer pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Dashboard</p>
                </button>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="showItemsDropdown">
                    <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Inventory Items</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="items_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Item_Categories'})">
                            <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Item Categories</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Items_Catalog'})">
                            <i class="fa fa-users pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Items Catalog</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Retail_Outlets'})">
                            <i class="fa fa-sitemap pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Retail Outlets</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Catalog_By_Outlet'})">
                            <i class="fa fa-newspaper-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Catalog By Outlet</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Fast_Moving_Items'})">
                            <i class="fa fa-newspaper-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Fast Moving Items</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Item_Location'})">
                            <i class="fa fa-microchip pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Item Location</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Uom'})">
                            <i class="fa fa-hashtag pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Unit Of Measure</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Outlet_Counters'})">
                            <i class="fa fa-shopping-bag  pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Outlet Counters</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                <button class="flex w-full" @click="showSalesDropdown">
                    <i class="fa fa-line-chart pt-2 mr-2" aria-hidden="true"></i>
                    <p class="pt-1.5">Sales</p>
                </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="sales_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Direct_Sales'})">
                            <i class="fa fa-line-chart pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Direct Sales</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Sale_Items'})">
                            <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Sale Items</p>
                        </button>  
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Sale_Orders'})">
                            <i class="fa fa-shopping-cart pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Sale Orders</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Delivery_Orders'})">
                            <i class="fa fa-truck pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Delivery Orders</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Invoices'})">
                            <i class="fa fa-file-invoice pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Invoices</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Receipts'})">
                            <i class="fa fa-pencil-square-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Receipts</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Customers'})">
                            <i class="fa fa-user pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Customers</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-32">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showPurchasesDropdown">
                        <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Purchases</p>
                    </button>
                </div>
                <div class="dropdown-content w-52 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm pt-2" v-if="purchases_dropdown">       
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Direct_Purchases'})">
                            <i class="fa fa-money pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Direct Purchases</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Purchase_Items'})">
                            <i class="fa fa-bars pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Purchase Items</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Purchase_Orders'})">
                            <i class="fa fa-shopping-cart pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Purchase Orders</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Received_Orders'})">
                            <i class="fa fa-archive pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Received Orders</p>
                        </button>
    
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Bills'})">
                            <i class="fa fa-credit-card pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Bills</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Payments'})">
                            <i class="fa fa-pencil-square-o pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Payments</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Vendors'})">
                            <i class="fa fa-truck pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Vendors</p>
                        </button>
                    </div>
                </div>
            </div>
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex w-full" @click="showStockDropdown">
                        <i class="fa fa-database pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Stock Control</p>
                    </button>
                </div>
                <div class="dropdown-content w-48 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="stock_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Stock_Adjustments'})">
                            <i class="fa fa-cogs pt-2 mr-2" aria-hidden="true"></i>
                            <p class="">Stock Adjustments</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Stock_Take'})">
                        <i class="fa fa-archive pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Stock Take</p>
                        </button>
                    </div>
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm w-full" @click="openPage({'INV':'Stock_Transfers'})">
                        <i class="fa fa-exchange pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Stock Transfers</p>
                        </button>
                    </div>
                </div>
            </div> 
            <div class="web-links dropdown w-36">
                <div class="py-1.5 px-2.5 h-full hover:bg-slate-500 hover:rounded">
                    <button class="flex" @click="showSettingsDropdown">
                        <i class="fa fa-cogs pt-2 mr-2" aria-hidden="true"></i>
                        <p class="pt-1.5">Settings</p>
                    </button>
                </div>
                <div class="dropdown-content w-48 absolute rounded border border-gray-200 bg-white shadow-slate-400 shadow-sm" v-if="settings_dropdown">
                    <div class="py-2 px-3 pl-4 w-full hover:bg-slate-500 hover:w-full">
                        <button class="flex text-sm" @click="openPage({'INV':'Default_Settings'})">
                        <i class="fa fa-link pt-2 mr-2" aria-hidden="true"></i>
                        <p class="">Posting Acc. Mapping</p>
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
        const settings_dropdown = ref(false);
        const items_dropdown = ref(false);
        const sales_dropdown = ref(false);
        const purchases_dropdown = ref(false);
        const stock_dropdown = ref(false);
        const userDetails = ref([]);
        const dropdown = ref(false);

        const showItemsDropdown = () =>{
            sales_dropdown.value = false;
            settings_dropdown.value = false;
            purchases_dropdown.value  = false;
            stock_dropdown.value = false;
            dropdown.value = true;
            items_dropdown.value  = !items_dropdown.value ;
        }
        const showPurchasesDropdown = () =>{
            sales_dropdown.value = false;
            settings_dropdown.value = false;
            items_dropdown.value  = false;
            stock_dropdown.value = false;
            dropdown.value = true;
            purchases_dropdown.value  = !purchases_dropdown.value ;
        }
        const showSalesDropdown = () =>{
            settings_dropdown.value = false;
            items_dropdown.value  = false;
            purchases_dropdown.value = false;
            stock_dropdown.value = false;
            dropdown.value = true;
            sales_dropdown.value  = !sales_dropdown.value ;
        }
        const showSettingsDropdown = () =>{
            sales_dropdown.value = false;
            items_dropdown.value  = false;
            purchases_dropdown.value  = false;
            stock_dropdown.value = false;
            dropdown.value = true;
            settings_dropdown.value  = !settings_dropdown.value ;
        }
        const showStockDropdown = () =>{
            sales_dropdown.value = false;
            items_dropdown.value  = false;
            purchases_dropdown.value  = false;
            settings_dropdown.value = false;
            dropdown.value = true;
            stock_dropdown.value  = !stock_dropdown.value ;
        }
        const closeDropdown = () =>{
            sales_dropdown.value = false;
            items_dropdown.value  = false;
            purchases_dropdown.value  = false;
            settings_dropdown.value = false;
            stock_dropdown.value = false;
            dropdown.value = false;
        }
        const openPage = (pageName) =>{
            closeDropdown();
            store.commit('pageTab/ADD_PAGE', pageName);
            emit('openPage', pageName)
        }
        return{
            dropdown, settings_dropdown, sales_dropdown,
            items_dropdown, stock_dropdown,purchases_dropdown, 
            userDetails, closeDropdown,
            showItemsDropdown, showSalesDropdown,
            showPurchasesDropdown, showStockDropdown,
            showSettingsDropdown,
            openPage
        }
    },

});
</script>

<style scoped>
.navbar{
  z-index: 1000;
}
.dropdown-content{
    position: absolute;
    z-index: 1000;
}

</style>