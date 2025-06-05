<template>
    <div class="main-content z-10 bg-gray-100 px-4 py-4 overflow-y-hidden">
      <div class="subsection flex w-full">
        <div class="w-3/4 mr-3">
          <div class="flex mb-3">
            <div class="w-1/2 h-[300px] rounded-lg py-5 px-2 bg-white mr-2">
              <h1 class="font-bold mb-10">Sales Overview</h1>
              <div class="flex w-full mb-3">
                <div class="w-1/2 rounded-lg h-16 border-2 p-2 mr-4">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-cyan-600 h-10 grid place-items-center">
                      <i class="fa fa-shopping-cart" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{assetCount}}</p>
                      <p class="font-light text-sm">Assets</p>
                    </div>
                  </div>
                </div>
                <div class="w-1/2 rounded-lg h-16 border-2 p-2">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-orange-400 h-10 grid place-items-center">
                      <i class="fa fa-store" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{Number(clientsCount).toLocaleString()}}</p>
                      <p class="font-light text-sm">Sale Clients</p>
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
                      <p class="font-bold">{{Number(assetUnits).toLocaleString()}}</p>
                      <p class="font-light text-sm">AssetUnits</p>
                    </div>
                  </div>
                </div>
                <div class="w-1/2 rounded-lg h-16 border-2 p-2">
                  <div class="w-full flex">
                    <div class="w-1/4 rounded-lg bg-rose-600 h-10 grid place-items-center">
                      <i class="fa fa-money" aria-hidden="true"></i>
                    </div>
                    <div class="w-3/4 px-2">
                      <p class="font-bold">{{ Number(salesAmount).toLocaleString() }}</p>
                      <p class="font-light text-sm">Sales Amount</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-1/2 rounded-lg h-[300px] py-4 px-2 bg-white flex">
              <div class="basis-1/4"></div>
              <div class="basis-1/2 h-[250px]">
                <h1 class="font-bold mb-2">Asset Units</h1>
                <Pie id="my-chart-id" :data="chartData" :options="chartOptions" />
              </div>
              <div class="basis-1/4"></div>
            </div>
          </div>
  
          <div class="w-full rounded-lg py-3 px-8 bg-white appointments-table">
              <h1 class="font-bold mb-3">Monthly Sales vs Repayments</h1>
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
      const assetCount = ref(0);
      const clientsCount = ref(0);
      const salesAmount = ref(0);
      const assetUnits = ref(0);
      const companyID = computed(()=> store.state.userData.company_id);
      const chartData = ref({
        labels: ['Available Units','Reserved Units','Sold Units'], // Pie chart segments
        datasets: [
          {
            label: 'Credit',
            data: [500, 300, 200], // Data for each segment
            backgroundColor: ['#32CD32','#FFCE56','#36A2EB'], // Colors for each segment
            hoverOffset: 4, // Hover effect
          },
        ],
      });
      const barChartData = ref({
        labels: ['January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September', 'October','November','December'], // X-axis labels
        datasets: [
          {
            label: 'Monthly Sales vs Repayments',
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
  
        axios.get('api/v1/asset-sales-dashboard/')
        .then((response)=>{
          assetCount.value = response.data.dashboard[0].assetsCount;
          clientsCount.value = response.data.dashboard[0].clientsCount;
          salesAmount.value = response.data.dashboard[0].salesAmount;
          assetUnits.value = response.data.dashboard[0].assetUnits;
  
          chartData.value = {
            labels: ['Available Units','Reserved Units','Sold Units'], // Pie chart segments
            datasets: [
              {
                label: 'Credit',
                data: [response.data.dashboard[0].availableUnits, response.data.dashboard[0].reservedUnits, response.data.dashboard[0].soldUnits], // Data for each segment
                backgroundColor: ['#32CD32','#FFCE56','#36A2EB'], 
                hoverOffset: 4, 
              },
            ],
          };
          barChartData.value = {
            labels: ['January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September', 'October','November','December'], // X-axis labels
            datasets: [
              {
                label: 'Monthly Sales',
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
        assetCount,clientsCount,salesAmount,assetUnits,chartData,chartOptions,
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
  