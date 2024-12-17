<template>
    <div class="table-container w-full text-left px-4 py-2">
        <table style="width: 100%;">
            <thead class="mb-3">
                <tr>
                    <th style="width: 20%;">Date</th>
                    <th style="width: 40%;">Item</th>
                    <th style="width: 10%;">Quantity</th>
                    
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in transferItemsRows" :key="rowIndex" class="cursor-pointer even:bg-gray-100 text-xxs sm:text-xs uppercase">
                    <td>{{ row.date }}</td>
                    <td>{{ row.item_name }}</td>
                    <td>{{ Number(row.quantity).toLocaleString() }}</td>

                </tr>
                <tr class="font-bold text-xs">
                    <td></td>
                    <td></td>
                    <td>{{ Number(calculateQuantityTotal()).toLocaleString() }}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed} from 'vue';

export default defineComponent({
    name: 'StockTransfers',
    props:{
        transferItemsRows: {
            type: Array,
            default: () => []
        },
    },
    setup(props){
        const calculateQuantityTotal =() =>{
            return props.transferItemsRows.reduce((total, row) => {
                const value = typeof row['quantity'] === 'string' ? (parseFloat((row['quantity']).replace(/,/g, '')) || 0) : (parseFloat(row['quantity'])|| 0);
                return total + value;
            }, 0);
        };
        return{
            calculateQuantityTotal
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