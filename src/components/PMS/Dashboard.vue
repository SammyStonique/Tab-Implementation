<template>
    <div class="main-content z-10 bg-gray-100 px-4 py-4 overflow-y-hidden">
      <div class="subsection flex w-full">
        <div class="w-3/4 mr-3">
          <div class="flex mb-3">
            <div class="w-1/2 rounded-lg py-3 px-2 bg-white mr-2">
              <h1 class="font-bold mb-2">Activity Overview</h1>
              <div class="flex w-full mb-3">
                <div class="w-1/2 rounded-lg h-16 border-2 p-2 mr-4">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-cyan-600 h-10 grid place-items-center">
                      <i class="fa fa-calendar" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{appointmentCount}}</p>
                      <p class="font-light text-sm">Properties</p>
                    </div>
                  </div>
                </div>
                <div class="w-1/2 rounded-lg h-16 border-2 p-2">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-orange-400 h-10 grid place-items-center">
                      <i class="fa fa-scissors" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{operationsCount}}</p>
                      <p class="font-light text-sm">Units</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex w-full mb-3">
                <div class="w-1/2 rounded-lg h-16 border-2 p-2 mr-4">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-indigo-600 h-10 grid place-items-center">
                      <i class="fa fa-bed" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{patientCount}}</p>
                      <p class="font-light text-sm">New Tenants</p>
                    </div>
                  </div>
                </div>
                <div class="w-1/2 rounded-lg h-16 border-2 p-2">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-rose-600 h-10 grid place-items-center">
                      <i class="fa fa-user-md" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{ doctorCount }}</p>
                      <p class="font-light text-sm">Statements</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-1/2 rounded-lg py-3 px-2 bg-white">
              <h1 class="font-bold mb-2">Deliquent Tenants</h1>
              <div class="">

              </div>
            </div>
          </div>

          <div class="w-full rounded-lg py-3 px-2 bg-white appointments-table">
            <h1 class="font-bold mb-3">Appointment Activity</h1>
            <table class="table-auto border-collapse w-full">
              <thead class="border-b border-slate-500 font-thin text-sm bg-gray-100">
              <th>Name</th>
              <th>ID Number</th>
              <th>Date</th>
              <th>Visit Time</th>
              <th>Doctor</th>
              <th>Condition(s)</th>
            </thead>
            <tbody class="text-sm py-2">
              <tr class="py-8" v-for="apts in appointmentsArray" :key="apts.appointment_id">
                <td class="py-2">{{ apts.patient_name }}</td>
                <td class="py-2">{{ apts.patient_id_number }}</td>
                <td class="py-2">{{ apts.date }}</td>
                <td class="py-2">{{ apts.time }}</td>
                <td class="py-2">Dr. {{ apts.doctor_name }}</td>
                <td class="py-2">{{ apts.notes }}</td>
              </tr>
              
            </tbody>
            </table>
          </div>
        </div>
        <div class="w-1/4">
          <div class="rounded-lg bg-blue-900 h-64 p-2 mb-3 text-white">
            <h1 class="font-bold mb-2">Popular Doctors List</h1>
            <table class="table-auto border-collapse w-full">
              <thead class="font-thin text-left text-sm bg-blue-900">
                <th></th>
                <th>Name</th>
                <th>Status</th>
            </thead>
            <tbody class="text-sm py-2">
              <tr class="py-8" v-for="doc,index in popularDoctors" :key="index">
                <td class="py-2">{{ index + 1 }}</td>
                <td class="py-2">{{ doc}}</td>
                <td class="py-2">
                  <button class="rounded-full w-full bg-white p-1.5 text-green-800">Available</button>
                </td>
              </tr>
              
            </tbody>
            </table>
          </div>
          <div class="rounded-lg bg-white h-56 p-2 mb-3">
            <h1 class="font-bold">Terminated Tenants</h1>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  
  export default {
    name: 'Dashboard',
    data(){
      return{
        title: 'Hospital Management/ Dashboard',
        hospitalID: "",
        patientCount: 0,
        appointmentCount: 0,
        doctorCount: 0,
        operationsCount: 0,
        appointmentsArray: [],
        today_date: new Date(),
        popularDoctors: []
      }
    },
    mounted(){
        
    }
  }
  </script>
  <style scoped>
  
  
  .main-content{
    z-index: -1;
    margin-left: 1px;
    margin-top: 64px;
    min-height: 90vh;
    overflow: hidden;
  }
  .subsection{
      min-height: 100vh;
  }
  .appointments-table{
    min-height: 40vh;
    max-height: 40vh;
    overflow-y: scroll;
  }
  </style>
  