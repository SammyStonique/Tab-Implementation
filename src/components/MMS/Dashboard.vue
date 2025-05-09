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
                      <p class="font-bold">{{membersCount}}</p>
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
                      <p class="font-bold">{{Number(sharesAmount).toLocaleString()}}</p>
                      <p class="font-light text-sm">Shares Amount</p>
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
                      <p class="font-bold">{{Number(savingsAmount).toLocaleString()}}</p>
                      <p class="font-light text-sm">Savings Amount</p>
                    </div>
                  </div>
                </div>
                <div class="w-1/2 rounded-lg h-16 border-2 p-2">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-rose-600 h-10 grid place-items-center">
                      <i class="fa fa-money" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{ Number(loansAmount).toLocaleString() }}</p>
                      <p class="font-light text-sm">Loans Amount</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-1/2 rounded-lg h-[300px] py-4 px-2 bg-white flex">
              <div class="basis-1/4"></div>
              <div class="basis-1/2 h-[250px]">
                <h1 class="font-bold mb-2">Savings vs Shares</h1>
                <Pie id="my-chart-id" :data="chartData" :options="chartOptions" />
              </div>
              <div class="basis-1/4"></div>
            </div>
          </div>
  
          <div class="w-full rounded-lg py-3 px-8 bg-white appointments-table">
              <h1 class="font-bold mb-3">Issued Loans vs Repayments</h1>
              <BarChart :data="barChartData" :options="barChartOptions" />
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
      const membersCount = ref(0);
      const savingsAmount = ref(0);
      const sharesAmount = ref(0);
      const loansAmount = ref(0);
      const companyID = computed(()=> store.state.userData.company_id);
      const chartData = ref({
        labels: ['Saving Deposits', 'Share Deposits'], // Pie chart segments
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
            label: 'Issued Loans vs Loan Repayments',
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
  
        axios.get('api/v1/membership-management-dashboard/')
        .then((response)=>{
          membersCount.value = response.data.dashboard[0].membersCount;
          savingsAmount.value = response.data.dashboard[0].savingsAmount;
          sharesAmount.value = response.data.dashboard[0].sharesAmount;
          loansAmount.value = response.data.dashboard[0].loansAmount;
  
          chartData.value = {
            labels: ['Saving Deposits', 'Share Deposits'], // Pie chart segments
            datasets: [
              {
                label: 'Credit',
                data: [response.data.dashboard[0].savingsAmount, response.data.dashboard[0].sharesAmount], 
                backgroundColor: ['#FFCE56', '#36A2EB'], 
                hoverOffset: 4, 
              },
            ],
          };
          barChartData.value = {
            labels: ['January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September', 'October','November','December'], // X-axis labels
            datasets: [
              {
                label: 'Isued Loans',
                data: response.data.dashboard[0].monthlyIssuedTotals, // Isued Loans data points for each month
                backgroundColor: '#FFA500', // Bar color
                borderColor: '#1E88E5', // Border color of bars
                borderWidth: 1,
              },
              {
                label: 'Repayments',
                data: response.data.dashboard[0].monthlyRepaymentTotals, // Loan Repayments data points for each month
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
        membersCount,savingsAmount,sharesAmount,loansAmount,chartData,chartOptions,
        barChartData,barChartOptions
      }
    }
  }
  </script>
  <style scoped>
  
  .main-content{
    z-index: -1;
    margin-left: 1px;
    margin-top: 40px;
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
  