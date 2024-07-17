<template>
    <div class="main-content z-10 bg-gray-100 px-4 py-4 text-sm">
        <div class="subsection rounded bg-white">
            <div class="md:px-8 w-full">
                <div class="flex items-end w-full border-b-2 border-gray-300 mb-3">
                    <div class="mb-4 flex items-end h-20">
                        <div class="basis-1/3 pl-3">
                            <button class="rounded bg-green-400 text-sm  text-white px-2 py-2" @click="showModal"><i class="fa fa-plus" aria-hidden="true"></i> New Doctor</button>
                        </div>
                        <div class="basis-3/4 mr-3">
                            <div class="flex mb-3">
                                <div class="basis-1/2 pl-3 items-center">
                                    <input type="text" class="rounded pl-3 border-2 border-gray-200 text-lg w-52" name="patient_name" id="" placeholder="Patient Name..." v-model="patient_name_search" @keyup.enter="searchAppointments">
                                </div>
                                <div class="basis-1/2 pl-3 items-center">
                                    <input type="text" class="rounded pl-3 border-2 border-gray-200 text-lg w-52" name="doctor_name" id="" placeholder="Doctor Name..." v-model="doctor_name_search"  @keyup.enter="searchAppointments">
                                </div>
                            </div>
                            <div class="flex">
                                <div class="basis-1/2 pl-3 items-center">
                                    <datepicker  placeholder="Date From...." v-model="from_date" clearable :clear-button="clearButton">
                                    </datepicker>
                                </div>
                                <div class="basis-1/2 pl-3 items-center">
                                    <datepicker  placeholder="Date To...." v-model="to_date" clearable :clear-button="clearButton">
                                    </datepicker>
                                </div>
                            </div>
                        </div>
                        <div class="basis-1/8 pl-3 w-36">
                            <button class="rounded-lg bg-green-400 text-sm text-white px-3 py-2" @click="searchAppointments"><i class="fa fa-binoculars" aria-hidden="true"></i> Search</button>
                        </div> 
                        <div class="basis-1/8 pl-3 w-36" >
                            <div class="print-dropdown">
                                <button class="rounded-lg bg-green-400 text-sm text-white px-3 py-2" @click="showDropdown">Options<i class="fa fa-caret-down pl-2" aria-hidden="true"></i></button>
                                <button class="fixed inset-button inset-0 bg-gray-50 opacity-25 cursor-default w-full" v-if="showOptions" @click="showOptions = !showOptions"></button>
                            </div>
                            <div class="options-container absolute right-25 pt-4 pb-2 rounded border border-gray-200 bg-white shadow-slate-400 shadow-xl" v-if="showOptions">
                                <button @click="printReport" class="pl-3 hover:bg-slate-500 hover:rounded hover:w-full">Print List</button><br />
                                <button @click="exportAppointmentsPDF" class="pl-3 hover:bg-slate-500 hover:rounded hover:w-full">Export PDF</button><br />
                                <button @click="exportAppointmentsExcel" class="pl-3 hover:bg-slate-500 hover:rounded hover:w-full">Export Excel</button>
                                <button @click="exportAppointmentsCSV" class="pl-3 hover:bg-slate-500 hover:rounded hover:w-full">Export CSV</button>
                            </div>
                        </div>
                    </div>
                </div>
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

export default{
    name: 'AppointmentsView',
    props: ['scrollToTop','loader','showLoader','hideLoader',],
    data(){
    return{
        title: 'Hospital Management/ Appointments',
        loggedInUserID: "",
        rightsModule: "HMS",
        allowedRights: [],
        hospitalID: "",
        patient: "",
        doctor: "",
        appointment_date: null,
        appointment_time: "",
        appointment_notes: "",
        patient_name_search: "",
        doctor_name_search: "",
        doctor_search: "",
        from_date: null,
        to_date: null,
        aptModalVisible: false,
        isEditing: false,
        isSearching: false,
        pageCount: 0,
        showNextBtn: false,
        showPreviousBtn: false,
        showOptions: false,
        currentPage: 1,
        appointmentID: "",
        appointmentsList: [],
        appointmentsDetails: [],
        appointmentsResults: [],
        appointmentsArr: [],
        appointmentsArrLen: [],
        appointmentsCount: 0,
        appointmentsEditing: "",
        clearButton: true,
        patientsArray: [],
        patientDetails: [],
        patient: "",
        patientID: "",
        patientName: "",
        doctorsArray: [],
        doctorDetails: [],
        doctor: "",
        doctorID: "",
        doctUpdateID: "",
        doctorName: "",
        doctUpdateName: "",
        doctorEditing: "",
    }
  },
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