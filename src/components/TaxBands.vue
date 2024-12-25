<template>
    <div class="table-container w-full text-left px-4 py-2">
        <table style="width: 100%;">
            <thead class="mb-3">
                <tr>
                    <th style="width: 15%;">From</th>
                    <th style="width: 15%;">To</th>
                    <th style="width: 15%;">Rate(%)</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in detailRows" :key="rowIndex" class="cursor-pointer even:bg-gray-100 text-xxs sm:text-xs uppercase">
                    <td>{{ Number(row.amount_from).toLocaleString() }}</td>
                    <td>{{ Number(row.amount_to).toLocaleString() }}</td>
                    <td>{{ Number(row.tax_rate).toLocaleString() }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed} from 'vue';

export default defineComponent({
    name: 'TaxBands',
    props:{
        detailRows: {
            type: Array,
            default: () => []
        },
    },
    setup(props){
        
        return{

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