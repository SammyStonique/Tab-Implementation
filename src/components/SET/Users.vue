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
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Users',
    components:{
        PageComponent
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const idField = 'user_id';
        const addButtonLabel = ref('New User');
        const addingRight = ref('Adding User');
        const rightsModule = ref('Settings');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const userList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const showModal = ref(false);
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
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const depID = ref(null);
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
        const depArray = computed({
            get: () => store.state.Departments.depArr,
        });
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
                options: [{text:'Admin',value:'Admin'},{text:'Doctor',value:'Doctor'},{text:'Patient',value:'Patient'},{text:'Accountant',value:'Accountant'},{text:'Human Resource',value:'Human Resource'},{text:'Nurse',value:'Nurse'},{text:'Lab Technician',value:'Lab Technician'},{text:'Office Clerk',value:'Office Clerk'},{text:'Clinical Officer',value:'Clinical Officer'}]
            },
            
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
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
            .post(`api/v1/users-search/?page=${currentPage.value}`,formData)
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
            store.commit('userData/RESET_SEARCH_FILTERS')
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
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const userID = row[idField];
                const departmentID = row['user_department_id'];
                let formData = {
                    company: companyID.value,
                    staff: userID,
                    department: departmentID
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
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchUsers();
            
        })
        return{
            searchUsers,resetFilters, addButtonLabel, searchFilters, tableColumns, userList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, propModalVisible, closeModal,
            submitButtonLabel, showModal, addNewUser, showLoader, loader, hideLoader, removeUser, removeUsers,
            handleSelectionChange,addingRight,rightsModule
        }
    }
};
</script>