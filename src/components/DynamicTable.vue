<template>
  <div class="table-container overflow-x-auto">
    <table ref="tableRef" class="dynamic-table rounded min-w-full">
      <thead class="bg-gray-800 text-white">
        <tr class="rounded bg-slate-800 text-white font-semibold text-xxs sm:text-xs uppercase">
          <th v-for="(column, index) in columns" :key="index"  :hidden="column.hidden" @click="handleSort(column)"
              :class="`min-w-[${column.minWidth}] max-w-[${column.maxWidth}]`">
            <template v-if="column.type === 'checkbox'">
              <input type="checkbox" class="mt-0.5" @change="toggleSelectAll" :checked="allSelected" />
            </template>
            <template v-else>
              {{ column.label }}
              <span v-if="sortColumn === column.key">
                {{ sortDirection === 'asc' ? '▲' : '▼' }}
              </span>
            </template>
          </th>
          <th style="width: 5%" v-if="showActions">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="table-body text-xxs">
          <template v-for="(rows, groupKey) in groupedRows" :key="groupKey">
          <!-- Group Header Row -->
          <tr @click="toggleGroup(groupKey)" class="cursor-pointer font-bold bg-slate-200 text-xs uppercase hover:bg-slate-300" v-if="groupingKey">
            <td :colspan="columns.length + (showActions ? 1 : 0)">
              <span class="mr-2">
                {{ expandedGroups[groupKey] !== false ? '▼' : '▶' }}
              </span>
              {{ groupKey }} ({{ rows.length }} {{ pluralize(rows[0]?.group_label, rows.length) }})
            </td>
          </tr>
          <template v-if="expandedGroups[groupKey] !== false">
            <tr v-for="(row, rowIndex) in rows" :key="rowIndex" @click="handleClick(row)" @dblclick="handleRowClick(row, rowIndex)" @contextmenu="handleRightClick(row, rowIndex, $event)" :style="shouldAddLine(row) ? { textDecoration: 'line-through' } : {}" :class="['cursor-pointer text-xxs sm:text-xs uppercase', `hover:bg-orange-50`, row.reconciled === 'Yes' ? 'bg-green-200': row.selected ? 'bg-orange-100' : (rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white')]">
              <td v-for="(column, colIndex) in columns" :key="colIndex" :hidden="column.hidden" 
                  :class="[{'ellipsis': column.maxWidth}, { 'max-w-[300px]': column.maxWidth }, { 'min-w-[120px]': column.minWidth }]">
                <template v-if="column.type === 'checkbox'">
                  <input type="checkbox" v-model="row.selected" class="checkbox mt-0.5" @change.stop="updateSelectedIds(row, rowIndex)" @click.stop/>
                </template>
                <template v-else-if="column.type === 'dropdown'">
                  <select @change="handleChange($event, row)" v-model="row[column.key]" :name="row[column.key]" class="bg-inherit outline-none h-full text-xxs sm:text-xs w-full uppercase">
                    <option v-for="(option, index) in row.options" :key="index" :value="option.value">{{ option.text }}</option>
                  </select>
                </template>
                <template v-else-if="column.type === 'select-dropdown'">
                  <select @change="handleChange($event, row, column)" v-model="row[column.key]" :name="row[column.key]" :class="[`bg-inherit outline-none h-full text-xxs sm:text-xs w-full uppercase`]" >
                    <option v-for="(option, index) in column.options" :key="index" :value="option.value">{{ option.text }}</option>
                  </select>
                </template>
                <template v-else-if="column.type === 'link'">
                  <span class="text-blue-600 underline cursor-pointer" @dblclick="handleLinkDblClick(row, column.key)">
                    {{ row[column.key] }}
                  </span>
                </template>
                <!-- <template v-if="column.type === 'data-checkbox'">
                  <input v-model="row[column.key.selected]" @change="checkboxSelection(row)"  :name="row[column.key]" type="checkbox" :class="`checkbox mt-0.5`"/>
                </template> -->
                <template v-else>
                  <div v-if="column.editable === true && column.type === 'number'" :class="`text-${row[column.txtColor]}-500 font-bold`">
                    <input :type="column.type" @change="handleInputChange($event, row)" pattern="^\d+(\.\d{0,2})?$" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\.\d{2})\d+/g, '$1')" class="w-full" v-model="row[column.key]" />             
                  </div>
                  <div v-else-if="column.editable === true">
                    <input :type="column.type" @change="handleInputChange($event, row)" v-model="row[column.key]" :class="[showValidation ? 'zigzag-border' : '']" /> 
                  </div>
                  <div v-else :class="[`bg-${row[column.textColor]}-500`, `text-${row[column.txtColor]}-500`, { 'font-bold': !!row[column.txtColor] }]">
                    {{ getNestedValue(row, column.key) }}
                  </div>
                </template>
              </td>
              <td class="flex gap-x-2 h-6 border-0" v-if="showActions">
                <div v-for="action in actions">
                  <button :class="{ 'disabled': isDisabled(`${action.rightName}`) }" @click.stop="handleAction(rowIndex, action.name, action.rightName, row)" :title="action.title">
                    <i :class="[action.icon, iconColor(action.icon)]"></i>
                  </button>
                </div>
              </td>
            </tr>
          </template>
          
        </template>
        <tr class="font-bold text-xxs sm:text-sm" v-if="showTotals && rows.length">
          <td v-for="(column, colIndex) in columns" :key="colIndex" 
              :class="[{'ellipsis': column.maxWidth}, { 'max-w-[300px]': column.maxWidth }, { 'min-w-[120px]': column.minWidth }]">
            <template v-if="column.type === 'number'">
              {{ Number(calculateColumnTotal(column.key)).toLocaleString() }}
            </template>
          </td>
          <td class="" v-if="showActions"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<script>
import { defineComponent, ref, onMounted, computed, onBeforeMount} from 'vue';
import axios from "axios";
import { useStore } from "vuex";
import { reactive } from 'vue';


export default defineComponent({
  name: 'DynamicTable',
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    rows: {
      type: Array,
      default: () => []
    },
    idField: {
      type: String,
      required: true
    },
    actions: {
      type: Array,
      default: () => [],
      required: false
    },
    showActions:{
      type: Boolean,
      default: () => true,
      required: false
    },
    showTotals:{
      type: Boolean,
      default: () => false,
      required: false
    },
    rightsModule:{
      type: String,
      default: () => ''
    },
    groupingKey: {
      type: String,
      default: null,
    },
    enableContextMenu: {
      type: Boolean,
      default: false
    },
  },
  emits : ['row-db-click','link-db-click', 'action-click','selection-changed', 'update-receipt-amount'],
  setup(props, { emit }) {

    const tableRef = ref(null);
    const selectedIds = ref([]);
    const store = useStore(); 
    const allowedRights = computed(()=> store.state.userData.permissions);
    const defaultSettings = computed(()=> store.state.userData.defaultSettings);
    const companyID = computed(()=> store.state.userData.company_id);
    const userID = computed(()=> store.state.userData.user_id);
    const sortColumn = ref(null);
    const sortDirection = ref('asc');
    const showValidation = ref(false);
    const enableContextMenu = computed(() => props.enableContextMenu);

    // Initialize selected state for each row
    props.rows.forEach(row => {
      row.selected = false;
    });

    const shouldAddLine = (row) =>{
    // Add your condition here based on the column value
      return row.reversed === 'Yes'; 
    };
    let clickTimeout = null;
    let isDoubleClick = false;
    const handleRowClick = (row, rowIndex) => {
      isDoubleClick = true;
      clearTimeout(clickTimeout);
      if( row.reconciled){
        row.rowColor = row.reconciled ? 'bg-green-200' : null;
        if(row.reconciled === 'Yes'){
          row.reconciled = 'No';
        }else{
          row.reconciled = 'Yes';
        }
      }
      
      emit('row-db-click', row, rowIndex);
      setTimeout(() => (isDoubleClick = false), 0);
    };
    const handleClick = (row) => {
      if (isDoubleClick) return;
  
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        if (isDoubleClick) return;

        props.rows.forEach(r => {r.selected = false;});
        row.selected = true;
        selectedIds.value = [row[props.idField]];
        emit('selection-changed', selectedIds.value);
      }, 200);
      
    };
    const handleRightClick = (row, rowIndex, event) => {
      if (!enableContextMenu.value) {
        return;
      }
      event.preventDefault();
      emit('right-click', row, rowIndex, event);
    };

    const handleAction = (rowIndex, action, right, row) => {
      if(!isDisabled(right) ){
        emit('action-click', rowIndex, action, row);
      }
    }

    const toggleSelectAll = (event) => {
      const isSelected = event.target.checked;
      props.rows.forEach(row => {
        row.selected = isSelected;
      });
      selectedIds.value = isSelected ? props.rows.map(row => row[props.idField]) : [];
      emit('selection-changed', selectedIds.value);
    };

    const updateSelectedIds = (row) => {
      const rowId = row[props.idField];
      if(row.selected && !row.reconciled){
        selectedIds.value.push(rowId);
      }else {
        const index = selectedIds.value.indexOf(rowId);
        if (index > -1) {
          selectedIds.value.splice(index, 1);
        }  
      }
      emit('selection-changed', selectedIds.value);
    };
    const allSelected = computed(() => {
      return selectedIds.value.length === props.rows.length;
    });

    const getNestedValue = (row, key) => {
      return key.split('.').reduce((obj, keyPart) => obj && obj[keyPart], row);
    };
    // Sort rows based on the selected column and direction
    const sortedRows = computed(() => {
      if (!sortColumn.value) return props.rows;

      return [...props.rows].sort((a, b) => {
        const aVal = getNestedValue(a, sortColumn.value);
        const bVal = getNestedValue(b, sortColumn.value);

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return sortDirection.value === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    });

    const handleSort = (column) => {
      if (sortColumn.value === column.key) {
        // Toggle direction
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn.value = column.key;
        sortDirection.value = 'asc';
      }
    };

    //GROUPING ITEMS BY CATEGORY
    const expandedGroups = reactive({});
    const groupingKey = computed(() => props.groupingKey);
    const groupedRows = computed(() => {
      if (!props.groupingKey) {
        return { All: props.rows };
      }

      const groups = {};

      sortedRows.value.forEach(row => {
        const groupKey = row.group_category || 'Ungrouped';
        const groupLabel = row.group_label || 'Item';

        if (!groups[groupKey]) {
          groups[groupKey] = []
        }

        groups[groupKey].push(row);
      });

      return groups;
    });

    const toggleGroup = (groupKey) => {
      expandedGroups[groupKey] = !expandedGroups[groupKey];
    };
    const pluralize = (word = 'Item', count) => {
      if (!word) return ''; 
      if (count === 1) return word;

      // Basic pluralization rules
      if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
      return word + 's';
    };


    //JOURNALS
    const journalLineCheck = (row) =>{
      let debitAmount = parseFloat(row.debit_amount) || 0;
      let creditAmount = parseFloat(row.credit_amount) || 0;
      const description = row.description || '';
      if(description == ''){
        showValidation.value = true;
        row.credit_amount = 0;
        row.debit_amount = 0;
      }else{
        showValidation.value = false;
        if(debitAmount > 0){
          row.credit_amount = 0;
        }else if(creditAmount > 0){
          row.debit_amount = 0;
        }
      }
      
    }
    //TABLE TOTALS
    const calculateColumnTotal =(columnKey) =>{
        return props.rows.reduce((total, row) => {
            const value = typeof row[columnKey] === 'string' ? (parseFloat((row[columnKey]).replace(/,/g, '')) || 0) : (parseFloat(row[columnKey])|| 0);
            return total + value;
        }, 0);
    };

    const calculateTaxAmount = (row) =>{
      const subTotal = (parseFloat(row.quantity) * parseFloat(row.cost)) || 0;
      const taxRate = parseFloat(row.vat_rate?.tax_rate) || 0;
      const description = row.description || '';
      if(description == ''){
        showValidation.value = true;
        row.sub_total = 0;
        row.vat_amount = 0;
        row.total_amount = 0;
        row.item_sales_income = 0;
        row.cost = 0;
      }else{
        showValidation.value = false;
        if(taxRate > 0){
          const taxIncl = row.vat_inclusivity || "Inclusive";
          let totalAmount = parseFloat(row.total_amount) || 0;
          let taxAmount = parseFloat(row.vat_amount) || 0;
          let salesIncome = ((parseFloat(row.selling_price) - parseFloat(row.cost)) * parseFloat(row.quantity)) || 0;
          if(taxIncl == "Inclusive" && taxRate != 0){
            taxAmount = ((taxRate/100) * subTotal).toFixed(2);
            totalAmount = subTotal.toFixed(2);
            row.vat_amount = taxAmount;
            row.sub_total = (parseFloat(subTotal) - parseFloat(taxAmount)).toFixed(2);
            row.total_amount = totalAmount;
            row.item_sales_income = salesIncome - taxAmount;
          }else{
            taxAmount = ((taxRate/100) * subTotal).toFixed(2);
            totalAmount = (parseFloat(subTotal) + parseFloat(taxAmount)).toFixed(2);
            row.sub_total = subTotal.toFixed(2);
            row.vat_amount = taxAmount;
            row.total_amount = totalAmount;
            row.item_sales_income = salesIncome;
          }
        }else if(subTotal > 0){
          row.sub_total = subTotal;
          row.total_amount = subTotal;
        }
      }
    };
    //CALCULATE EMPLOYEE APPRAISAL AVERAGE RATING
    const calculateAverageRating = (row) =>{

      const employeeRating = parseFloat(row.employee_rating)|| 0;
      const supervisorRating = parseFloat(row.supervisor_rating)|| 0;
      const appraisalMethod = row.appraisal_method || "Supervisor Only";
      let averageRating = parseFloat(row.average_rating)|| 0;
      const minWeight = parseFloat(row.min_weight)|| 0;
      const maxWeight = parseFloat(row.max_weight)|| 0;

      if(appraisalMethod == "Employee & Supervisor" ){
        if(((minWeight > employeeRating) && (minWeight > supervisorRating)) || ((maxWeight < employeeRating) && (maxWeight < supervisorRating))){
          averageRating = 0;
          row.employee_rating = minWeight;
          row.supervisor_rating = minWeight;
          row.average_rating = minWeight;
        }else{
          if(supervisorRating == 0){
            if((minWeight > employeeRating) || (maxWeight < employeeRating)){
              row.employee_rating = minWeight;
              row.average_rating = minWeight;
            }else{
              averageRating = employeeRating;
            }
            
          }else{
            averageRating = ((employeeRating + supervisorRating) / 2).toFixed(2);
          }
          
          row.average_rating = averageRating;
        }
        
      }else{
        if((minWeight > supervisorRating) || (maxWeight < supervisorRating)){
          averageRating = 0;
          row.supervisor_rating = minWeight;
          row.average_rating = minWeight;
        }else{
          row.average_rating = supervisorRating;
        }
        
      }
      emit('update-average-rating', row.average_rating)
    };
    //CHECK MEMBER LOAN FREE SAVINGS OR SHARES
    const checkFreeSavings = (row) =>{
      const strictGrntship = defaultSettings.value.find(p => p.setting_name === "Disable Strict Guarantorship");
      if(strictGrntship && strictGrntship.setting_value == "No"){
        let freeSavings = parseFloat(row.free_savings) || 0;
        let freeShares = parseFloat(row.free_shares) || 0;
        let grntOption = row.guarantee_option;
        let grntAmount = row.guarantee_amount;

        if(grntOption == "Savings"){
          if(grntAmount > freeSavings){
            row.guarantee_amount = 0;
          }
        }else if(grntOption == "Shares"){
          if(grntAmount > freeShares){
            row.guarantee_amount = 0;
          }
        }
      }
      
    };
    //CALCULATE ASSET SALE UNIT TOTAL AMOUNT
    const calculateAssetUnitAmount = (row) =>{
      let totalAmount = parseFloat(row.unit_selling_price) || 0;
      let discount = parseFloat(row.discount) || 0;
      let charges_amount = parseFloat(row.charges_amount) || 0;
      
      if((row.unit_selling_price != null) && (row.discount != null) && (row.charges_amount != null)){
          let saleAmount = (totalAmount + charges_amount - discount).toFixed(2);
          row.sale_total_amount = saleAmount;
          row.formatted_sale_total_amount = Number(saleAmount).toLocaleString();   
      }       
    };

    const handleChange = (event, row, column) =>{
      const selectedValue = event.target.value;
      calculateTaxAmount(row);
      if (column.method && typeof column.method === 'function') {
        column.method(row); 
      } else {
        console.warn('Column method is not defined or is not a function');
      }
    }

    const handleInputChange = (event, row) =>{
      
      calculateAverageRating(row);
      calculateTaxAmount(row);
      updateUnits(row);
      receiptAllocation(row);
      journalLineCheck(row);
      checkFreeSavings(row);
      calculateAssetUnitAmount(row);
    };

    const handleLinkDblClick = (row) =>{
      emit('link-db-click', row);
    };

    //METER READING
    const updateUnits = (row) =>{
      const prevReading = parseFloat(row.prev_reading) || 0;
      const currReading = parseFloat(row.current_reading) || 0;
      if(row.prev_reading || row.current_reading){
        row.units_consumed = (currReading - prevReading).toFixed(2);
        row.total = ((row.units_consumed * row.unit_cost) + row.meter_rent).toFixed(2)
      }
      

    }
    //RECEIPTING
    const receiptAllocation = (row) =>{
      const invAmount = parseFloat(row.due_amount) || 0;
      const paymentAllocation = parseFloat(row.payment_allocation) || 0;
      const balance = (invAmount - paymentAllocation).toFixed(2);
      const description = row.description || '';
      if(description == ""){
        row.payment_allocation = 0;
        row.bal_after_alloc = 0;
      }else{
        if(balance >= 0){
          row.bal_after_alloc = balance;
        }else{
          row.payment_allocation = 0;
          row.bal_after_alloc = 0;
        }
      }
      
      emit('update-receipt-amount', paymentAllocation)
    };

    const isDisabled =(permissionName) =>{
        const permission = allowedRights.value.find(p => p.rightName === permissionName);
        return permission ? !permission.right_status : true;
    };

    const checkboxSelection = (row) => {
      const isChecked = row.selected;
    };

    const iconColor = (icon) =>{
      const colors = {
        'fa fa-trash': 'text-red-600',
        'fa fa-minus-circle': 'text-red-600',
        'fa fa-edit': 'text-blue-600',
        'fa fa-check-circle': 'text-green-600',
        'fa fa-print': 'text-gray-700',
        'fa fa-paperclip': 'text-slate-600',
        'fas fa-comment': 'text-green-600',
        'fas fa-envelope': 'text-cyan-600',
        'fa fa-exchange': 'text-amber-600',
        'fa fa-cloud-upload': 'text-indigo-600',
        'fa fa-search-plus': 'text-blue-600',
      };
      return colors[icon] || '';
    }

    onMounted(() => {
      // Optional: Adjust column widths programmatically if needed
      const table = tableRef.value;
      if (table) {
        const ths = table.querySelectorAll('thead th');
        const tds = table.querySelectorAll('tbody td');
        // Logic to ensure column widths are consistent
      }
; 
    });
    onBeforeMount(() =>{
      
    })

    return {
      handleClick,handleRowClick,handleLinkDblClick,handleRightClick, handleAction, handleChange, getNestedValue, handleInputChange,
      tableRef, toggleSelectAll, selectedIds, allSelected, updateSelectedIds, calculateColumnTotal,isDisabled,
      shouldAddLine,sortedRows,sortColumn,sortDirection,handleSort,groupedRows,expandedGroups,toggleGroup,pluralize,
      groupingKey,checkboxSelection,iconColor,showValidation,
    };
  }
});
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
thead th {
  position: sticky;
  top: 0;
  /* z-index: 10; */
}
input {
  width: 100%;
  box-sizing: border-box;
}
.table-container {
  position: relative;
  /* max-height: 59vh; */
  max-height: 70vh;
  min-height: 20vh;
  overflow-y: auto;
  overflow-x: auto;
}

.dynamic-table {
  width: 100%;
  border-collapse: collapse;
  /* table-layout: fixed; */
}

.dynamic-table th {
  border: 1px solid #ccc;
  padding: 3px;
  text-align: left;
}

.dynamic-table td {
  border: 1px solid #ccc;
  padding: 2px;
  text-align: left;
}

.dynamic-table input{
  text-align: left;
  outline: none;
  background-color: inherit;
}
.actions{
  /* padding: 9px; */
  height: inherit;
}

/* Style for fixed header */
.table-container thead th {
  position: sticky;
  top: 0;
  background: #3b4252;
}

/* .table-body tr:nth-child(even) {
  background-color: #f2f2f2;
} */
.ellipsis {
  max-width: 350px; /* Adjust the max-width as needed */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.zigzag-border {
  border: 2px solid red;
  border-image: repeating-linear-gradient(
    -45deg,
    red 0 5px,
    transparent 5px 10px
  ) 10;
}

</style>
  