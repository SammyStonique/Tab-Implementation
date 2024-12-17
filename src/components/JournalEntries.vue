<template>
    <div class="table-container w-full text-left px-4 py-2">
        <table style="width: 100%;">
            <thead class="mb-3">
                <tr>
                    <th style="width: 30%;">Posting Account</th>
                    <th style="width: 50%;">Description</th>
                    <th style="width: 10%;">Debit</th>
                    <th style="width: 10%;">Credit</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in detailRows" :key="rowIndex" class="cursor-pointer even:bg-gray-100 text-xxs sm:text-xs uppercase">
                    <td>{{ row.posting_account_name }}</td>
                    <td>{{ row.description }}</td>
                    <td>{{ Number(row.debit_amount).toLocaleString() }}</td>
                    <td>{{ Number(row.credit_amount).toLocaleString() }}</td>
                </tr>
                <tr class="font-bold text-xs">
                    <td></td>
                    <td></td>
                    <td>{{ Number(calculateDebitTotal()).toLocaleString() }}</td>
                    <td>{{ Number(calculateCreditTotal()).toLocaleString() }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed} from 'vue';

export default defineComponent({
    name: 'JournalEntries',
    props:{
        detailRows: {
            type: Array,
            default: () => []
        },
    },
    setup(props){
        //TABLE TOTALS
        const calculateDebitTotal =() =>{
            return props.detailRows.reduce((total, row) => {
                const value = typeof row['debit_amount'] === 'string' ? (parseFloat((row['debit_amount']).replace(/,/g, '')) || 0) : (parseFloat(row['debit_amount'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateCreditTotal =() =>{
            return props.detailRows.reduce((total, row) => {
                const value = typeof row['debit_amount'] === 'string' ? (parseFloat((row['debit_amount']).replace(/,/g, '')) || 0) : (parseFloat(row['debit_amount'])|| 0);
                return total + value;
            }, 0);
        };
        return{
            calculateDebitTotal,calculateCreditTotal
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