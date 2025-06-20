<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewUser"
            :searchFilters="searchFilters"
            @searchPage="searchUsers"
            @resetFilters="resetFilters"
            @removeItem="removeUser"
            @removeSelectedItems="removeUsers"
            @printList="printList"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="userList"
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
        <MovableModal v-model:visible="propModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
            :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal" >
            <div class="flex mb-3 items-end px-2">
                <div class="basis-1/4 mr-3">
                    <input type="text" class="rounded pl-3 border-2 border-gray-200 text-sm w-full" name="name" id="" placeholder="Permission Name...." v-model="permission_name_search">
                </div>
                <div class="basis-1/4 mr-3">
                    <input type="text" class="rounded pl-3 border-2 border-gray-200 text-sm w-full" name="name" id="" placeholder="Module Name...." v-model="module_name_search">
                </div>
                <div class="basis-1/4 mr-3">
                    <input type="text" class="rounded pl-3 border-2 border-gray-200 text-sm w-full" name="name" id="" placeholder="Status...." v-model="rights_status_search">
                </div>
                <div class="basis-1/4 flex">
                    <div class="basis-1/2 mr-2">
                    <button class="rounded bg-green-400 text-sm text-white px-3 py-2" @click="assignRights"><i class="fa fa-check-circle" aria-hidden="true"></i>Assign</button>
                    </div>
                    <div class="basis-1/2">
                    <button class="rounded bg-red-400 text-sm px-3 py-2" @click="disableRights"><i class="fa fa-times-circle" aria-hidden="true"></i>Disable</button>
                    </div>
                </div>
            </div>
            <div class="min-h-[350px]">
                <DynamicTable :key="tableKey" :columns="rightsColumns" :rows="filterPermissions" :showActions="showActions" :idField="rightIdField" @selection-changed="selectionChanged" />
            </div>
        </MovableModal>
        <MovableModal v-model:visible="compModalVisible" :title="title1" :modal_top="modal_top" :modal_left="modal_left1" :modal_width="modal_width1"
            :loader="modal_loader1" @showLoader="showCompModalLoader" @hideLoader="hideCompModalLoader" @closeModal="closeCompModal">
            <div class="relative mb-6 mt-3 min-w-[500px]">
                <SearchableDropdown
                    :key="compComponentKey"
                    :options="companiesArr"
                    :dropdownWidth="dropdownWidth"
                    @option-selected="handleSelectedCompany"
                    @clearSearch="clearSelectedCompany"   
                    @fetchData="fetchCompanies"                              
                />
                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="addUserCompany()"><i class="fa fa-check"></i></button>
            </div>
            <div class="min-h-[200px]">
                <DynamicTable :key="tableCompKey" :columns="companyColumns" :rows="companyRows" :idField="compIdField" @selection-changed="selectionCompChanged" :rightsModule="rightsModule" :actions="compActions" @action-click="removeUserCompany" />
            </div>
        </MovableModal>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import MovableModal from '@/components/MovableModal.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import DynamicTable from '../DynamicTable.vue';

import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import Swal from 'sweetalert2';


export default{
    name: 'Users',
    components:{
        PageComponent,MovableModal,DynamicTable,SearchableDropdown
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const tableKey = ref(0);
        const compComponentKey = ref(0);
        const modal_loader = ref('none');
        const tableCompKey = ref(0);
        const modal_loader1 = ref('none');
        const modal_top = ref('120px');
        const modal_left = ref('250px');
        const modal_left1 = ref('400px');
        const modal_width = ref('55vw');
        const modal_width1 = ref('40vw');
        const title = ref('Assign User Rights');
        const title1 = ref('User Allowed Companies');
        const addButtonLabel = ref('Add New User');
        const idField = 'user_id';
        const rightIdField = 'permission_id';
        const compIdField = 'company_id';
        const addingRight = ref('Adding User');
        const rightsModule = ref('Settings');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const selectedPermissions = ref([]);
        const selectedCompanies = ref([]);
        const userList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const compModalVisible = ref(false);
        const showModal = ref(false);
        const companiesArr = computed(() => store.state.Companies.companyArr);
        const dropdownWidth = ref("320px");
        const permissionsArray = computed(()=> store.state.User_Rights.rightsList);
        const companyModulesArray = computed(()=> store.state.Companies.companyModulesArray);
        const permission_name_search = ref('');
        const module_name_search = ref('');
        const rights_status_search = ref('');
        const filterPermissions = computed(() => {
            return permissionsArray.value.filter(perm => {
                const permissionName = perm.permission_name.toLowerCase().includes(permission_name_search.value.toLowerCase());
                const moduleName = perm.module.toLowerCase().includes(module_name_search.value.toLowerCase());
                const statusName = perm.status.toLowerCase().includes(rights_status_search.value.toLowerCase());
                return permissionName && moduleName && statusName;
            });
        });
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "F. Name", key:"first_name"},
            {label: "L. Name", key:"last_name"},
            {label: "Email", key:"email"},
            {label: "Phone No", key: "phone_number"},
            {label: "ID Number", key:"identification_no"},
            {label: "Profile", key:"profile"},
            {label: "Department", key:"user_department"},
            {label: "Status", key:"is_active"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit User', rightName: 'Editing User'},
            {name: 'assign', icon: 'fa fa-check-circle', title: 'Assign Rights', rightName: 'Assigning User Rights'},
            {name: 'lock', icon: 'fa fa-lock', title: 'Lock User', rightName: 'Locking User'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete User', rightName: 'Deleting User'},
        ]);
        const showActions = ref(false);
        const rightsColumns = ref([
            {type: "checkbox"},
            {label: "Name", key:"permission_name",type: "text", editable: false},
            {label: "Module", key: "module", type: "text", editable: false},
            {label: "Status", key: "status", type: "text", editable: false}
        ]);
        const rightsRows = computed(() => store.state.User_Rights.rightsList);

        const companyColumns = ref([
            {type: "checkbox"},
            {label: "Company Name", key:"company_name",type: "text", editable: false},
        ]);
        const compActions = ref([
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Company', rightName: 'User Allowed Companies'},
        ]);
        const companyRows = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const staffID = ref(null);
        const userCompID = ref(null);
        const userCompName = ref(null);
        const name_search = computed({
            get: () => store.state.userData.name_search,
            set: (value) => store.commit('userData/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const phone_number_search = computed({
            get: () => store.state.userData.phone_number_search,
            set: (value) => store.commit('userData/SET_SEARCH_FILTERS', {"phone_number_search":value}),
        });
        const status_search = computed({
            get: () => store.state.userData.status_search,
            set: (value) => store.commit('userData/SET_SEARCH_FILTERS', {"status_search":value}),
        });
        const id_number_search = computed({
            get: () => store.state.userData.id_number_search,
            set: (value) => store.commit('userData/SET_SEARCH_FILTERS', {"id_number_search":value}),
        });
        const profile_search = computed({
            get: () => store.state.userData.profile_search,
            set: (value) => store.commit('userData/SET_SEARCH_FILTERS', {"profile_search":value}),
        });
        const depArray = computed(() => store.state.Departments.depArr);
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:48,},
            {type:'text', placeholder:"ID Number...", value: id_number_search, width:48,},
            {type:'text', placeholder:"Phone No...", value: phone_number_search, width:48,},
            {
                type:'search-dropdown', value: depArray, width:48,
                selectOptions: depArray,
                searchPlaceholder: 'Department...', dropdownWidth: '300px',
                fetchData: store.dispatch('Departments/fetchDepartments', {company:companyID.value})
            },
            {
                type:'dropdown', placeholder:"Status", value: status_search, width:48,
                options: [{text:'Active',value:'True'},{text:'Inactive',value:'False'}]
            },
            {
                type:'dropdown', placeholder:"Profile", value: profile_search, width:48,
                options: [{text:'Admin',value:'Admin'},{text:'Property Manager',value:'Property Manager'},{text:'Accountant',value:'Accountant'},{text:'Human Resource',value:'Human Resource'},{text:'Credit Officer',value:'Credit Officer'},{text:'Doctor',value:'Doctor'},{text:'Office Clerk',value:'Office Clerk'},{text:'Clinical Officer',value:'Clinical Officer'}]
            },
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const selectionChanged = (ids) => {
            selectedPermissions.value = ids;
        };
        const selectionCompChanged = (ids) => {
            selectedCompanies.value = ids;
        };

        const removeUser = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    users: selectedIds.value
                }
                try{
                    const response = await store.dispatch('userDara/deleteUser',formData)
                    if(response && response.status == 200){
                        toast.success("User Removed Succesfully");
                        searchUsers();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove User: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 User") 
            }else{
                toast.error("Please Select A User To Remove")
            }
        }
        const removeUsers = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    users: selectedIds.value
                }
                try{
                    const response = await store.dispatch('userData/deleteUser',formData)
                    if(response && response.status == 200){
                        toast.success("User(s) Removed Succesfully");
                        searchUsers();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove User: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A User To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchUsers = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                user_department: "",
                name: name_search.value,
                is_active: status_search.value,
                identification_no: id_number_search.value,
                profile: profile_search.value,
                phone_number: phone_number_search.value,
                company_id: companyID.value,
            } 
            axios
            .post(`api/v1/staff-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                userList.value = response.data.results;
                store.commit('userData/LIST_USERS', userList.value)
                propResults.value = response.data;
                propArrLen.value = userList.value.length;
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
            store.commit('userData/RESET_SEARCH_FILTERS');
            staffID.value = "";
            searchUsers();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchUsers();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchUsers();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchUsers();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchUsers();
            // scrollToTop();
        }
        const addNewUser = async() =>{
            store.commit('userData/initializeStore');
            await store.dispatch('userData/updateState', {selectedUser: null,selectedDepartment:null, isEditing: false});
            store.commit('pageTab/ADD_PAGE', {'SET':'User_Details'});
            store.state.pageTab.setActiveTab = 'User_Details';          
        };
        const fetchSystemRights = async(userID) =>{
            let formData = {
                company_modules: companyModulesArray.value,
                user: userID
            }
            await store.dispatch('User_Rights/fetchRights',formData)
        };
        const fetchCompanies = async() =>{
            let formData = {
                company_name: "",
                status: "Active"
            }
            await store.dispatch("Companies/fetchCompanies", formData)
        };
        const fetchUserCompanies = async(userID) =>{
            let formData = {
                user: userID,
            }
            axios.post("api/v1/user-companies-search/", formData)
            .then((response)=>{
                companyRows.value = response.data.companies;
            })
            .catch((error)=>{
                console.log(error.message)
            })
        };
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const userID = row[idField];
                let formData = {
                    company: companyID.value,
                    staff: userID,
                }
                await store.dispatch('userData/fetchUser',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'SET':'User_Details'})
                    store.state.pageTab.setActiveTab = 'User_Details';
                })
            }else if(action == 'delete'){
                const userID = [row[idField]];
                let formData = {
                    users: userID
                }
                await store.dispatch('userData/deleteUser',formData).
                then(()=>{
                    searchUsers();
                })
            }else if(action == 'lock'){
                const userID = [row[idField]];
                const userStatus = row['is_active'];
                let formData = {
                    users: userID
                }
                if (userStatus == "Active"){
                    await store.dispatch('userData/lockUser',formData).
                    then(()=>{
                        searchUsers();
                    })
                }else{
                    await store.dispatch('userData/unlockUser',formData).
                    then(()=>{
                        searchUsers();
                    })
                }  
            }
            else if(action == 'assign'){
                const userID = row[idField];
                staffID.value = userID;
                try {
                    await fetchSystemRights(userID);
                    propModalVisible.value = true;
                } catch (error) {
                    console.error('Error fetching system rights:', error);
                }
                
            }
            else if(action == 'allowed-company'){
                fetchCompanies();
                const userID = row[idField];
                staffID.value = userID;
                try {
                    await fetchUserCompanies(userID);
                    compModalVisible.value = true;
                } catch (error) {
                    console.error('Error fetching user companies:', error);
                }
                
            }
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        };
        const assignRights = () =>{
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Assign Right(s)?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Assign Right(s)!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                let formData ={
                    user: staffID.value,
                    permission_array: selectedPermissions.value
                }
                axios.post(`api/v1/create-user-permission/`,formData)
                .then((response)=>{
                    if(response.data.msg == "Success"){
                        Swal.fire("Right(s) Assigned succesfully!", {
                            icon: "success",
                        }); 
                        fetchSystemRights(staffID.value);  
                        selectedPermissions.value = [];
                    }else{
                        Swal.fire({
                            title: "Error Assigning Right(s)",
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
                })
            }else{
                Swal.fire(`Right(s) Not Assigned!`);
            }
            })
        };
        const disableRights = () =>{
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Disable Right(s)?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Disable Right(s)!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                let formData ={
                    user: staffID.value,
                    permission_array: selectedPermissions.value
                }
                axios.post(`api/v1/disable-user-permission/`,formData)
                .then((response)=>{
                    if(response.data.msg == "Success"){
                        Swal.fire("Right(s) Disabled succesfully!", {
                            icon: "success",
                        }); 
                        fetchSystemRights(staffID.value); 
                        selectedPermissions.value = [];
                    }else{
                        Swal.fire({
                            title: "Error Disabling Right(s)",
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
                })
            }else{
                Swal.fire(`Right(s) Not Disabled!`);
            }
            })
        };
        const closeModal = () =>{
            propModalVisible.value = false;
        };

        const handleSelectedCompany = async(option) =>{
            await store.dispatch('Companies/handleSelectedCompany', option)
            userCompID.value = store.state.Companies.companyID;
            userCompName.value = store.state.Companies.companyName;

        };
        const clearSelectedCompany = async() =>{
            await store.dispatch('Companies/updateState', {companyID: '', companyName: ""});
            userCompID.value = "";
            userCompName.value = "";
        }

        const showCompModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideCompModalLoader = () =>{
            modal_loader.value = "none";
        };
        const addUserCompany = () =>{
            let formData = {
                user: staffID.value,
                company: userCompID.value
            }
            axios.post("api/v1/create-user-company/", formData)
            .then((response)=>{
                if(response.data.msg === "Failed"){
                    toast.error("User Already Assigned This Company") 
                    compComponentKey.value += 1;
                }
                else{
                    toast.success("User Company Added Succesfully")
                    compComponentKey.value += 1;
                    fetchUserCompanies(staffID.value);
                }
                
            })
            .catch((error)=>{
                console.log(error.message);
                toast.error(error.message) 
            })
        };
        const removeUserCompany = (rowIndex, action, row) =>{
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Remove Company?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Remove Company!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                let formData ={
                    user: staffID.value,
                    user_company: row['allowed_company_id']
                }
                axios.post(`api/v1/delete-user-company/`,formData)
                .then((response)=>{
                    if(response.data.msg == "Success"){
                        Swal.fire("Company Removed succesfully!", {
                            icon: "success",
                        }); 
                        fetchUserCompanies(staffID.value); 
                        selectedPermissions.value = [];
                    }else{
                        Swal.fire({
                            title: "Error Removing Company",
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
                })
            }else{
                Swal.fire(`Company Not Removed!`);
            }
            })
        };
        const closeCompModal = () =>{
            compModalVisible.value = false;
        };
        const dropdownOptions = ref([
            {label: 'Reset Password', action: 'reset-password'},
        ]);
        const handleDynamicOption = (option) =>{
            if(option == 'reset-password'){
                Swal.fire({
                    title: "Are you sure?",
                    text: `Do you wish to Reset Password?`,
                    type: 'warning',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Yes Reset Password!',
                    cancelButtonText: 'Cancel!',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom',
                    },
                    showLoaderOnConfirm: true,
                    }).then((result) => {
                    if (result.value) {
                        let formData ={
                            users: selectedIds.value,
                            company: companyID.value
                        }
                        axios.post(`api/v1/user-reset-password/`,formData)
                        .then((response)=>{                       
                            Swal.fire(response.data.msg, {
                                icon: "success",
                            });                  
                        })
                        .catch((error)=>{
                            console.log(error.message);
                            Swal.fire({
                                title: error.message,
                                icon: "warning",
                            });
                        })
                        .finally(()=>{
                            searchUsers();
                        })

                    }else{
                        Swal.fire(`Password has not been reset!`);
                    }           
                })
            }
        };
        onBeforeMount(()=>{
            searchUsers();
            store.dispatch('Companies/updateState', {companyID: companyID.value})
        });
        onMounted(() =>{
            store.dispatch('Companies/getCompanyModules')
        });
        return{
            title, title1,searchUsers,resetFilters, addButtonLabel, searchFilters, tableColumns, userList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, compModalVisible, closeModal,closeCompModal,
            submitButtonLabel, showModal, addNewUser, showLoader, loader, hideLoader, removeUser, removeUsers,
            handleSelectionChange,addingRight,rightsModule,showModalLoader,showCompModalLoader,hideModalLoader,hideCompModalLoader,modal_loader,modal_loader1,permission_name_search,
            module_name_search,rights_status_search,assignRights,disableRights,rightsColumns,rightsRows,modal_top,modal_left,modal_left1,modal_width,modal_width1,
            showActions,tableKey,tableCompKey,filterPermissions,rightIdField,compIdField,selectionChanged,selectionCompChanged,addUserCompany,removeUserCompany,
            companiesArr,dropdownWidth,companyColumns,companyRows,handleSelectedCompany,clearSelectedCompany,compActions,compComponentKey,handleDynamicOption,dropdownOptions
        }
    }
};
</script>