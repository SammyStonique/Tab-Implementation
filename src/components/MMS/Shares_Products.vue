<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewProduct"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchProducts"
            @resetFilters="resetFilters"
            @removeItem="removeProduct"
            @removeSelectedItems="removeProducts"
            @printList="printproductsList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="productsList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            :count="propCount"
            :currentPage="currentPage"
            :result="propArrLen"
            @loadPrev="loadPrev"
            @loadNext="loadNext"
            @firstPage="firstPage"
            @lastPage="lastPage"
            :showNextBtn="showNextBtn"
            :showPreviousBtn="showPreviousBtn"
            :selectedValue="selectedValue"
            @selectSearchQuantity="selectSearchQuantity"
            :showDetails="showDetails"
            :detailsTitle="detailsTitle"
            @hideDetails="hideDetails"
        />
    </div>
    <MovableModal v-model:visible="transModalVisible" :title="transTitle" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="trans_modal_loader" @showLoader="showTransModalLoader" @hideLoader="hideTransModalLoader" @closeModal="closeTransModal">
        <div class="mt-4 mb-8 w-full">       
            <label for="">Date:</label><br />
            <input v-model="exit_date"  type="date" class="`bg-slate-50 rounded pl-3 border border-gray-400 text-base w-full`"/>
        </div>
        <div class="mb-8 w-full">         
            <label for="">Select Product Status:</label><br />
            <select v-model="product_status" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                <option value="" selected disabled>Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div class="flex-1 basis-full px-2">
            <button @click="changeProductStatus" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Change Status</button>
        </div>
    </MovableModal>

</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '@/components/NewDynamicForm.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import Swal from 'sweetalert2';

export default{
    name: 'Shares_Products',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const displayButtons = ref(true);
        const unitComponentKey = ref(0);
        const trans_modal_loader = ref('none');
        const product_status = ref('');
        const exit_date = ref('');
        const idField = 'shares_product_id';
        const addButtonLabel = ref('New Shares Product');
        const addingRight = ref('Adding Shares Products');
        const rightsModule = ref('MMS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const productsList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const detailsTitle = ref('Approval');
        const transTitle = ref('Changing Product Status');
        const transModalVisible = ref(false);
        const dropdownWidth = ref("500px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Date", key:"date"},
            {label: "Code", key:"product_code"},
            {label: "Product Name", key:"product_name"},
            {label: "Amount", key: "amount"},
            {label: "Type", key: "share_type"},
            {label: "Category", key:"member_category"},
            {label: "Mandatory", key:"mandatory"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Product', rightName: 'Editing Shares Products'},
            {name: 'transfer', icon: 'fa fa-exchange', title: 'Change Product Status', rightName: 'Changing Product Status'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Product', rightName: 'Deleting Shares Products'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const productID = ref("");
        const dropdownOptions = ref([
            
        ]);
        
        const name_search = ref('');
        const product_code_search = ref("");
        const active_status_search = ref("");
 
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Code...", value: product_code_search, width:48,},
            {
                type:'dropdown', placeholder:"Status..", value: active_status_search, width:40,
                options: [{text:'Active',value:'Active'},{text:'Inactive',value:'Inactive'}]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const removeProduct = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    savings_product: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Shares_Products/deleteSharesProduct',formData)
                    if(response && response.status == 200){
                        toast.success("Product Removed Succesfully");
                        searchProducts();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Product: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Product") 
            }else{
                toast.error("Please Select A Product To Remove")
            }
        }
        const removeProducts = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    savings_product: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Shares_Products/deleteSharesProduct',formData)
                    if(response && response.status == 200){
                        toast.success("Product(s) Removed Succesfully");
                        searchPropertys();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Product: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Product To Remove")
            }
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const changeProductStatus = async() =>{
            showTransModalLoader();
            let formData = {
                savings_product: productID.value,
                company: companyID.value
            }
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Change Status?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes, Change Status!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/change-shares-product-status/`,formData)
                .then((response)=>{
                if(response.data.msg == "Success"){
                    Swal.fire("Status changed succesfully!", {
                        icon: "success",
                    }); 
                    unitComponentKey.value += 1;
                    closeTransModal();
                    searchProducts();
                }else{
                    Swal.fire({
                    title: "Error Changing Product Status",
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
                    hideTransModalLoader();
                })
            }else{
                Swal.fire(`Product Status has not been changed!`);
                hideTransModalLoader();
            }
            })     
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            productID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchProducts = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                product_name: name_search.value,
                product_code: product_code_search.value,
                active_status: active_status_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/share-products-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                productsList.value = response.data.results;
                store.commit('Shares_Products/LIST_PRODUCTS', productsList.value)
                propResults.value = response.data;
                propArrLen.value = productsList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / selectedValue.value);
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchProducts(selectedValue.value);
        };
        const resetFilters = () =>{
            selectedValue.value = 50;
            name_search.value = "";
            active_status_search.value = "";
            product_code_search.value = "";
            searchProducts();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchProducts();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchProducts();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchProducts();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchProducts();
            // scrollToTop();
        }
        const addNewProduct = async() =>{
            store.commit('Shares_Products/initializeStore');
            await store.dispatch('Shares_Products/updateState', {selectedProduct: null,selectedCategory: null,selectedDeclarationLedger: null,selectedWithholdingLedger: null,isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'MMS':'Share_Product_Details'});
            store.state.pageTab.mmsActiveTab = 'Share_Product_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                await store.dispatch('Shares_Products/updateState', {selectedProduct: null,selectedCategory: null,selectedDeclarationLedger: null,selectedWithholdingLedger: null,isEditing: false});
                const productID = row[idField];
                let formData = {
                    company: companyID.value,
                    shares_product: productID
                }
                await store.dispatch('Shares_Products/fetchSharesProduct',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'MMS':'Share_Product_Details'})
                    store.state.pageTab.mmsActiveTab = 'Share_Product_Details';
                })
            }else if(action == 'delete'){
                const productID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    shares_product: productID
                }
                await store.dispatch('Shares_Products/deleteSharesProduct',formData).
                then(()=>{
                    searchProducts();
                })
            }else if(action == 'transfer'){
                hideTransModalLoader();
                productID.value = row['shares_product_id'];
                transModalVisible.value = true;
            }
        };

        const handleDynamicOption = (option) =>{
            
        };
        
        const printproductsList = () =>{
            showLoader();
            let formData = {
                product_name: name_search.value,
                product_code: product_code_search.value,
                active_status: active_status_search.value,
                company_id: companyID.value,
            } 

            axios
            .post("api/v1/export-share-products-pdf/", formData, { responseType: 'blob' })
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
        const hideDetails = async() =>{
            showDetails.value = false;
        };
        onBeforeMount(()=>{
            searchProducts();
            
        })
        return{
            searchProducts,resetFilters, addButtonLabel, searchFilters, tableColumns, productsList,dropdownWidth,displayButtons,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,showDetails,detailsTitle,hideDetails,
            submitButtonLabel, showModal, addNewProduct, showLoader, loader, hideLoader, removeProduct, removeProducts,
            handleSelectionChange,addingRight,rightsModule,printproductsList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,changeProductStatus,closeTransModal,
            dropdownOptions,handleDynamicOption,product_status,exit_date
        }
    }
};
</script>