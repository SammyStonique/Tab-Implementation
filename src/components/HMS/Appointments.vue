<template>
    <PageComponent 
        :key="pageComponentKey"
        :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
        :addButtonLabel="addButtonLabel"
        @handleAddNew="addNewAppointment"
        :searchFilters="searchFilters"
        @searchPage="searchAppointments"
        @resetFilters="resetFilters"
        @importData="importAppointments"
        @removeItem="removeAppointment"
        @removeSelectedItems="removeAppointments"
        @printList="printList"
        :columns="tableColumns"
        :rows="appList"
        :actions="actions"
        :idField="idField"
        @handleSelectionChange="handleSelectionChange"
        @handleActionClick="handleActionClick"
        :count="appCount"
        :currentPage="currentPage"
        :result="appArrLen"
        @loadPrev="loadPrev"
        @loadNext="loadNext"
        @firstPage="firstPage"
        @lastPage="lastPage"
        :showNextBtn="showNextBtn"
        :showPreviousBtn="showPreviousBtn"
    />
    <MovableModal v-model:visible="appModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" @closeModal="closeModal"
    >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveAppointment" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted,watch } from 'vue';
import { useStore } from "vuex";
import PageComponent from "../PageComponent.vue";
import MovableModal from '@/components/MovableModal.vue'
import DynamicForm from '../NewDynamicForm.vue';
import { useDateFormatter } from '@/composables/DateFormatter';
import { useToast } from "vue-toastification";

export default{
    name: 'Appointments',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        PageComponent,MovableModal,DynamicForm
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const { formatDate } = useDateFormatter();
        const addButtonLabel = ref('New Appointment');
        const pageComponentKey = ref(0);
        const patComponentKey = ref(0);
        const doctComponentKey = ref(0);
        const title = ref('Apointment Details');
        const doctor_search = ref('');
        const appointment_date = new Date();
        const hospitalID = computed(()=> store.state.userData.company_id);
        const patientID = ref('');
        const patientName = ref('');
        const patArray = computed(() => store.state.Patients_List.patientsArr);
        const doctorID = ref('');
        const doctName = ref('');
        const doctArray = computed(() => store.state.Doctors.doctArr);
        const idField = 'appointment_id';
        const selectedIds = ref([]);
        const appModalVisible = ref(false);
        const appList = ref([]);
        const appResults = ref([]);
        const appArrLen = ref(0);
        const appCount = ref(0);
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
        const modal_width = ref('35vw');
        const isEditing = computed(()=> store.state.Appointments.isEditing);
        const selectedAppointment = computed(()=> store.state.Appointments.selectedAppointment);
        const selectedDoctor = computed(()=> store.state.Appointments.selectedDoctor);
        const selectedPatient = computed(()=> store.state.Appointments.selectedPatient);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Code", key:"patient_code",type: "text", editable: false},
            {label: "Patient", key:"patient_name",type: "text", editable: false},
            {label: "ID No", key: "patient_id_number", type: "text", editable: false},
            {label: "Doctor", key: "doctor_name", type: "text", editable: false},
            {label: "Date", key: "date", type: "text", editable: false},
            {label: "Time", key: "time", type: "text", editable: false},
            {label: "Notes", key: "notes", type: "text", editable: false},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Appointement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Appointement'},
        ])
        const doctor_name_search = computed({
            get: () => store.state.Appointments.doctor_name_search,
            set: (value) => store.commit('Appointments/SET_SEARCH_FILTERS', {"doctor_name_search":value}),
        });
        const patient_name_search = computed({
            get: () => store.state.Appointments.patient_name_search,
            set: (value) => store.commit('Appointments/SET_SEARCH_FILTERS', {"patient_name_search":value}),
        });
        const from_date = computed({
            get: () => store.state.Appointments.from_date,
            set: (value) => store.commit('Appointments/SET_SEARCH_FILTERS', {"from_date":value}),
        });
        const to_date = computed({
            get: () => store.state.Appointments.to_date,
            set: (value) => store.commit('Appointments/SET_SEARCH_FILTERS', {"to_date":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Search Doctor...", value: doctor_name_search, width:44},
            {type:'text', placeholder:"Search Patient...", value: patient_name_search, width:44},
            {type:'date', placeholder:"From Date...", value: from_date, width:36, title: "Date From Search"},
            {type:'date', placeholder:"To Date...", value: to_date, width:36, title: "Date To Search"},
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const handleSelectedPatient = async(option) =>{
            await store.dispatch('Patients_List/handleSelectedPatient', option);
            patientID.value = store.state.Patients_List.patientID;
            patientName.value = store.state.Patients_List.patientName;
            if(selectedAppointment.value){
                selectedAppointment.value.patient.patientID = patientID.value;
                patientValue.value = patientID.value
            }
        }
        const handleSelectedDoctor = async(option) =>{
            await store.dispatch('Doctors/handleSelectedDoctor', option)
            doctorID.value = store.state.Doctors.doctorID;
            doctName.value = store.state.Doctors.doctName;
            if(selectedAppointment.value){
                selectedAppointment.value.doctor.doctorID = doctorID.value;
                doctorValue.value = doctorID.value
            }
        }
        const formFields = ref([]);
        const patientValue = computed(() => {
           return (selectedAppointment.value && selectedAppointment.value.patient && !patientID.value) ? selectedAppointment.value.patient.patient_id : patientID.value;

        });
        const doctorValue = computed(() => {
            return (selectedAppointment.value && selectedAppointment.value.doctor && !doctorID.value) ? selectedAppointment.value.doctor.doctor_id : doctorID.value;
        });
        const updateFormFields = () => {
            formFields.value = [
            {  
                type:'search-dropdown', label:"Patient", value: patientValue.value, componentKey: patComponentKey,
                selectOptions: patArray, optionSelected: handleSelectedPatient, required: true,
                searchPlaceholder: 'Select Patient...', dropdownWidth: '400px', updateValue: selectedPatient.value,
                fetchData: store.dispatch('Patients_List/fetchPatients', {hospital:hospitalID.value})
            },
            {  
                type:'search-dropdown', label:"Doctor", value: doctorValue.value, componentKey: doctComponentKey,
                selectOptions: doctArray, optionSelected: handleSelectedDoctor, required: true,
                searchPlaceholder: 'Select Doctor...', dropdownWidth: '400px', updateValue: selectedDoctor.value,
                fetchData: store.dispatch('Doctors/fetchDoctors', {hospital:hospitalID.value})
            },
            { type: 'date', name: 'date',label: "Date", value: selectedAppointment.value?.date || '', required: true },
            { type: 'time', name: 'time',label: "Time", value: selectedAppointment.value?.time || '', required: true },
            {type:'text-area', label:"Notes", value: selectedAppointment.value?.notes || '', textarea_rows: '2', textarea_cols: '40', required: true},
            ];
        };
        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
            patientID.value = '';
            doctorID.value = '';
        }

        watch([selectedAppointment, selectedPatient, selectedDoctor], () => {
            if (selectedAppointment.value && selectedPatient.value && selectedDoctor.value) {
                doctComponentKey.value += 1;
                patComponentKey.value += 1;
                updateFormFields();
            }else{
                updateFormFields();
            }
            
        }, { immediate: true });
        
        const addNewAppointment = () =>{
            store.dispatch("Appointments/updateState",{selectedAppointment:null,selectedDoctor:null,selectedPatient:null})
            patientID.value = "";
            doctorID.value = "";
            appModalVisible.value = true;
            handleReset();
            store.dispatch("Appointments/updateState",{isEditing:false})
            flex_basis.value = '1/4';
            flex_basis_percentage.value = '25';
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const appID = row[idField];
                let formData = {
                    hospital: hospitalID.value,
                    patient: row['patient_id'],
                    appointment: appID
                }
                
                await store.dispatch('Appointments/fetchAppointment',formData)
                appModalVisible.value = true;
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50';
                doctComponentKey.value += 1;
                
            }else if(action == 'delete'){
                const appID = [row[idField]];
                let formData = {
                    hospital: hospitalID.value,
                    appointment: appID
                }

                await store.dispatch('Appointments/deleteAppointment',formData)
                searchAppointments();         
            }
        } 
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createAppointment = async() =>{
            showModalLoader();
            let formData = {
                patient: patientID.value,
                patient_id: patientID.value,
                patient_name: patientName.value,
                date: formFields.value[2].value,
                doctor: doctorID.value,
                doctor_id: doctorID.value,
                doctor_name: doctName.value,
                notes: formFields.value[4].value,
                time: formFields.value[3].value,
                hospital: hospitalID.value
            }
  
            errors.value = [];
            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push(formFields.value[i].label);
                }
            }
            if(patientValue.value == '' || doctorValue.value == ''){
                errors.value.push('error')
            }

            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Appointments/createAppointment', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success('Appointment created successfully!');
                        handleReset();
                        patComponentKey.value += 1;
                        doctComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while creating the appointment.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create appointment: ' + error.message);
                } finally {
                    hideModalLoader();
                    store.dispatch('Patients_List/updateState',{patientID:''})
                    store.dispatch('Doctors/updateState',{doctorID:''})
                    searchAppointments();
                }
            }
        }
        const updateAppointment = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                patient: patientValue.value,
                patient_id: patientValue.value,
                doctor: doctorValue.value,
                doctor_id: doctorValue.value,
                appointment: selectedAppointment.value.appointment_id,
                date: formFields.value[2].value,
                notes: formFields.value[4].value,
                time: formFields.value[3].value,
                hospital: hospitalID.value,
            }

            for(let i=2; i < formFields.value.length; i++){
                if(formFields.value[i].value ==''){
                    errors.value.push('Error');
                }
            }
            if(patientValue.value == '' || doctorValue.value == ''){
                errors.value.push('error')
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Appointments/updateAppointment', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        handleReset();
                        toast.success("Appointment updated successfully!");              
                        patComponentKey.value += 1;
                        doctComponentKey.value += 1;
                    } else {
                        toast.error('An error occurred while updating the appointment.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update appointment: ' + error.message);
                } finally {
                    hideModalLoader();
                    appModalVisible.value = false;
                    store.dispatch('Patients_List/updateState',{patientID:''})
                    store.dispatch('Doctors/updateState',{doctorID:''})
                    store.dispatch("Appointments/updateState",{selectedAppointment:null,selectedDoctor:null,selectedPatient:null})
                    searchAppointments();
                }             
            }
        }
        const saveAppointment = () =>{
            if(isEditing.value == true){
                updateAppointment();
            }else{
                createAppointment();
            }
        }
        const importAppointments = () =>{
            store.commit('pageTab/ADD_PAGE', {'HMS':'Import_Appointments'})
            store.state.pageTab.hmsActiveTab = 'Import_Appointments';
        }
        const removeAppointment = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    hospital: hospitalID.value,
                    appointment: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Appointments/deleteAppointment',formData)
                    if(response && response.status == 200){
                        toast.success("Appointment Removed Succesfully");
                        searchAppointments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove appointment: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    pageComponentKey.value += 1;
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 appointment") 
            }else{
                toast.error("Please Select An Appointment To Remove")
            }
        }
        const removeAppointments = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    hospital: hospitalID.value,
                    appointment: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Appointments/deleteAppointment',formData)
                    if(response && response.status == 200){
                        toast.success("Appointments Removed Succesfully");
                        searchAppointments();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove appointment: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                    pageComponentKey.value += 1;
                }
            }else{
                toast.error("Please Select An Appointment To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchAppointments = () =>{
            showLoader();
            let formData = {
                patient_name: patient_name_search.value,
                from_date: from_date.value,
                to_date: to_date.value,
                doctor_name: doctor_name_search.value,
                doctor: doctor_search.value,
                hospital: hospitalID.value
            }

            axios
            .post(`api/v1/appointments-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                appList.value = response.data.results;
                store.commit('Appointments/LIST_APPOINTMENTS', appList.value)
                appResults.value = response.data;
                appArrLen.value = appList.value.length;
                appCount.value = appResults.value.count;
                pageCount.value = Math.ceil(appCount.value / 50);
                
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
            
            searchAppointments();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchAppointments();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchAppointments();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchAppointments();
        }
        const resetFilters = () =>{
            store.commit('Appointments/RESET_SEARCH_FILTERS')
            searchAppointments();
        }
        const closeModal = () =>{
            appModalVisible.value = false;
            store.dispatch('Patients_List/updateState',{patientID:''})
            store.dispatch('Doctors/updateState',{doctorID:''})
            store.dispatch("Appointments/updateState",{selectedAppointment:null,selectedDoctor:null,selectedPatient:null})
        }
        onMounted(() =>{
            searchAppointments();
        })
        return{
            title, searchAppointments, idField, selectedIds, actions, appList, appArrLen,appCount,appResults,appModalVisible,formFields,
            addButtonLabel, searchFilters,tableColumns,resetFilters,loadPrev,loadNext,firstPage,lastPage,
            showNextBtn,showPreviousBtn,addNewAppointment, handleActionClick,saveAppointment,displayButtons,handleReset,
            modal_top, modal_left, modal_width, showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader,
            closeModal, handleSelectionChange, removeAppointment, removeAppointments, pageComponentKey, importAppointments
        }
    }
}
</script>
