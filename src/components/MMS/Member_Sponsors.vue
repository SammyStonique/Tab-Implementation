<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewSponsor"
        :searchFilters="searchFilters"
        @searchPage="searchSponsors"
        @resetFilters="resetFilters"
        @removeItem="removeSponsor"
        @removeSelectedItems="removeSponsors"
        :addingRight="addingRight"
        :removingRight="removingRight"
        :rightsModule="rightsModule"
        :columns="tableColumns"
        :rows="sponsorList"
        :actions="actions"
        :idField="idField"
        @handleActionClick="handleActionClick"
        :count="depCount"
        :currentPage="currentPage"
        :result="depArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
    />
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader"  @closeModal="closeModal">
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveSponsor" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Member_Sponsors',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Sponsor Details');
        const addButtonLabel = ref('New Sponsor');
        const addingRight = ref('Adding Member Sponsors');
        const removingRight = ref('Deleting Member Sponsors');
        const rightsModule = ref('MMS');
        const idField = 'member_sponsor_id';
        const depModalVisible = ref(false);
        const sponsorList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Member_Sponsors.isEditing)
        const selectedSponsor = computed(()=> store.state.Member_Sponsors.selectedSponsor);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key: "sponsor_name", type: "text", editable: false},
            {label: "Count", key: "member_count", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Sponsor', rightName: 'Editing Member Sponsors'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Sponsor', rightName: 'Deleting Member Sponsors'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Search Name...", value: name_search}
        ]);
        const formFields = ref([]);
        const updateFormFields = (sponsor) => {
            formFields.value = [
                { type: 'text', name: 'name',label: "Name", value: sponsor?.sponsor_name || '', required: true },
            ];
        };
        watch(selectedSponsor, (newSponsor) => {
            updateFormFields(newSponsor);
        }, { immediate: true });
        const addNewSponsor = () =>{
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Member_Sponsors/updateState",{isEditing:false})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const sponsorID = row[idField];
                let formData = {
                    company: companyID.value,
                    member_sponsor: sponsorID
                }
                await store.dispatch('Member_Sponsors/fetchMemberSponsor',formData).
                then(()=>{
                    depModalVisible.value = true;
                    flex_basis.value = '1/2';
                    flex_basis_percentage.value = '50';
                })
                
            }else if(action == 'delete'){
                const sponsorID = [row[idField]];
                let formData = {
                    company: companyID.value,
                    member_sponsor: sponsorID
                }
                await store.dispatch('Member_Sponsors/deleteMemberSponsor',formData).
                then(()=>{
                    searchSponsors();
                })
            }
        } 
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
        const createSponsor = async() =>{
            showModalLoader();
            let formData = {
                sponsor_name: formFields.value[0].value,
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Member_Sponsors/createMemberSponsor', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Sponsor created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the Sponsor.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create Sponsor: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchSponsors();
                }
            }

        }
        const updateSponsor = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                sponsor_name: formFields.value[0].value,
                company: companyID.value,
                member_sponsor: selectedSponsor.value.member_sponsor_id
            }
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Member_Sponsors/updateMemberSponsor', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Sponsor updated successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while updating the Sponsor.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Sponsor: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchSponsors();
                }
            }
        }
        const saveSponsor = () =>{
            if(isEditing.value == true){
                updateSponsor();
            }else{
                createSponsor();
            }
        }
        const removeSponsor = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    member_sponsor: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Member_Sponsors/deleteMemberSponsor',formData)
                    if(response && response.status == 200){
                        toast.success("Sponsor Removed Succesfully");
                        searchSponsors();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Sponsor: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Sponsor") 
            }else{
                toast.error("Please Select A Sponsor To Remove")
            }
        }
        const removeSponsors = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    member_sponsor: selectedIds.value,
                }
                try{
                    const response = await store.dispatch('Member_Sponsors/deleteMemberSponsor',formData)
                    if(response && response.status == 200){
                        toast.success("Sponsor(s) Removed Succesfully");
                        searchSponsors();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Sponsor(s): ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Sponsor To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchSponsors = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                sponsor_name: name_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/member-sponsors-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                sponsorList.value = response.data.results;
                store.commit('Member_Sponsors/LIST_MEMBER_SPONSORS', sponsorList.value)
                depResults.value = response.data;
                depArrLen.value = sponsorList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / 50);
                
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchSponsors();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchSponsors();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchSponsors();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchSponsors();
        }
        const resetFilters = () =>{
            name_search.value = "";
            searchSponsors();
        };
        const closeModal = async() =>{
            depModalVisible.value = false;
            handleReset();
        }
        onMounted(()=>{
            searchSponsors();
        })
        return{
            title,idField, searchSponsors, addButtonLabel, searchFilters, resetFilters, tableColumns, sponsorList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewSponsor,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveSponsor,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeSponsor, removeSponsors,
            addingRight,removingRight,rightsModule, closeModal
        }
    }
}
</script>