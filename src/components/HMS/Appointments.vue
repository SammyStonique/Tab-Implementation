<template>
    <div class="main-content z-10 bg-gray-100 px-4 py-4 text-sm">
        <div class="subsection rounded bg-white">
            <div class="md:px-8 w-full">  
                <FilterBar  :addButtonLabel="addButtonLabel" :filters="searchFilters" @search="searchAppointments"/>
                <!-- MODAL component for adding a new appointment -->
                <Modal v-show="aptModalVisible" @close="closeModal" :index="index">
                    <template v-slot:header> Appointment Details </template>
                    <template v-slot:body>
                    <form action="" @submit.prevent="">
                        <div class="flex mb-6">
                            <div class="basis-1/2 mr-6" v-if="isEditing">
                                <label for="">Patient<em>*</em></label><br />
                                <input type="text" name="" id="" disabled class="rounded border bg-slate-100 border-gray-600 text-lg pl-2 w-60" v-model="patientName" required>                               
                            </div>
                            <div class="basis-1/2 mr-6" v-else>
                                <label for="">Patient<em>*</em></label><br />
                                <select name="patient" ref="patientSelect" id="selectPatient" class="rounded border border-gray-600 bg-white text-lg pl-2 pt-2 w-60" @change="setPatientID" onfocus="this.selectedIndex = -1;" v-model="patient">
                                    <option value="" disabled selected>---Select Patient---</option> 
                                    <option v-for="pat in patientsArray">{{pat.first_name}}  {{pat.last_name}} - #{{ pat.id_number}}</option> 
                                </select>
                            </div>
                            <div class="basis-1/2"  v-if="isEditing">
                                <label for="">Doctor<em>*</em></label><br />
                                <select name="doctorUpdate" ref="doctorUpdateSelect" id="selectUpdateDoctor" class="rounded border border-gray-600 bg-white text-lg pl-2 pt-2 w-60" @change="setUpdateDoctorID" onfocus="this.selectedIndex = -1;" v-model="doctorEditing">
                                    <option v-for="doct in doctorsArray" :key="doct.doctor_id" :value="(doct.first_name+' '+doct.last_name)" :label="(doct.first_name+' '+doct.last_name)" :selected="((doct.first_name+' '+doct.last_name)===doctorEditing)">{{doct.first_name}}  {{doct.last_name}}</option> 
                                </select>
                            </div>
                            <div class="basis-1/2" v-else>
                                <label for="">Doctor<em>*</em></label><br />
                                <select name="doctor" ref="doctorSelect" id="selectDoctor" class="rounded border border-gray-600 bg-white text-lg pl-2 pt-2 w-60" @change="setDoctorID" onfocus="this.selectedIndex = -1;" v-model="doctor">
                                    <option value="" disabled selected>---Select Doctor---</option> 
                                    <option v-for="doct in doctorsArray">Dr. {{doct.first_name}}  {{doct.last_name}}</option> 
                                </select>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/2 mr-6">
                                <label for="">Date<em>*</em></label><br />
                                <datepicker  placeholder="Appointment Date...." v-model="appointment_date" clearable :clear-button="clearButton">
                                    </datepicker>
                            </div>
                            <div class="basis-1/2">
                                <label for="">Time<em></em></label><br />
                                <input type="time" name="" id="" class="rounded border border-gray-600 bg-white text-lg pl-2 pt-2" v-model="appointment_time">
                            </div>

                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/2">
                                <label for="">Notes<em>*</em></label><br />
                                <textarea id="notes" name="appointment_notes" class="rounded border border-gray-600 bg-white text-lg pl-2 pt-2" v-model="appointment_notes" rows="4" cols="50"></textarea>
                            </div>
                        </div>
                        
                        <div class="text-center" v-if="isEditing">
                            <button class="rounded border bg-green-400 w-36 py-2 px-4 text-white text-lg" @click="updateAppointment">Update</button>
                        </div>
                        <div class="text-center" v-else>
                            <button class="rounded border bg-green-400 w-36 py-2 px-4 text-white text-lg" @click="createAppointment">Save</button>
                        </div>

                    </form>
                    </template>
                    <template v-slot:footer>We Value Your Partnership </template>
                </Modal>
        
                <div class="shadow overflow-hidden rounded border-b border-gray-200 row-span-8">
                    <table class="min-w-full bg-white" style="width: 100%;"> 
                        <thead class="bg-gray-800 text-white">
                            <tr class="rounded bg-slate-800 text-white font-semibold text-sm uppercase">
                                <th>#</th>
                                <th class="text-left py-2 px-2" style="width: 20%;">Patient</th>
                                <th class="text-left py-2 px-2" style="width: 8%;">ID No.</th>
                                <th class="text-left py-2 px-2" style="width: 20%;">Doctor</th>
                                <th class="text-left py-2 px-2" style="width: 10%;">Date</th>
                                <th class="text-left py-2 px-2" style="width: 7%;">Time</th>
                                <th class="text-left py-2 px-2" style="width: 30%;">Notes</th>
                                <th class="text-left py-2 px-2" style="width: 5%;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        
                        <tr v-for="(apt,index) in appointmentsList" :key="apt.appointment_id" class="even:bg-gray-100 text-xs uppercase">
                            <td>{{ index + 1 }}.</td>
                            <td class="text-left py-2 px-2">{{ apt.patient_name }}</td>
                            <td class="text-left py-2 px-2">{{ apt.patient_id_number }}</td>
                            <td class="text-left py-2 px-2">Dr. {{ apt.doctor_name }}</td>
                            <td class="text-left py-2 px-2">{{ apt.date }}</td>
                            <td class="text-left py-2 px-2">{{ apt.time }}</td>
                            <td class="text-left py-2 px-2">{{ apt.notes }}</td>
                            <td>
                                <div class="flex">
                                    <div class="basis-1/2">
                                        <button @click="editAppointment(index)"><i class="fa fa-pencil" aria-hidden="true" title="Edit"></i></button>
                                    </div>
                                    <div class="basis-1/2">
                                        <button @click="removeAppointment(index)"><i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i></button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>   
                </div>
                <div class="pagination row-span-2">
                    <MyPagination 
                    :count="appointmentsCount"
                    :currentPage="currentPage"
                    :result="appointmentsArrLen"
                    @loadPrev="loadPrev"
                    @loadNext="loadNext"
                    @firstPage="firstPage"
                    @lastPage="lastPage"
                    :showNextBtn="showNextBtn"
                    :showPreviousBtn="showPreviousBtn"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted } from 'vue';
import { useStore } from "vuex";
import FilterBar from '@/components/FilterBar.vue';

export default{
    name: 'Appointments',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    components:{
        FilterBar
    },
    setup(){
        const store = useStore();
        const addButtonLabel = ref('New Appointment');
        const from_date = ref('');
        const to_date = ref('');
        const doctor_search = ref('');
        const hospitalID = ref('9e14bcef-d3c1-400c-a8c0-66d7b25cc5ff');
        const currentPage = ref(1);
        const appointmentsList = computed({
            get: () => store.state.Appointments.appointmentsList,
            set: (value) => store.commit('Appointments/LIST_APPOINTMENTS', value),
        });
        const doctor_name_search = computed({
            get: () => store.state.Appointments.doctor_name_search,
            set: (value) => store.commit('Appointments/SET_SEARCH_FILTERS', {"doctor_name_search":value}),
        });
        const patient_name_search = computed({
            get: () => store.state.Appointments.patient_name_search,
            set: (value) => store.commit('Appointments/SET_SEARCH_FILTERS', {"patient_name_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Search Doctor...", value: doctor_name_search},
            {type:'text', placeholder:"Search Patient...", value: patient_name_search}
        ])
        const searchAppointments = () =>{
            let formData = new FormData();
            formData.append('patient_name', patient_name_search.value);
            if((from_date.value !=null) && (typeof(from_date.value) == "object")){
                formData.append('from_date', this.formatDate(from_date.value));
            }else{
                from_date.value = "";
                formData.append('from_date', from_date.value);
            }   
            if((to_date.value !=null) && (typeof(to_date.value) == "object")){
                formData.append('to_date', this.formatDate(to_date.value));
            }else{
                to_date.value = "";
                formData.append('to_date', to_date.value);
            } 
            formData.append('doctor_name', doctor_name_search.value);
            formData.append('doctor', doctor_search.value);
            formData.append('hospital', hospitalID.value); 

            axios
            .post(`api/v1/appointments-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                appointmentsList.value = response.data.results;
                store.commit('appointments/LIST_APPOINTMENTS', appointmentsList.value)
            })
            .catch((error)=>{
                console.log(error);
            })
        }
        onMounted(() =>{
            searchAppointments();
        })
        return{
            searchAppointments,
            appointmentsList, addButtonLabel, searchFilters
        }
    }
}
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.main-content{
    z-index: -1;
    margin-left: 1px;
    margin-top: 90px;
    min-height: 100vh;
}
.subsection{
    min-height: 100vh;
}
.pagination{
    bottom: 20px;
}
em{
  color: red;
}
.options-container {
  width: 150px;

}
.dropdown-button{
    z-index: 1;
}
.inset-button{
    min-height: 100vh;
}

</style>