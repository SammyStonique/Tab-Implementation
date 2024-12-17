<template>
    <div class="table-container w-full text-left px-4 py-2">
        <table style="width: 100%;">
            <thead class="mb-3">
                <tr>
                    <th style="width: 10%;">Qty</th>
                    <th style="width: 60%;">Description</th>
                    <th style="width: 10%;">Invoice Amnt</th>
                    <th style="width: 10%;">Tax Amnt</th>
                    <th style="width: 10%;">Total Amnt</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in invLinesRows" :key="rowIndex" class="cursor-pointer even:bg-gray-100 text-xxs sm:text-xs uppercase">
                    <td>{{ row.quantity }}</td>
                    <td>{{ row.description }}</td>
                    <td>{{ Number(row.invoice_amount).toLocaleString() }}</td>
                    <td>{{ Number(row.tax_amount).toLocaleString() }}</td>
                    <td>{{ Number(row.total_amount).toLocaleString() }}</td>
                </tr>
                <tr class="font-bold text-xs">
                    <td></td>
                    <td></td>
                    <td>{{ Number(calculateInvoiceTotal()).toLocaleString() }}</td>
                    <td>{{ Number(calculateTaxTotal()).toLocaleString() }}</td>
                    <td>{{ Number(calculateNetTotal()).toLocaleString() }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed} from 'vue';

export default defineComponent({
    name: 'InvoiceLines',
    props:{
        invLinesRows: {
            type: Array,
            default: () => []
        },
    },
    setup(props){
        const calculateInvoiceTotal =() =>{
            return props.invLinesRows.reduce((total, row) => {
                const value = typeof row['invoice_amount'] === 'string' ? (parseFloat((row['invoice_amount']).replace(/,/g, '')) || 0) : (parseFloat(row['invoice_amount'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateTaxTotal =() =>{
            return props.invLinesRows.reduce((total, row) => {
                const value = typeof row['tax_amount'] === 'string' ? (parseFloat((row['tax_amount']).replace(/,/g, '')) || 0) : (parseFloat(row['tax_amount'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateNetTotal =() =>{
            return props.invLinesRows.reduce((total, row) => {
                const value = typeof row['total_amount'] === 'string' ? (parseFloat((row['total_amount']).replace(/,/g, '')) || 0) : (parseFloat(row['total_amount'])|| 0);
                return total + value;
            }, 0);
        };
        return{
            calculateInvoiceTotal,calculateTaxTotal,calculateNetTotal
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