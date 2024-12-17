<template>
    <div class="table-container w-full text-left px-4 py-2">
        <table style="width: 100%;">
            <thead class="mb-3">
                <tr>
                    <th style="width: 15%;">Receipt#</th>
                    <th style="width: 10%;">Date</th>
                    <th style="width: 60%;">Description</th>
                    <th style="width: 15%;">Amount Paid</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in rcptLinesRows" :key="rowIndex" class="cursor-pointer even:bg-gray-100 text-xxs sm:text-xs uppercase">
                    <td>{{ row.journal_no }}</td>
                    <td>{{ row.date }}</td>
                    <td>{{ row.description }}</td>
                    <td>{{ Number(row.amount_paid).toLocaleString() }}</td>
                </tr>
                <tr class="font-bold text-xs">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{{ Number(calculateNetTotal()).toLocaleString() }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed} from 'vue';

export default defineComponent({
    name: 'ReceiptLines',
    props:{
        rcptLinesRows: {
            type: Array,
            default: () => []
        },
    },
    setup(props){
        const calculateNetTotal =() =>{
            return props.rcptLinesRows.reduce((total, row) => {
                const value = typeof row['amount_paid'] === 'string' ? (parseFloat((row['amount_paid']).replace(/,/g, '')) || 0) : (parseFloat(row['amount_paid'])|| 0);
                return total + value;
            }, 0);
        };
        return{
            calculateNetTotal
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