<template>
    <div class="z-10">
        <PageComponent 
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewPatient"
            :searchFilters="searchFilters"
            @searchPage="searchPatients"
            @resetFilters="resetFilters"
            :columns="tableColumns"
            :rows="patientList"
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
    </div>
    <!-- <Modal v-show="patModalVisible" @close="closeModal" 
        :index="index" :fields="formFields" 
        :submitButtonLabel="submitButtonLabel"
    /> -->
    <MovableModal v-model:visible="showModal">
        <p class="font-semibold">Do you wish to continue?</p>
    </MovableModal>
    <MovableModal v-model:visible="patModalVisible">
        <div>
            <label for="">Email</label><br />
            <input type="email" name="" id="" class="rounded border border-gray-600 text-lg pl-2 focus:outline-none"><br />
            <label for="">Name</label><br />
            <input type="text" name="" id="" class="rounded border border-gray-600 text-lg pl-2 focus:outline-none">
        </div>
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount , defineComponent } from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import patientsData from '@/composables/HMS/patientsDropdown'
import Modal from '@/components/Modal.vue'
import MovableModal from '@/components/MovableModal.vue'

export default defineComponent({
    name: 'Patients_List',
    components:{
        PageComponent, Modal, MovableModal
    },
    setup(){
        const { data, fetchData } = patientsData();
        const store = useStore();
        const idField = 'patient_id';
        const addButtonLabel = ref('New Patient');
        const submitButtonLabel = ref('Add');
        const patientList = ref([]);
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const patModalVisible = ref(false);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "F. Name", key:"first_name"},
            {label: "L. Name", key: "last_name"},
            {label: "Email", key:"email"},
            {label: "ID No.", key:"id_number"},
            {label: "Phone No", key:"phone_number"},
            {label: "DOB", key:"birth_date"},
            {label: "City", key:"city"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Patient'},
            {name: 'view', icon: 'fa fa-file-pdf-o', title: 'View Statement'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Patient'},
        ])
        const hospitalID = ref('9e14bcef-d3c1-400c-a8c0-66d7b25cc5ff');
        const first_name_search = computed({
            get: () => store.state.Patients_List.first_name_search,
            set: (value) => store.commit('Patients_List/SET_SEARCH_FILTERS', {"first_name_search":value}),
        });
        const last_name_search = computed({
            get: () => store.state.Patients_List.last_name_search,
            set: (value) => store.commit('Patients_List/SET_SEARCH_FILTERS', {"last_name_search":value}),
        });
        const phone_number_search = computed({
            get: () => store.state.Patients_List.phone_number_search,
            set: (value) => store.commit('Patients_List/SET_SEARCH_FILTERS', {"phone_number_search":value}),
        });
        const id_number_search = computed({
            get: () => store.state.Patients_List.id_number_search,
            set: (value) => store.commit('Patients_List/SET_SEARCH_FILTERS', {"id_number_search":value}),
        });
        const gender_search = computed({
            get: () => store.state.Patients_List.gender_search,
            set: (value) => store.commit('Patients_List/SET_SEARCH_FILTERS', {"gender_search":value}),
        });
        const birth_date_search = computed({
            get: () => store.state.Patients_List.birth_date_search,
            set: (value) => store.commit('Patients_List/SET_SEARCH_FILTERS', {"birth_date_search":value}),
        });
        const kin_dropdown_array = computed({
            get: () => store.state.Patients_List.patientsArr,
        });
        const searchFilters = ref([
            {type:'text', placeholder:"First Name...", value: first_name_search, width:48,},
            {type:'text', placeholder:"Last Name...", value: last_name_search, width:48,},
            {type:'text', placeholder:"Phone No...", value: phone_number_search, width:48,},
            // {type:'text', placeholder:"ID No...", value: id_number_search, width:48,},
            {
                type:'dropdown', placeholder:"Gender", value: gender_search, width:40,
                options: [{text:'Male',value:'Male'},{text:'Female',value:'Female'},{text:'Others',value:'Others'}]
            },
            {type:'text', placeholder:"Date Of Birth...", value: birth_date_search, width:48,},
            {
                type:'dropdown', placeholder:"Status", value: gender_search, width:40,
                options: [{text:'Active',value:'Active'},{text:'Inactive',value:'Inactive'}]
            },
            {
                type:'search-dropdown', value: gender_search, width:60,
                selectOptions: kin_dropdown_array,
                searchPlaceholder: 'Next Of Kin...', dropdownWidth: '380px',
                fetchData: store.dispatch('Patients_List/fetchPatients', {hospital:hospitalID.value})
            },
        ])
        const formFields = [
            { row: 0, name: 'firstName', label: 'First Name', type: 'text', size: 2 },
            { row: 0, name: 'lastName', label: 'Last Name', type: 'text', size: 2 },

        ];
        const searchPatients = () =>{
            // getPatients();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = new FormData();
            formData.append('first_name', first_name_search.value);
            formData.append('last_name', last_name_search.value);
            formData.append('phone_number', phone_number_search.value);
            formData.append('id_number', id_number_search.value);
            formData.append('gender', gender_search.value);
            formData.append('hospital_id', hospitalID.value);  
            if((birth_date_search.value !=null) && (typeof(birth_date_search.value) == "object")){
                formData.append('birth_date', formatDate(birth_date_search.value));
            }else{
                birth_date_search.value = "";
                formData.append('birth_date', birth_date_search.value);
            } 
            axios
            .post(`api/v1/patients-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                patientList.value = response.data.results;
                store.commit('Patients_List/LIST_PATIENTS', patientList.value)
                depResults.value = response.data;
                depArrLen.value = patientList.value.length;
                depCount.value = depResults.value.count;
                pageCount.value = Math.ceil(depCount.value / 50);
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
        }
        const resetFilters = () =>{
            store.commit('Patients_List/RESET_SEARCH_FILTERS')
            searchPatients();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchPatients();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchPatients();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchPatients();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            console.log("THE PAGE COUNT VALUE IS ",pageCount.value);
            searchPatients();
            // scrollToTop();
        }
        const addNewPatient = () =>{
            showModal.value = true;
            store.commit('pageTab/ADD_PAGE', {'HMS':'Patient_Details'})
            store.state.pageTab.hmsActiveTab = 'Patient_Details';
            store.dispatch('Patients_List/updateState', {isEditing: false});
            store.dispatch('Patients_List/updateState', {selectedPatient: null});
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const patientID = row[idField];
                let formData = {
                    hospital: hospitalID.value,
                    patient: patientID
                }
                await store.dispatch('Patients_List/fetchPatient',formData).
                then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'HMS':'Patient_Details'})
                    store.state.pageTab.hmsActiveTab = 'Patient_Details';
                })
                
                // patModalVisible.value = true;
            }else if(action == 'delete'){
                const patientID = row[idField];
                let formData = {
                    hospital: hospitalID.value,
                    patient: patientID
                }
                await store.dispatch('Patients_List/deletePatient',formData).
                then(()=>{
                    searchPatients();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            patModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchPatients();
            
        })
        return{
            searchPatients,resetFilters, addButtonLabel, searchFilters, tableColumns, patientList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick, patModalVisible, closeModal,
            formFields, submitButtonLabel, showModal, addNewPatient
        }
    }
})
</script>