<template>
    <div class="table-container w-full text-left">
        <div v-if="displayButtons" class="flex flex-wrap gap-2">
            <div v-for="(field, index) in fields" :key="index" >
                <div v-if="(field.type === 'add' || field.type === 'other' || field.type === 'remove')">
                    <button  @click="field.method" :class="[{ 'disabled': isDisabled(`${field.rightName}`) },'rounded cursor-pointer text-xs px-2 py-1 font-medium border transition',field.type === 'remove'
                            ? 'bg-red-100 text-red-600 border-red-300 hover:bg-red-200': 'bg-green-100 text-green-600 border-green-300 hover:bg-green-200']">
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
import { useStore } from "vuex";

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
        const store = useStore();
        const allowedRights = computed(()=> store.state.userData.permissions);
        const handleActionClick = (rowIndex, action, row) =>{
            emit('handleActionClick',rowIndex, action, row)
        };
        const handleSelectionChange = (selectedIds) =>{
            emit('handleSelectionChange', selectedIds);
        };
        const isDisabled =(permissionName) =>{
            const permission = allowedRights.value.find(p => p.rightName === permissionName);
            return permission ? !permission.right_status : true;
        };
        return{
            handleActionClick,handleSelectionChange,isDisabled
        }
    }
})

</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.table-container {
  position: relative;
  max-height: 110px;
  min-height: 80px;
  overflow-y: auto;
  overflow-x: auto;
}

</style>