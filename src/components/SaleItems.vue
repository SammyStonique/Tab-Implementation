<template>
    <div class="table-container w-full text-left px-4 py-2">
        <table style="width: 100%;">
            <thead class="mb-3">
                <tr>
                    <th style="width: 15%;">Outlet</th>
                    <th style="width: 10%;">Date</th>
                    <th style="width: 30%;">Item</th>
                    <th style="width: 7%;">Qty</th>
                    <th style="width: 12%;">Amnt</th>
                    <th style="width: 12%;">Profit</th>
                    <th style="width: 12%;">Rcpt#</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in saleItemsRows" :key="rowIndex" class="cursor-pointer even:bg-gray-100 text-xxs sm:text-xs uppercase">
                    <td>{{ row.outlet_name }}</td>
                    <td>{{ row.date }}</td>
                    <td>{{ row.inventory_item_name }}</td>
                    <td>{{ Number(row.quantity).toLocaleString() }}</td>
                    <td>{{ Number(row.total_amount).toLocaleString() }}</td>
                    <td class="text-green-600 font-semibold">{{ Number(row.profit).toLocaleString() }}</td>
                    <td>{{ row.receipt_no }}</td>
                </tr>
                <tr class="font-bold text-xs">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{{ Number(calculateQuantityTotal()).toLocaleString() }}</td>
                    <td>{{ Number(calculateNetTotal()).toLocaleString() }}</td>
                    <td>{{ Number(calculateProfitTotal()).toLocaleString() }}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed} from 'vue';

export default defineComponent({
    name: 'SaleItems',
    props:{
        saleItemsRows: {
            type: Array,
            default: () => []
        },
    },
    setup(props){
        const calculateQuantityTotal =() =>{
            return props.saleItemsRows.reduce((total, row) => {
                const value = typeof row['quantity'] === 'string' ? (parseFloat((row['quantity']).replace(/,/g, '')) || 0) : (parseFloat(row['quantity'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateProfitTotal =() =>{
            return props.saleItemsRows.reduce((total, row) => {
                const value = typeof row['profit'] === 'string' ? (parseFloat((row['profit']).replace(/,/g, '')) || 0) : (parseFloat(row['profit'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateNetTotal =() =>{
            return props.saleItemsRows.reduce((total, row) => {
                const value = typeof row['total_amount'] === 'string' ? (parseFloat((row['total_amount']).replace(/,/g, '')) || 0) : (parseFloat(row['total_amount'])|| 0);
                return total + value;
            }, 0);
        };
        return{
            calculateQuantityTotal,calculateProfitTotal,calculateNetTotal
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