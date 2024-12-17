<template>
    <div class="table-container w-full text-left px-4 py-2">
        <table style="width: 100%;">
            <thead class="mb-3">
                <tr>
                    <th style="width: 40%;">Item</th>
                    <th style="width: 8%;">Initial</th>
                    <th style="width: 8%;">Adjusted</th>
                    <th style="width: 6%;">Quantity</th>
                    <th style="width: 8%;">Operation</th>
                    <th style="width: 10%;">P.Price</th>
                    <th style="width: 10%;">S.Price</th>
                    <th style="width: 10%;">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in adjustmentItemsRows" :key="rowIndex" class="cursor-pointer even:bg-gray-100 text-xxs sm:text-xs uppercase">
                    <td >{{ row.inventory_item_name }}</td>
                    <td >{{  Number(row.stock_at_hand).toLocaleString() }}</td>
                    <td >{{  Number(row.adjusted_stock).toLocaleString() }}</td>
                    <td >{{  Number(row.quantity).toLocaleString() }}</td>
                    <td class="font-bold text-green-600" v-if="row.operation == 'Add'">{{ row.operation }}</td>
                    <td class="font-bold text-red-600" v-else>{{ row.operation }}</td>
                    <td >{{  Number(row.purchase_price).toLocaleString() }}</td>
                    <td >{{  Number(row.selling_price).toLocaleString() }}</td>      
                    <td  v-if="row.operation == 'Add'">{{ Number(row.adjustment_total).toLocaleString()}}</td>
                    <td  v-else>({{ Number(row.adjustment_total).toLocaleString()}})</td>
                </tr>
                <tr class="font-bold text-xs">
                    <td></td>
                    <td></td>
                    <td>{{ Number(calculateStockTotal()).toLocaleString() }}</td>
                    <td>{{ Number(calculateQuantityTotal()).toLocaleString() }}</td>
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
    name: 'StockAdjustments',
    props:{
        adjustmentItemsRows: {
            type: Array,
            default: () => []
        },
    },
    setup(props){
        const calculateQuantityTotal =() =>{
            return props.adjustmentItemsRows.reduce((total, row) => {
                const value = typeof row['quantity'] === 'string' ? (parseFloat((row['quantity']).replace(/,/g, '')) || 0) : (parseFloat(row['quantity'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateStockTotal =() =>{
            return props.adjustmentItemsRows.reduce((total, row) => {
                const value = typeof row['adjusted_stock'] === 'string' ? (parseFloat((row['adjusted_stock']).replace(/,/g, '')) || 0) : (parseFloat(row['adjusted_stock'])|| 0);
                return total + value;
            }, 0);
        };
        const calculateNetTotal =() =>{
            return props.adjustmentItemsRows.reduce((total, row) => {
                const value = typeof row['adjustment_total'] === 'string' ? (parseFloat((row['adjustment_total']).replace(/,/g, '')) || 0) : (parseFloat(row['adjustment_total'])|| 0);
                return total + value;
            }, 0);
        };
        return{
            calculateQuantityTotal,calculateStockTotal,calculateNetTotal
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