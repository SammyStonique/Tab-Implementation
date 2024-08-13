<template>
  <div class="table-container">
    <table ref="tableRef" class="dynamic-table rounded">
      <thead class="bg-gray-800 text-white">
        <tr class="rounded bg-slate-800 text-white font-semibold text-sm uppercase">
          <th v-for="(column, index) in columns" :key="index">
            <template v-if="column.type === 'checkbox'">
              <input type="checkbox" @change="toggleSelectAll" :checked="allSelected" />
            </template>
            <template v-else>
              {{ column.label }}
            </template>
          </th>
          <th style="width: 5%">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="table-body">
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex" @click="handleRowClick(row)" class="even:bg-gray-100 text-xs uppercase">
          <td v-for="(column, colIndex) in columns" :key="colIndex">
            <template v-if="column.type === 'checkbox'">
              <input type="checkbox" v-model="row.selected" class="checkbox" @change="updateSelectedIds(row)"/>
            </template>
            <template v-else>
              <div v-if="column.editable === true">
                <input :type="column.type" pattern="[0-9]*" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class="w-full text-xs uppercase" v-model="row[column.key]" />             
              </div>
              <div v-else>
                {{ row[column.key] }}
              </div>
            </template>
            <!-- {{ row[column.key] }} -->
          </td>
          <td class="actions flex gap-2 border-0">
            <div v-for="action in actions" >
              <button @click.stop="handleAction(rowIndex,action.name, row)" :title="action.title"><i :class="action.icon"></i></button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed} from 'vue';

export default defineComponent({
  name: 'DynamicTable',
  props: {
    columns: {
      type: Array,
      required: true
    },
    rows: {
      type: Array,
      required: true
    },
    idField: {
      type: String,
      required: true
    },
    actions: {
      type: Array,
      required: true
    },
  },
  emits: ['row-click'],
  setup(props, { emit }) {

    const tableRef = ref(null);
    const selectedIds = ref([]);

    // Initialize selected state for each row
    props.rows.forEach(row => {
      row.selected = false;
    });

    const handleRowClick = (row) => {
      emit('row-click', row);
    };

    const handleAction = (rowIndex, action, row) => {
      const rowId = row[props.idField];
      console.log("THE ROW ID TO PERFORM ACTION IS ",rowId)
      console.log("THE ACTION TO PERFORM IS ",action)
      console.log("THE ROW INDEX IS ",rowIndex)
      emit('action-click', rowIndex, action, row);
    }

    const toggleSelectAll = (event) => {
      const isSelected = event.target.checked;
      props.rows.forEach(row => {
        row.selected = isSelected;
      });
      selectedIds.value = isSelected ? props.rows.map(row => row[props.idField]) : [];
      console.log("THE SELECTED IDs ARE ",selectedIds.value)
    };

    const updateSelectedIds = (row) => {
      const rowId = row[props.idField];
      if (row.selected) {
        selectedIds.value.push(rowId);
        console.log("THE SELECTED IDs ARE ",selectedIds.value)
      } else {
        const index = selectedIds.value.indexOf(rowId);
        if (index > -1) {
          selectedIds.value.splice(index, 1);
        }
      }
    }
    const allSelected = computed(() => {
      return selectedIds.value.length === props.rows.length;
    });

    onMounted(() => {
      // Optional: Adjust column widths programmatically if needed
      const table = tableRef.value;
      if (table) {
        const ths = table.querySelectorAll('thead th');
        const tds = table.querySelectorAll('tbody td');
        // Logic to ensure column widths are consistent
      }
    });

    return {
      handleRowClick, handleAction,
      tableRef, toggleSelectAll, selectedIds, allSelected, updateSelectedIds,
    };
  }
});
</script>

<style scoped>
input {
  width: 100%;
  box-sizing: border-box;
}
.table-container {
  position: relative;
  max-height: 52vh;
  min-height: 20vh;
  overflow-y: auto;
  overflow-x: auto;
}

.dynamic-table {
  width: 100%;
  border-collapse: collapse;
}

.dynamic-table th,
.dynamic-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.dynamic-table input{
  text-align: left;
  outline: none;
  background-color: inherit;
}
.actions{
  padding: 8px;
}

/* Style for fixed header */
.table-container thead th {
  position: sticky;
  top: 0;
  background: #3b4252;
}

.table-body tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
  