<template>
      <div class="main-content z-10 bg-gray-100 px-4 py-4">
        <div class="subsection flex w-full">
          <div class="w-3/4 mr-3">
            <div class="flex mb-3">
              <div class="w-1/2 rounded-lg py-3 px-2 bg-white mr-2">
                <h1 class="font-bold mb-2">Activity Overview</h1>
                <div class="flex w-full mb-3">
                  <div class="w-1/2 rounded-lg h-16 border-2 p-2 mr-4">
                    <div class="w-full flex">
                      <div class="w-1/4 rounded-lg bg-cyan-600 h-10 grid place-items-center">
                        <i class="fa fa-file-text" aria-hidden="true"></i>
                      </div>
                      <div class="w-3/4 px-2">
                        <p class="font-bold">{{appointmentCount}}</p>
                        <p class="font-light text-sm">Invoices</p>
                      </div>
                    </div>
                  </div>
                  <div class="w-1/2 rounded-lg h-16 border-2 p-2">
                    <div class="w-full flex">
                      <div class="w-1/4 rounded-lg bg-orange-400 h-10 grid place-items-center">
                        <i class="fa fa-credit-card" aria-hidden="true"></i>
                      </div>
                      <div class="w-3/4 px-2">
                        <p class="font-bold">{{operationsCount}}</p>
                        <p class="font-light text-sm">Bills</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex w-full mb-3">
                  <div class="w-1/2 rounded-lg h-16 border-2 p-2 mr-4">
                    <div class="w-full flex">
                      <div class="w-1/4 rounded-lg bg-indigo-600 h-10 grid place-items-center">
                        <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                      </div>
                      <div class="w-3/4 px-2">
                        <p class="font-bold">{{patientCount}}</p>
                        <p class="font-light text-sm">Receipts</p>
                      </div>
                    </div>
                  </div>
                  <div class="w-1/2 rounded-lg h-16 border-2 p-2">
                    <div class="w-full flex">
                      <div class="w-1/4 rounded-lg bg-rose-600 h-10 grid place-items-center">
                        <i class="fa fa-money" aria-hidden="true"></i>
                      </div>
                      <div class="w-3/4 px-2">
                        <p class="font-bold">{{ doctorCount }}</p>
                        <p class="font-light text-sm">Payments</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="w-1/2 rounded-lg py-3 px-2 bg-white">
                <h1 class="font-bold mb-2">Income</h1>
                <div class="">
                  <PieChart />
                </div>
              </div>
            </div>
            <div class="w-full rounded-lg py-3 px-2 bg-white h-56 mb-3">
              <h1 class="font-bold">Income vs Expenses</h1>
            </div>
          </div>
          <div class="w-1/4">
            <div class="rounded-lg bg-blue-900 h-64 p-2 mb-3 text-white">
              <!-- <h1 class="font-bold mb-2">Popular Doctors List</h1> -->
              <div class="flex text-xs">
                
              </div>
            </div>
            <div class="rounded-lg bg-white h-56 p-2 mb-3">
              <h1 class="font-bold">Average Monthly Income</h1>
            </div>
            <div class="rounded-lg bg-white h-56 p-2">
              <h1 class="font-bold">Average Monthly Spend</h1>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <script>
    
    export default {
      name: 'HomeView',
      data(){
        return{
          title: 'Financial Accounts/ Dashboard',
          companyID: "",
          patientCount: 0,
          appointmentCount: 0,
          doctorCount: 0,
          operationsCount: 0,
          appointmentsArray: [],
          today_date: new Date(),
        }
      },
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
    