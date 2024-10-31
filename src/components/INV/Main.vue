<template>
    <div class="main-container w-full min-h-[90vh] bottom-8">
        <div class="fixed top-0 w-full z-50">
            <div class="z-50 relative">
                <NavBar :title="title" @minimize="minimize" @close="close"/>
            </div> 
            <div class="z-40 relative">
                <NavBarINV @openPage="selectTab"/>
            </div>
            <div class="z-30">
                <PagesTab @openPage="selectedTab" @closePage="closeTab"/>
            </div>
        </div>
        <div class="tab-content z-20 overflow-y-hidden">
            <keep-alive :include="cachedComponents">
                <component 
                    :is="activeComponent"
                 />
            </keep-alive>
        </div>
        
    </div>
</template>

<script>
import { useStore } from 'vuex';
import { ref, computed, watch } from 'vue';
import NavBar from '@/components/NavBar.vue'
import NavBarINV from '@/components/INV/NavBarINV.vue';
import PagesTab from '@/components/INV/PagesTab.vue';
import Dashboard from '@/components/INV/Dashboard.vue';
import Item_Categories from '@/components/INV/Item_Categories.vue';
import Items_Catalog from '@/components/INV/Items_Catalog.vue';
import Item_Details from '@/components/INV/Item_Details.vue';
import Retail_Outlets from '@/components/INV/Retail_Outlets.vue';
import Catalog_By_Outlet from '@/components/INV/Catalog_By_Outlet.vue';
import Fast_Moving_Items from '@/components/INV/Fast_Moving_Items.vue';
import Item_Location from '@/components/INV/Item_Location.vue';
import Uom from '@/components/INV/Uom.vue';
import Outlet_Counters from '@/components/INV/Outlet_Counters.vue';
import Direct_Sales from '@/components/INV/Direct_Sales.vue';
import Sale_Details from '@/components/INV/Sale_Details.vue';
import Sale_Items from '@/components/INV/Sale_Items.vue';
import Invoices from '@/components/INV/Invoices.vue';
import Invoice_Details from '@/components/INV/Invoice_Details.vue';
import Receipts from '@/components/INV/Receipts.vue';
import Receipt_Details from '@/components/INV/Receipt_Details.vue';
import Customers from '@/components/INV/Customers.vue';
import Bills from '@/components/INV/Bills.vue';
import Bill_Details from '@/components/INV/Bill_Details.vue';
import Payments from '@/components/INV/Payments.vue';
import Payment_Details from '@/components/INV/Payment_Details.vue';
import Vendors from '@/components/INV/Vendors.vue';
import Sale_Orders from '@/components/INV/Sale_Orders.vue';
import Sale_Order_Details from '@/components/INV/Sale_Order_Details.vue';
import Delivery_Orders from '@/components/INV/Delivery_Orders.vue';
import Delivery_Order_Details from '@/components/INV/Delivery_Order_Details.vue';
import Direct_Purchases from '@/components/INV/Direct_Purchases.vue';
import Purchase_Details from '@/components/INV/Purchase_Details.vue';
import Purchase_Items from '@/components/INV/Purchase_Items.vue';

import Default_Settings from '@/components/SET/Default_Settings.vue';

export default{
    components:{
        NavBar,
        NavBarINV,
        PagesTab,
        Dashboard,Item_Categories,Items_Catalog,Item_Details,Retail_Outlets,Catalog_By_Outlet,Fast_Moving_Items,Item_Location,Uom,
        Outlet_Counters,Direct_Sales,Sale_Details,Sale_Items,Invoices,Invoice_Details,Receipts,Receipt_Details,Customers,Bills,
        Bill_Details,Payments,Payment_Details,Vendors,Sale_Orders,Sale_Order_Details,Delivery_Orders,Delivery_Order_Details,Direct_Purchases,
        Purchase_Details,Purchase_Items,

        Default_Settings
    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('Inventory Management');
        const cachedComponents = computed(() =>  Array.from(store.state.pageTab.invArray));
        const tabs = computed({
            get: ()=> store.state.pageTab.invArray,
        });

        const activeTab = computed(() => store.state.pageTab.invActiveTab);
    
        const activeComponent = computed(() => activeTab.value);
    
        const selectTab = (pageName) => {
            for(const [key, value] of Object.entries(pageName)){
                store.state.pageTab.invActiveTab = value;
            }
        };
        const selectedTab = (pageName) => {
            store.state.pageTab.invActiveTab = pageName;
        };
        const closeTab = (pageName) =>{
            let page = {"INV":pageName};
            store.commit('pageTab/REMOVE_PAGE', page)
            store.commit(`${pageName}/RESET_SEARCH_FILTERS`)
            activeTab.value = store.state.pageTab.invActiveTab;
            store.commit(`${pageName}/initializeStore`);
        }
        const minimize = () =>{
            store.commit('modulesTab/MINIMIZE_TAB')
        }
        const close = () =>{
            let myArray = Array.from(tabs.value);
            for(let i=0; i<myArray.length; i++){
                store.commit(`${myArray[i]}/RESET_SEARCH_FILTERS`)
                store.commit(`${myArray[i]}/initializeStore`)
            }
            store.commit('modulesTab/REMOVE_TAB', {'INV':'Inventory Management'}),
            store.commit('pageTab/CLEAR_PAGE_TAB', 'Inventory Management');
            activeTab.value = store.state.pageTab.invActiveTab;
        }
        return{
            close,
            minimize,
            title,
            activeComponent,
            selectTab, selectedTab, closeTab,
            activeTab, cachedComponents
        }
    },
    mounted(){
        const store = useStore();
        this.activeTab = store.state.pageTab.invActiveTab;
    }
}
</script>

<style>
.tab-content{
    margin-top: 35px;
}
.main-container{
    max-height: 100vh;
    overflow: hidden;
}

</style>