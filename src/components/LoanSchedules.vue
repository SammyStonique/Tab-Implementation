<template>
    <div class="table-container w-full text-left px-4 py-2">
        <table style="width: 100%;">
            <thead class="mb-3">
                <tr>
                    <th style="width: 5%;">Instl#</th>
                    <th style="width: 10%;">Date</th>
                    <th style="width: 15%;">Loan Balance</th>
                    <th style="width: 10%;">Principal</th>
                    <th style="width: 10%;">Interest</th>
                    <th style="width: 10%;">Penalty</th>
                    <th style="width: 10%;">Paid Principal</th>
                    <th style="width: 10%;">Paid Interest</th>
                    <th style="width: 10%;">Paid Penalty</th>
                    <th style="width: 5%;">Int. Posted</th>
                    <th style="width: 5%;">Deducted</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in loanSchedulesRows" :key="rowIndex" class="cursor-pointer even:bg-gray-100 text-xxs sm:text-xs uppercase">
                    <td>{{ row.installment }}</td>
                    <td>{{ row.due_date }}</td>
                    <td>{{ Number(row.loan_balance).toLocaleString()  }}</td>
                    <td>{{ Number(row.principal_amount).toLocaleString() }}</td>
                    <td>{{ Number(row.interest_amount).toLocaleString() }}</td>
                    <td>{{ Number(row.penalty).toLocaleString() }}</td>
                    <td>{{ Number(row.repaid_principal_amount).toLocaleString() }}</td>
                    <td>{{ Number(row.repaid_interest_amount).toLocaleString() }}</td>
                    <td>{{ Number(row.repaid_penalty).toLocaleString() }}</td>
                    <td>{{ row.interest_posted }}</td>
                    <td>{{ row.deducted }}</td>
                </tr>
                <tr class="font-bold text-xs">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{{ Number(calculatePrincipalAmount()).toLocaleString() }}</td>
                    <td>{{ Number(calculateInterestAmount()).toLocaleString() }}</td>
                    <td>{{ Number(calculatePenalty()).toLocaleString() }}</td>
                    <td>{{ Number(calculateRepaidPrincipal()).toLocaleString() }}</td>
                    <td>{{ Number(calculateRepaidInterest()).toLocaleString() }}</td>
                    <td>{{ Number(calculateRepaidPenalty()).toLocaleString() }}</td>
                    <td></td>
                    <td></td>

                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed} from 'vue';

export default defineComponent({
    name: 'LoanSchedules',
    props:{
        loanSchedulesRows: {
            type: Array,
            default: () => []
        },
    },
    setup(props){
        const calculatePrincipalAmount =() =>{
            return props.loanSchedulesRows.reduce((total, row) => {
                const value = typeof row['principal_amount'] === 'string' ? (parseFloat((row['principal_amount']).replace(/,/g, '')) || 0) : (parseFloat(row['principal_amount'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateInterestAmount =() =>{
            return props.loanSchedulesRows.reduce((total, row) => {
                const value = typeof row['interest_amount'] === 'string' ? (parseFloat((row['interest_amount']).replace(/,/g, '')) || 0) : (parseFloat(row['interest_amount'])|| 0);
                return total + value;
            }, 0);
        };
        const calculatePenalty =() =>{
            return props.loanSchedulesRows.reduce((total, row) => {
                const value = typeof row['penalty'] === 'string' ? (parseFloat((row['penalty']).replace(/,/g, '')) || 0) : (parseFloat(row['penalty'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateRepaidPrincipal =() =>{
            return props.loanSchedulesRows.reduce((total, row) => {
                const value = typeof row['repaid_principal_amount'] === 'string' ? (parseFloat((row['repaid_principal_amount']).replace(/,/g, '')) || 0) : (parseFloat(row['repaid_principal_amount'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateRepaidInterest =() =>{
            return props.loanSchedulesRows.reduce((total, row) => {
                const value = typeof row['repaid_interest_amount'] === 'string' ? (parseFloat((row['repaid_interest_amount']).replace(/,/g, '')) || 0) : (parseFloat(row['repaid_interest_amount'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateRepaidPenalty =() =>{
            return props.loanSchedulesRows.reduce((total, row) => {
                const value = typeof row['repaid_penalty'] === 'string' ? (parseFloat((row['repaid_penalty']).replace(/,/g, '')) || 0) : (parseFloat(row['repaid_penalty'])|| 0);
                return total + value;
            }, 0);
        };
        return{
            calculatePrincipalAmount,calculateInterestAmount,calculatePenalty,calculateRepaidPrincipal,calculateRepaidInterest,calculateRepaidPenalty
        }
    }
})

</script>

<style scoped>
.table-container {
  position: relative;
  max-height: 110px;
  min-height: 80px;
  overflow-y: auto;
  overflow-x: auto;
}

</style>