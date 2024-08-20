<template>
    <PageComponent 
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewDoctor"
        :searchFilters="searchFilters"
        @searchPage="searchDoctors"
        @resetFilters="resetFilters"
        :columns="tableColumns"
        :rows="doctList"
        :actions="actions"
        :idField="idField"
        @handleActionClick="handleActionClick"
        :count="doctCount"
        :currentPage="currentPage"
        :result="doctArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
    />
    <MovableModal v-model:visible="doctModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveDoctor" @handleReset="handleReset"
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
    name: 'Doctors',
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const title = ref('Doctor Details');
        const addButtonLabel = ref('New Doctor');
        const userID = ref('');
        const departmentID = ref('');
        const userComponentKey = ref(0);
        const userArray = computed(() => store.state.userData.userArr);
        const idField = 'doctor_id';
        const doctModalVisible = ref(false);
        const doctList = ref([]);
        const doctResults = ref([]);
        const doctArrLen = ref(0);
        const doctCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('40vw');
        const isEditing = computed(()=> store.state.Departments.isEditing)
        const selectedDoctor = computed(()=> store.state.Doctors.selectedDoctor);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "First Name", key:"first_name",type: "text", editable: false},
            {label: "Last Name", key: "last_name", type: "text", editable: false},
            {label: "Email", key: "email", type: "text", editable: false},
            {label: "Phone No", key: "phone_number", type: "text", editable: false},
            {label: "P.R No", key: "payroll_number", type: "text", editable: false},
            {label: "Department", key: "department", type: "text", editable: false},
            {label: "Specialization", key: "specialization", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Doctor'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Doctor'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const last_name_search = computed({
            get: () => store.state.Doctors.last_name_search,
            set: (value) => store.commit('Doctors/SET_SEARCH_FILTERS', {"last_name_search":value}),
        });
        const first_name_search = computed({
            get: () => store.state.Doctors.first_name_search,
            set: (value) => store.commit('Doctors/SET_SEARCH_FILTERS', {"first_name_search":value}),
        });
        const specialization_search = computed({
            get: () => store.state.Doctors.specialization_search,
            set: (value) => store.commit('Doctors/SET_SEARCH_FILTERS', {"specialization_search":value}),
        });
        const department_search = computed({
            get: () => store.state.Doctors.department_search,
            set: (value) => store.commit('Doctors/SET_SEARCH_FILTERS', {"department_search":value}),
        });
        const payroll_number_search = computed({
            get: () => store.state.Doctors.payroll_number_search,
            set: (value) => store.commit('Doctors/SET_SEARCH_FILTERS', {"payroll_number_search":value}),
        });
        const phone_number_search = computed({
            get: () => store.state.Doctors.phone_number_search,
            set: (value) => store.commit('Doctors/SET_SEARCH_FILTERS', {"phone_number_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"First Name...", value: first_name_search, width:52},
            {type:'text', placeholder:"Last Name...", value: last_name_search, width:52},
            {type:'text', placeholder:"Department...", value: department_search, width:52},
            {type:'text', placeholder:"Phone Number...", value: phone_number_search, width:52},
            {type:'text', placeholder:"Payroll Number...", value: payroll_number_search, width:52},
            {type:'text', placeholder:"Specialization...", value: specialization_search, width:52},
        ]);
        const handleSelectedUser = (option) =>{
            store.dispatch('userData/handleSelectedUser', option)
            .then(() => {
                userID.value = store.state.userData.userID;
                departmentID.value = store.state.userData.departmentID;
            })
        }
        const formFields = ref([]);
        const updateFormFields = (doctor) => {
            formFields.value = [
                {type:'text', name: 'first_name', label:"First Name", value: doctor?.first_name || '', required: true},
                {type:'text', name: 'last_name',label:"Last Name", value: doctor?.last_name || '', required: true},
                {type:'text', name: 'email',label:"Email", value: doctor?.email || '', required: true},
                {type:'text', name: 'phone_number',label:"Phone Number", value: doctor?.phone_number || '', required: true},
                {type:'text', name: 'specialization',label:"Specialization", value: doctor?.specialization || '', required: true},
                {type:'text', name: 'payroll_number',label:"Payroll Number", value: doctor?.payroll_number || '', required: true},
                {  
                    type:'search-dropdown', label:"System User", value: userID, componentKey: userComponentKey, 
                    selectOptions: userArray, optionSelected: handleSelectedUser, required: true,
                    searchPlaceholder: 'Select User...', dropdownWidth: '500px',
                    fetchData: store.dispatch('userData/fetchUsers', {company:companyID.value})
                },
            ];
        };
        watch(selectedDoctor, (newDoctor) => {
            updateFormFields(newDoctor);
        }, { immediate: true });
        const addNewDoctor = () =>{
            doctModalVisible.value = true;
            handleReset();
            store.dispatch("Doctors/updateState",{isEditing:false})
            flex_basis.value = '1/3';
            flex_basis_percentage.value = '33.333';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const doctID = row[idField];
                let formData = {
                    hospital: companyID.value,
                    doctor: doctID
                }
                await store.dispatch('Doctors/fetchDoctor',formData).
                then(()=>{
                    doctModalVisible.value = true;
                    flex_basis.value = '1/3';
                    flex_basis_percentage.value = '33.333';
                })
                
            }else if(action == 'delete'){
                const doctID = row[idField];
                let formData = {
                    hospital: companyID.value,
                    doctor: doctID
                }
                await store.dispatch('Doctors/deleteDoctor',formData).
                then(()=>{
                    searchDoctors();
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
        const createDoctor = async() =>{
            showModalLoader();
            let formData = {
                user_id: userID.value,
                first_name: formFields.value[0].value,
                last_name: formFields.value[1].value,
                email: formFields.value[2].value,
                phone_number: formFields.value[3].value,
                department: departmentID.value,
                specialization: formFields.value[4].value,
                payroll_number: formFields.value[5].value,
                hospital: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill in The Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Doctors/createDoctor', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Doctor created successfully!');
                        handleReset();
                        userComponentKey.value += 1;
                    }else {
                        toast.error('An error occurred while creating the doctor.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create doctor: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }

        }
        const updateDoctor = async() =>{
            errors.value = [];
            let formData = {
                user: userID.value,
                first_name: formFields.value[0].value,
                last_name: formFields.value[1].value,
                email: formFields.value[2].value,
                phone_number: formFields.value[3].value,
                department: selectedDoctor.value.user_department,
                specialization: formFields.value[4].value,
                payroll_number: formFields.value[5].value,
                hospital: companyID.value
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
                    const response = await store.dispatch('Doctors/updateDoctor', formData);
                    if(response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Doctor updated successfully!');
                        handleReset();
                        userComponentKey.value += 1;
                        doctModalVisible.value = false;
                    }else {
                        toast.error('An error occurred while updating the doctor.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update doctor: ' + error.message);
                } finally {
                    hideModalLoader();
                }
            }
        }
        const saveDoctor = () =>{
            if(isEditing.value == true){
                updateDoctor();
            }else{
                createDoctor();
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchDoctors = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                first_name: first_name_search.value,
                last_name: last_name_search.value,
                specialization: specialization_search.value,
                department: department_search.value,
                payroll_number: payroll_number_search.value,
                phone_number: phone_number_search.value,
                hospital: companyID.value,
            }
            axios
            .post(`api/v1/doctor-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                doctList.value = response.data.results;
                store.commit('Doctors/LIST_DOCTORS', doctList.value)
                doctResults.value = response.data;
                doctArrLen.value = doctList.value.length;
                doctCount.value = doctResults.value.count;
                pageCount.value = Math.ceil(doctCount.value / 50);
                
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
            
            searchDoctors();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchDoctors();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchDoctors();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchDoctors();
        }
        const resetFilters = () =>{
            store.commit('Doctors/RESET_SEARCH_FILTERS')
            searchDoctors();
        }
        onMounted(()=>{
            searchDoctors();
        })
        return{
            title,idField, searchDoctors, addButtonLabel, searchFilters, resetFilters, tableColumns, doctList,
            doctResults, doctArrLen, doctCount, pageCount, showNextBtn, showPreviousBtn, modal_top, modal_left,modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, doctModalVisible, addNewDoctor,
            displayButtons,flex_basis,flex_basis_percentage, handleActionClick, handleReset, saveDoctor,showLoader, loader, hideLoader
        }
    }
}
</script>