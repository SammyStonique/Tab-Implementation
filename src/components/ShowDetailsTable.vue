<template>
    <div class="table-container w-full text-left">
        <div v-if="displayButtons" class="flex flex-wrap gap-2">
            <div v-for="(field, index) in fields" :key="index" >
                <div v-if="(field.type === 'add' || field.type === 'other' || field.type === 'remove')">
                    <button @click="field.method" :class="['rounded cursor-pointer text-xs text-white px-1 py-0.5',field.type === 'remove' ? 'bg-red-400' : 'bg-green-400']">
                        <i :class="field.icon"></i> {{ field.label }}
                    </button>
                </div>
            </div>
        </div>
        <DynamicTable 
            :columns="columns" 
            :rows="rows"
            :idField="idField"
            :actions="actions"
            :showTotals="showTotals"
            :showActions="showActions"
            @action-click="handleActionClick"
            @selection-changed="handleSelectionChange"
            :rightsModule="rightsModule"
        />
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed} from 'vue';
import DynamicTable from '@/components/DynamicTable.vue'

export default defineComponent({
    name: 'ShowDetailsTable',
    components: {
        DynamicTable
    },
    props:{
        fields:{
            type: Array,
            required: false
        },
        columns:{
            type: Array,
            default: () => []   
        },
        rows:{
            type: Array,
            default: () => []   
        },
        showTotals:{
            type: Boolean,
            default: () => false,
            required: false
        },
        showActions:{
            type: Boolean,
            default: () => true,
            required: false
        },
        actions:{
            type: Array,
            default: () => []   
        },
        idField: {
            type: String,
            default: () => ''
        },
        displayButtons:{
            type: Boolean,
            default: () => false,
            required: false
        },
    },
    setup(props, { emit }) {
        const handleActionClick = (rowIndex, action, row) =>{
            emit('handleActionClick',rowIndex, action, row)
        };
        const handleSelectionChange = (selectedIds) =>{
            emit('handleSelectionChange', selectedIds);
        };
        return{
            handleActionClick,handleSelectionChange
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