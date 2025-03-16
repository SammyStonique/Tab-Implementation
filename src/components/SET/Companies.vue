<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewCompany"
            :searchFilters="searchFilters"
            @searchPage="searchCompanies"
            @resetFilters="resetFilters"
            @removeItem="removeCompany"
            @removeSelectedItems="removeCompanies"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="companyList"
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
        />
    </div>
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal">
        <div>
            <label for="" class="mb-2 mr-3">Select Company Logo(png/jpg/jpeg):<em>*</em></label>
            <input type="text" name="" class="rounded border-2 border-gray-600 text-gray-500 text-sm pl-2 mr-2 mb-4 w-80 h-8" placeholder="" v-model="imageName" >
            <input type="file" name="file-input" @change="onFileChange" id="file-input" accept="image/jpg, image/png, image/jpeg"><br />
            <!-- <label class="rounded border bg-gray-200 px-2 py-1.5 w-30 cursor-pointer mr-6" for="file-input">Browse...</label> -->
            <button type="button" class="rounded bg-green-400 text-sm mt-3 w-24 text-white px-2 py-1.5" @click="uploadCompanyLogo">Upload</button>
        </div>
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import MovableModal from '@/components/MovableModal.vue'

export default{
    name: 'Companies',
    components:{
        PageComponent,MovableModal
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Company Logo');
        const depModalVisible = ref(false);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const imageLogo = ref('');
        const imageName = ref('');
        const idField = 'company_id';
        const addButtonLabel = ref('New Company');
        const addingRight = ref('Adding Company');
        const rightsModule = ref('Settings');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const companyList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Company Name", key:"name"},
            {label: "Email", key:"email"},
            {label: "Phone No", key:"phone_number"},
            {label: "Reg No", key:"registration_number"},
            {label: "Regime", key:"regime"},
            {label: "Status", key: "status"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Company', rightName: 'Editing Company'},
            {name: 'lock', icon: 'fa fa-lock', title: 'Lock Company', rightName: 'Locking Company'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Company', rightName: 'Deleting Company'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Companies.name_search,
            set: (value) => store.commit('Companies/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const status_search = computed({
            get: () => store.state.Companies.status_search,
            set: (value) => store.commit('Companies/SET_SEARCH_FILTERS', {"status_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:48,},
            {
                type:'dropdown', placeholder:"Status", value: status_search, width:48,
                options: [{text:'Active',value:'Active'},{text:'Inactive',value:'Inactive'}]
            },
        ]);

        const onFileChange = (e) =>{
            imageLogo.value = e.target.files[0];
            imageName.value = "C:\\fakepath\\" + imageLogo.value.name;
    
        };

        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        };

        const uploadCompanyLogo = () =>{
            showModalLoader();
   
            let formData = new FormData();
            formData.append('image', imageLogo.value);
            formData.append('company', companyID.value);

            axios.post('api/v1/upload-company-logo/', formData).
            then((response)=>{
                toast.success('Success');
                closeModal();
            })
            .catch((error)=>{
                toast.error(error.message);
            })
            .finally(()=>{
                hideModalLoader();
            })
        };

        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const removeCompany = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Companies/deleteCompany',formData)
                    if(response && response.status == 200){
                        toast.success("Company Removed Succesfully");
                        searchCompanies();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Company: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Company") 
            }else{
                toast.error("Please Select A Company To Remove")
            }
        }
        const removeCompanies = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Companies/deleteCompany',formData)
                    if(response && response.status == 200){
                        toast.success("Company(s) Removed Succesfully");
                        searchCompanies();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Company: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Company To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchCompanies = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                company_name: name_search.value,
                status: status_search.value
            } 
            axios
            .post(`api/v1/companies-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                companyList.value = response.data.results;
                store.commit('Companies/LIST_COMPANIES', companyList.value)
                propResults.value = response.data;
                propArrLen.value = companyList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / 50);
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
        }
        const resetFilters = () =>{
            store.commit('Companies/RESET_SEARCH_FILTERS')
            searchCompanies();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchCompanies();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchCompanies();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchCompanies();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchCompanies();
            // scrollToTop();
        }
        const addNewCompany = async() =>{
            store.commit('Companies/initializeStore');
            await store.dispatch('Companies/updateState', {selectedCompany: null, isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'SET':'Company_Details'});
            store.state.pageTab.setActiveTab = 'Company_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const companyName = row['name'];
                const companyStatus = row['status'];
                let formData = {
                    company_name: companyName,
                    status: companyStatus
                }
                await store.dispatch('Companies/fetchCompany',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'SET':'Company_Details'})
                    store.state.pageTab.setActiveTab = 'Company_Details';
                })
            }else if(action == 'delete'){
                const companyID = row['company_id'];
                let formData = {
                    company: companyID
                }
                await store.dispatch('Companies/deleteCompany',formData).
                then(()=>{
                    searchCompanies();
                })
            }else if(action == 'lock'){
                const companyStatus = row['status'];
            
                let formData = {
                    company: row['company_id'],
                    name: row['name'],
                    kra_pin: row['kra_pin'],
                    town: row['town'],
                    address: row['address'],
                    email: row['email'],
                    phone_number: row['phone_number'],
                    registration_number: row['registration_number'],
                    country: row['country'],
                    status: row['status'] == "Inactive" ? "Active" : "Inactive",
                    pms_module: row['pms_module'],
                    accounts_module: row['accounts_module'],
                    hr_module: row['hr_module'],
                    inventory_module: row['inventory_module'],
                    hms_module: row['hms_module'],
                    settings_module: row['settings_module'],
                };

                if(companyStatus == "Active"){
                    await store.dispatch('Companies/lockCompany',formData).
                    then(()=>{
                        searchCompanies();
                    })
                }else{
                    await store.dispatch('Companies/unlockCompany',formData).
                    then(()=>{
                        searchCompanies();
                    })
                }
                

            }
        }
        const closeModal = () =>{
            depModalVisible.value = false;
        };
        const dropdownOptions = ref([
            {label: 'Upload Logo', action: 'set-logo'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'set-logo'){
                depModalVisible.value = true;
                imageLogo.value = "";
            }
        };
        onBeforeMount(()=>{
            searchCompanies();
            
        })
        return{
            searchCompanies,resetFilters, addButtonLabel, searchFilters, tableColumns, companyList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, closeModal,
            submitButtonLabel, showModal, addNewCompany, showLoader, loader, hideLoader, removeCompany, removeCompanies,
            handleSelectionChange,addingRight,rightsModule,dropdownOptions,handleDynamicOption,onFileChange,imageLogo,imageName,
            depModalVisible,showModalLoader,hideModalLoader,uploadCompanyLogo,title,modal_top,modal_width,modal_left
        }
    }
};
</script>