<template>
    <div class="main-content z-10 bg-gray-100 px-4 py-4 overflow-y-hidden">
      <div class="subsection flex w-full">
        <div class="w-3/4 mr-3">
          <div class="flex mb-3">
            <div class="w-1/2 h-[300px] rounded-lg py-5 px-2 bg-white mr-2">
              <h1 class="font-bold mb-10">Membership Overview</h1>
              <div class="flex w-full mb-3">
                <div class="w-1/2 rounded-lg h-16 border-2 p-2 mr-4">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-cyan-600 h-10 grid place-items-center">
                      <i class="fa fa-shopping-cart" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{itemsCount}}</p>
                      <p class="font-light text-sm">Members</p>
                    </div>
                  </div>
                </div>
                <div class="w-1/2 rounded-lg h-16 border-2 p-2">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-orange-400 h-10 grid place-items-center">
                      <i class="fa fa-store" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{outletsCount}}</p>
                      <p class="font-light text-sm">Sponsors</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex w-full">
                <div class="w-1/2 rounded-lg h-16 border-2 p-2 mr-4">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-indigo-600 h-10 grid place-items-center">
                      <i class="fa fa-line-chart" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{salesCount}}</p>
                      <p class="font-light text-sm">Savings</p>
                    </div>
                  </div>
                </div>
                <div class="w-1/2 rounded-lg h-16 border-2 p-2">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-rose-600 h-10 grid place-items-center">
                      <i class="fa fa-money" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{ purchasesCount }}</p>
                      <p class="font-light text-sm">Loans</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-1/2 rounded-lg h-[300px] py-4 px-2 bg-white flex">
              <div class="basis-1/4"></div>
              <div class="basis-1/2 h-[250px]">
                <h1 class="font-bold mb-2">Credit Sales vs Purchases</h1>
                <Pie id="my-chart-id" :data="chartData" :options="chartOptions" />
              </div>
              <div class="basis-1/4"></div>
            </div>
          </div>
  
          <div class="w-full rounded-lg py-3 px-8 bg-white appointments-table">
              <h1 class="font-bold mb-3">Savings vs Loans</h1>
              <BarChart :data="barChartData" :options="barChartOptions" />
          </div>
        </div>
        <div class="w-1/4">
          <div class="rounded-lg bg-blue-900 h-64 p-2 mb-3 text-white">
            <h1 class="font-bold mb-2">Stock Adjustments</h1>
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
            <h1 class="font-bold">Stock Transfers</h1>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import { useStore } from "vuex";
  import { ref, computed, onMounted, onBeforeMount} from 'vue';
  import { Pie } from 'vue-chartjs';
  import { Bar } from 'vue-chartjs';
  import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale  } from 'chart.js'
  ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale )
  
  export default {
    name: 'Dashboard',
    components:{
      Pie,BarChart: Bar
    },
    setup(){
      const store = useStore();
      const itemsCount = ref(0);
      const outletsCount = ref(0);
      const salesCount = ref(0);
      const purchasesCount = ref(0);
      const companyID = computed(()=> store.state.userData.company_id);
      const chartData = ref({
        labels: ['Credit Sales', 'Credit Purchases'], // Pie chart segments
        datasets: [
          {
            label: 'Credit',
            data: [100, 600], // Data for each segment
            backgroundColor: ['#FFCE56', '#36A2EB'], // Colors for each segment
            hoverOffset: 4, // Hover effect
          },
        ],
      });
      const barChartData = ref({
        labels: ['January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September', 'October','November','December'], // X-axis labels
        datasets: [
          {
            label: 'Sales vs Purchases',
            data: [65, 59, 80, 81, 56], // Sales data points for each month
            backgroundColor: '#42A5F5', // Bar color
            borderColor: '#1E88E5', // Border color of bars
            borderWidth: 1,
          },
        ],
      });
  
      const chartOptions = ref({
        responsive: true, // Make the chart responsive to screen size
        plugins: {
          legend: {
            position: 'top', // Position of the legend
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return tooltipItem.label + ': ' + tooltipItem.raw; // Customize tooltip label
              },
            },
          },
        },
      });
      const barChartOptions = ref({
        responsive: true, // Make chart responsive
        plugins: {
          legend: {
            position: 'top', // Position of the legend
          },
          tooltip: {
            enabled: true, // Enable tooltips
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Months', 
              font: {
                size: 14,
              },
            },
          },
          y: {
            beginAtZero: true, // Ensure Y-axis starts at zero
            title: {
              display: true, 
              text: 'Amount (X10,000)',
              font: {
                size: 14, 
              },
            },
          },
        },
      });
  
      onMounted(()=>{
  
        axios.get('api/v1/inventory-management-dashboard/')
        .then((response)=>{
          itemsCount.value = response.data.dashboard[0].itemsCount;
          outletsCount.value = response.data.dashboard[0].outletsCount;
          salesCount.value = response.data.dashboard[0].salesCount;
          purchasesCount.value = response.data.dashboard[0].purchasesCount;
  
          chartData.value = {
            labels: ['Credit Sales', 'Credit Purchases'], // Pie chart segments
            datasets: [
              {
                label: 'Credit',
                data: [response.data.dashboard[0].creditSalesCount, response.data.dashboard[0].creditPurchasesCount], 
                backgroundColor: ['#FFCE56', '#36A2EB'], 
                hoverOffset: 4, 
              },
            ],
          };
          barChartData.value = {
            labels: ['January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September', 'October','November','December'], // X-axis labels
            datasets: [
              {
                label: 'Sales',
                data: response.data.dashboard[0].monthlySales, // Sales data points for each month
                backgroundColor: '#FFA500', // Bar color
                borderColor: '#1E88E5', // Border color of bars
                borderWidth: 1,
              },
              {
                label: 'Purchases',
                data: response.data.dashboard[0].monthlyPurchases, // Sales data points for each month
                backgroundColor: '#42A5F5', // Bar color
                borderColor: '#1E88E5', // Border color of bars
                borderWidth: 1,
              },
            ],
          };
        })
        .catch((error)=>{
          console.log(error.message)
        })
      })
  
      return{
        itemsCount,outletsCount,salesCount,purchasesCount,chartData,chartOptions,
        barChartData,barChartOptions
      }
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
  