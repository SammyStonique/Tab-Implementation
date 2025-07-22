<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewMember"
            :searchFilters="searchFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @searchPage="searchMembers"
            @resetFilters="resetFilters"
            @importData="importMembers"
            @removeItem="removeMember"
            @removeSelectedItems="removeMembers"
            @printList="printMembersList"
            :addingRight="addingRight"
            :removingRight="removingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="membersList"
            :actions="actions"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            :groupingKey=true
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
            <label for="">Select Member Status:</label><br />
            <select v-model="member_status" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                <option value="" selected disabled>Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div class="flex-1 basis-full px-2">
            <button @click="changeMemberStatus" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Change Status</button>
        </div>
    </MovableModal>
    <MovableModal v-model:visible="propModalVisible" :title="title1" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader1" @showLoader="showModalLoader1" @hideLoader="hideModalLoader1"  @closeModal="closeModal1">
        <div class="px-3">
            <div class="text-left mb-4">
                <label for="">Message:</label><br />
                <!-- <quill-editor :key="editorComponentKey" v-model:value="messageContent"></quill-editor> -->
                 <div class="flex">
                    <div class="basis-1/2 mb-4 mr-3">
                        <select v-model="selectedPlaceholder" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-1 w-full">
                            <option value="" disabled>Select Placeholder</option>
                            <option v-for="placeholder in placeholders" :key="placeholder.value" :value="placeholder.value">
                                {{ placeholder.label }}
                            </option>
                        </select>
                    </div>
                    <button @click="insertPlaceholder" :disabled="!selectedPlaceholder" class="w-24 h-8 rounded bg-green-400 text-sm mr-2  text-white px-2 py-0.5">Insert</button>
                </div>
                <textarea v-model="contentModel" ref="textareaRef" rows="8" cols="64" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2" placeholder="Type your content here..."></textarea>
            </div>
            <button @click="sendMemberSMS" class="rounded bg-green-400 text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>Send SMS</button>
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
import { quillEditor } from 'vue3-quill';
import { useTextareaEditor } from '@/composables/TextAreaEditor';

export default{
    name: 'Members',
    components:{
        PageComponent,MovableModal,SearchableDropdown,DynamicForm,quillEditor
    },
    setup(){
        const { contentModel,textareaRef,placeholders,selectedPlaceholder,insertPlaceholder,} = useTextareaEditor('');
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const displayButtons = ref(true);
        const unitComponentKey = ref(0);
        const catSearchComponentKey = ref(0);
        const trans_modal_loader = ref('none');
        const modal_loader1 = ref('none');
        const member_status = ref('');
        const messageContent = ref('');
        const exit_date = ref('');
        const idField = 'member_id';
        const addButtonLabel = ref('New Member');
        const addingRight = ref('Adding Members');
        const removingRight = ref('Deleting Members');
        const rightsModule = ref('MMS');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const membersList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const showDetails = ref(false);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const detailsTitle = ref('Member Documents');
        const transTitle = ref('Changing Member Status');
        const title1 = ref('SMS Member');
        const transModalVisible = ref(false);
        const propModalVisible = ref(false);
        const dropdownWidth = ref("500px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('45vw');
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const showModal = ref(false);
        const categoryID = ref("");
        const category_array = computed(()=> store.state.Member_Categories.categoryArr);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Member No", key:"member_number"},
            {label: "Member Name", key:"member_name"},
            {label: "Joining Date", key:"joining_date"},
            {label: "Phone No", key: "phone_number"},
            {label: "Email", key:"email"},
            {label: "Gender", key:"gender"},
            // {label: "Category", key:"member_category"},
            {label: "Savings", key:"total_savings", textColor: "savingsColor"},
            {label: "Free Savings", key:"formatted_free_savings", textColor: "freeSavingsColor"},
            {label: "Shares", key:"total_shares", textColor: "savingsColor"},
            {label: "Free Shares", key:"formatted_free_shares", textColor: "freeSharesColor"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Member', rightName: 'Editing Members'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Profile', rightName: 'Viewing Member Profile'},
            {name: 'transfer', icon: 'fa fa-exchange', title: 'Change Member Status', rightName: 'Changing Member Status'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Member', rightName: 'Deleting Members'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const memberID = ref("");
        
        const handleSelectedSearchCategory = async(option) =>{
            await store.dispatch('Member_Categories/handleSelectedCategory', option)
            categoryID.value = store.state.Member_Categories.categoryID;
        };
        const clearSelectedSearchCategory = async() =>{
            await store.dispatch('Member_Categories/updateState', {categoryID: ''});
            categoryID.value = store.state.Member_Categories.categoryID;
        };
        
        const name_search = ref('');
        const member_number_search = ref("");
        const active_status_search = ref("");
        const phone_number_search = ref("");
        const gender_search = ref("");
 
        const searchFilters = ref([
            {type:'text', placeholder:"Name...", value: name_search, width:48,},
            {type:'text', placeholder:"Member No...", value: member_number_search, width:32,},
            {type:'text', placeholder:"Phone No...", value: phone_number_search, width:36,},
            {
                type:'dropdown', placeholder:"Gender..", value: gender_search, width:24,
                options: [{text:'Male',value:'Male'},{text:'Female',value:'Female'},{text:'Others',value:'Others'}]
            },
            {
                type:'dropdown', placeholder:"Status..", value: active_status_search, width:24,
                options: [{text:'Active',value:'Active'},{text:'Inactive',value:'Inactive'}]
            },
            {
                type:'search-dropdown', value: category_array, width:48, componentKey: catSearchComponentKey,
                selectOptions: category_array, optionSelected: handleSelectedSearchCategory,
                searchPlaceholder: 'Member Category...', dropdownWidth: '200px',
                fetchData: store.dispatch('Member_Categories/fetchMemberCategories', {company:companyID.value}), clearSearch: clearSelectedSearchCategory
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const importMembers = () =>{
            store.commit('pageTab/ADD_PAGE', {'MMS':'Import_Members'})
            store.state.pageTab.mmsActiveTab = 'Import_Members';
        };

        const removeMember = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    member: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Members/deleteMember',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Member Removed Succesfully");
                        searchMembers();
                    }else if(response && response.data.msg == "Failed"){
                        toast.error("Failed to remove Member");
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Member: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Member") 
            }else{
                toast.error("Please Select A Member To Remove")
            }
        }
        const removeMembers = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    member: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Members/deleteMember',formData)
                    if(response && response.data.msg == "Success"){
                        toast.success("Member(s) Removed Succesfully");
                        searchMembers();
                    }else if(response && response.data.msg == "Failed"){
                        toast.error("Failed to remove Member");
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Member: ' + error.message);
                }
                finally{
                    selectedIds.value = [];

                }
            }else{
                toast.error("Please Select A Member To Remove")
            }
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const changeMemberStatus = async() =>{
            showTransModalLoader();
            let formData = {
                member: memberID.value,
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
                axios.post(`api/v1/change-member-status/`,formData)
                .then((response)=>{
                if(response.data.msg == "Success"){
                    Swal.fire("Status changed succesfully!", {
                        icon: "success",
                    }); 
                    unitComponentKey.value += 1;
                    closeTransModal();
                    searchMembers();
                }else{
                    Swal.fire({
                    title: "Error Changing Member Status",
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
                Swal.fire(`Member Status has not been changed!`);
                hideTransModalLoader();
            }
            })     
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            memberID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const showModalLoader1 = () =>{
            modal_loader1.value = "block";
        }
        const hideModalLoader1 = () =>{
            modal_loader1.value = "none";
        }
        const handleReset1 = () =>{
            contentModel.value = "";
            memberID.value = "";
        }
        const sendMemberSMS = async() =>{
            if(memberID.value && contentModel.value){
                showModalLoader1();
                let formData = {
                    content: contentModel.value,
                    member: memberID.value,
                    company: companyID.value
                }
                await axios.post('api/v1/member-general-sms/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("SMS Sent!")
                        closeModal1();
                        searchMembers();
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideModalLoader1();
                })
            }else if(memberID.value == ""){
                toast.error("No Member Selected!!")
            }else if(contentModel.value == ""){
                toast.error("Cannot Send Blank SMS!!")
            }
            
        }
       
        const searchMembers = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                member_name: name_search.value,
                member_number: member_number_search.value,
                active_status: active_status_search.value,
                gender: gender_search.value,
                phone_number: phone_number_search.value,
                member_category: categoryID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/members-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                membersList.value = response.data.results;
                store.commit('Members/LIST_MEMBERS', membersList.value)
                propResults.value = response.data;
                propArrLen.value = membersList.value.length;
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
            searchMembers(selectedValue.value);
        };
        const resetFilters = () =>{
            catSearchComponentKey.value += 1;
            categoryID.value = "";
            selectedValue.value = 50;
            currentPage.value = 1;
            name_search.value = "";
            gender_search.value = "";
            phone_number_search.value = "";
            active_status_search.value = "";
            member_number_search.value = "";
            searchMembers();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchMembers();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchMembers();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchMembers();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchMembers();
            // scrollToTop();
        }
        const addNewMember = async() =>{
            store.commit('Members/initializeStore');
            await store.dispatch('Members/updateState', {selectedMember: null,selectedCategory: null,selectedSponsor: null,selectedCurrency: null,isEditing: false});
            await store.dispatch('Membership_Fees/updateState', {feeArray: []})
            store.commit('pageTab/ADD_PAGE', {'MMS':'Member_Details'});
            store.state.pageTab.mmsActiveTab = 'Member_Details';          
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                await store.dispatch('Members/updateState', {selectedMember: null,selectedCategory: null,selectedSponsor: null,selectedCurrency: null,isEditing: false});
                const memberID = row[idField];
                let formData = {
                    company: companyID.value,
                    member: memberID
                }
                await store.dispatch('Members/fetchMember',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'MMS':'Member_Details'})
                    store.state.pageTab.mmsActiveTab = 'Member_Details';
                })
            }else if(action == 'delete'){
                const memberID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    member: memberID
                }
                const response = await store.dispatch('Members/deleteMember',formData)
                if(response && response.data.msg == "Success"){
                    toast.success("Member(s) Removed Succesfully");
                    searchMembers();
                }else if(response && response.data.msg == "Failed"){
                    toast.error("Failed to remove Member");
                }
            }else if(action == 'view'){
                await store.dispatch('Members/updateState', {currentTab: 'Members_Biodata',selectedMember: null,selectedCategory: null,selectedSponsor: null,selectedCurrency: null,isEditing: false});
                const memberID = row[idField];
                let formData = {
                    company: companyID.value,
                    member: memberID
                }
                await store.dispatch('Members/fetchMember',formData)
                store.commit('pageTab/ADD_PAGE', {'MMS':'Member_Profile'})
                store.state.pageTab.mmsActiveTab = 'Member_Profile';
            }else if(action == 'transfer'){
                hideTransModalLoader();
                memberID.value = row['member_id'];
                transModalVisible.value = true;
            }
        };
        const dropdownOptions = ref([
            {label: 'SMS Selected Member', action: 'send-sms', icon: 'fa-sms', colorClass: 'text-blue-500', rightName: 'Sending MMS SMS'},
        ]);
        const handleDynamicOption = async(option) =>{
            if(option == 'send-sms'){
                memberID.value = selectedIds.value;
                propModalVisible.value = true;
                
            }else if(option == 'send-email'){
                showLoader();
                const memberID = [];
                let formData = {
                    member: memberID,
                    company: companyID.value
                }
                await axios.post('api/v1/member-general-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        };
        
        const printMembersList = () =>{
            showLoader();
            let formData = {
                member_name: name_search.value,
                member_number: member_number_search.value,
                active_status: active_status_search.value,
                gender: gender_search.value,
                phone_number: phone_number_search.value,
                member_category: categoryID.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 

            axios
            .post("api/v1/export-members-pdf/", formData, { responseType: 'blob' })
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
        const closeModal1 = async() =>{
            propModalVisible.value = false;
            handleReset1();
        }
        onBeforeMount(()=>{
            searchMembers();
            
        })
        return{
            searchMembers,resetFilters, addButtonLabel, searchFilters, tableColumns, membersList,dropdownWidth,displayButtons,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,flex_basis,flex_basis_percentage,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,showDetails,detailsTitle,hideDetails,
            submitButtonLabel, showModal, addNewMember, showLoader, loader, hideLoader, importMembers, removeMember, removeMembers,
            handleSelectionChange,addingRight,removingRight,rightsModule,printMembersList,selectSearchQuantity,selectedValue,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,changeMemberStatus,closeTransModal,
            dropdownOptions,handleDynamicOption,member_status,exit_date,messageContent,modal_loader1,title1,showModalLoader1,hideModalLoader1,sendMemberSMS,propModalVisible,
            closeModal1,contentModel,textareaRef,placeholders,selectedPlaceholder,insertPlaceholder,
        }
    }
};
</script>