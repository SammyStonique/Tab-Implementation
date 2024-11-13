<template>
    <div class="table-container">
      <table ref="tableRef" class="dynamic-table rounded">
        <thead class="bg-gray-800 text-white">
          <tr class="rounded bg-slate-800 text-white font-semibold text-sm uppercase">
            <th v-for="(column, index) in columns" :key="index" :class="`min-w-[${column.minWidth}] max-w-[${column.maxWidth}]`">
              <template v-if="column.type === 'checkbox'" >
                <input type="checkbox" @change="toggleSelectAll" :checked="allSelected" />
              </template>
              <template v-else>
                {{ column.label }}
              </template>
            </th>
            <th style="width: 5%" v-if="showActions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex" @dblclick="handleRowClick(row)" class="cursor-pointer even:bg-gray-100 text-xxs uppercase">
            <td v-for="(column, colIndex) in columns" :key="colIndex" :class="[{'ellipsis': column.maxWidth}, { 'max-width': column.maxWidth },{ 'min-width': column.minWidth }]" >
              <template v-if="column.type === 'checkbox'">
                <input type="checkbox" v-model="row.selected" class="checkbox" @change="updateSelectedIds(row)"/>
              </template>
              <template v-else-if="column.type === 'dropdown'">
                <select @change="handleChange($event, row)" v-model="row[column.key]" :name="row[column.key]" class="bg-inherit outline-none h-full text-xxs w-full uppercase">
                  <option v-for="(option, index) in row.options" :key="index" :value="option.value">{{ option.text }}</option>
                </select>
              </template>
              <template v-else-if="column.type === 'select-dropdown'">
                <select @change="handleChange($event, row)" v-model="row[column.key]" :name="row[column.key]" class="bg-inherit outline-none h-full text-xxs w-full uppercase">
                  <option v-for="(option, index) in column.options" :key="index" :value="option.value">{{ option.text }}</option>
                </select>
              </template>
              <template v-else >            
                <div v-if="column.editable === true && column.type === 'number'" class="max-w-[100px]" :class="`text-${column.textColor}-800 font-bold`">
                  <input :type="column.type" @change="handleInputChange($event, row)" pattern="[0-9]*" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class="w-full" v-model="row[column.key]" />             
                </div>
                <div v-else-if="column.editable === true">
                  <input :type="column.type" @change="handleInputChange($event, row)" class="w-inherit" v-model="row[column.key]" /> 
                </div>
                <div v-else :class="`text-${column.textColor}-500`">
                  <!-- {{ row[column.key] }} -->
                  {{ getNestedValue(row, column.key) }}
                </div>
              </template>
            </td>
            <td class="actions flex gap-2 border-0" v-if="showActions">
              <div v-for="action in actions">
                <button :class="{ 'disabled': isDisabled(`${action.rightName}`) }" @click.stop="handleAction(rowIndex,action.name,action.rightName, row)" :title="action.title"><i :class="action.icon"></i></button>
              </div>
            </td>
          </tr>
          <tr class="font-bold text-xs" v-if="showTotals && rows.length">
            <td v-for="(column, colIndex) in columns" :key="colIndex" :class="[{'ellipsis': column.maxWidth}, { 'max-width': column.maxWidth }, { 'min-width': column.minWidth }]">
                <template v-if="column.type === 'number'">
                    {{ Number(calculateColumnTotal(column.key)).toLocaleString() }}
                </template>
            </td>
            <td class="actions" v-if="showActions">
              
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted, computed} from 'vue';
  import axios from "axios";
  import { useStore } from "vuex";
  
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
    },
    emits : ['row-db-click', 'action-click','selection-changed', 'update-receipt-amount'],
    setup(props, { emit }) {
  
      const tableRef = ref(null);
      const selectedIds = ref([]);
      const store = useStore(); 
      const allowedRights = ref([]);
      const companyID = computed(()=> store.state.userData.company_id);
      const userID = computed(()=> store.state.userData.user_id);
  
      // Initialize selected state for each row
      props.rows.forEach(row => {
        row.selected = false;
      });
  
      const handleRowClick = (row) => {
        emit('row-db-click', row);
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
  
        console.log("THE SELECTED IDs ARE ",selectedIds.value);
        emit('selection-changed', selectedIds.value);
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
        emit('selection-changed', selectedIds.value);
      };
      const allSelected = computed(() => {
        return selectedIds.value.length === props.rows.length;
      });
  
      const getNestedValue = (row, key) => {
        return key.split('.').reduce((obj, keyPart) => obj && obj[keyPart], row);
      };
      //JOURNALS
      const journalLineCheck = (row) =>{
        let debitAmount = parseFloat(row.debit_amount) || 0;
        let creditAmount = parseFloat(row.credit_amount) || 0;
        if(debitAmount > 0){
          row.credit_amount = 0;
        }else if(creditAmount > 0){
          row.debit_amount = 0;
        }
      }
      //DIRECT SALES
      const availableItemQuantityCheck = (row) =>{
        let stockType = row.stock_type || "";
        let availQuant = parseFloat(row.batch_count) || 0;
        let quantity = parseFloat(row.quantity) || 0;
        let taxAmount = parseFloat(row.vat_amount) || 0;
        let vat_inclusivity = row.vat_inclusivity || "Inclusive";
        if (stockType != "Non Stocked"){
          if(quantity > availQuant){
            row.quantity = 1;
            row.vat_rate = null;
            row.vat_amount = 0;
            row.discount = 0;
            row.total_amount = row.cost;
            row.item_sales_income = (parseFloat(row.selling_price) - parseFloat(row.purchase_price)) * row.quantity;
          }else if(quantity <= 0){
            row.quantity = 1;
            row.vat_rate = null;
            row.vat_amount = 0;
            row.discount = 0;
            row.total_amount = row.cost;
            row.item_sales_income = (parseFloat(row.selling_price) - parseFloat(row.purchase_price)) * row.quantity;
          }else{
            if(taxAmount > 0 && vat_inclusivity == "Inclusive"){
              row.total_amount = row.cost * row.quantity;
            }else if(taxAmount > 0 && vat_inclusivity == "Exclusive"){
              row.total_amount = parseFloat(row.cost * row.quantity) + parseFloat(row.vat_amount);
            }else{
              row.total_amount = row.cost * row.quantity;
            }     
          }
        }
      }
      //DIRECT SALES
      const saleDiscount = (row) =>{
        let totalAmount = parseFloat(row.total_amount) || 0;
        let quantity = parseFloat(row.quantity) || 0;
        let subTotal = parseFloat(row.sub_total) || 0;
        let discount = parseFloat(row.discount) || 0;
        totalAmount = totalAmount - discount;
        subTotal = subTotal - discount;
        row.total_amount = totalAmount;
        row.sub_total = subTotal;
        row.item_sales_income = ((parseFloat(row.selling_price) - parseFloat(row.purchase_price)) * quantity) - discount;
      };
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
        const taxIncl = row.vat_inclusivity || "Inclusive";
        let totalAmount = parseFloat(row.total_amount) || 0;
        let taxAmount = parseFloat(row.vat_amount) || 0;
        let salesIncome = ((parseFloat(row.selling_price) - parseFloat(row.cost)) * parseFloat(row.quantity)) || 0;
        if(taxIncl == "Inclusive"){
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
      };
  
      const handleChange = (event, row) =>{
        const selectedValue = event.target.value;
        calculateTaxAmount(row);
        if (row.method && typeof row.method === 'function') {
          row.method(selectedValue); 
        } else {
          console.warn('Row method is not defined or is not a function');
        }
      }
  
      const handleInputChange = (event, row) =>{
        calculateTaxAmount(row);
        receiptAllocation(row);
        journalLineCheck(row);
        availableItemQuantityCheck(row);
        saleDiscount(row);
      }

      //RECEIPTING
      const receiptAllocation = (row) =>{
        const invAmount = parseFloat(row.due_amount) || 0;
        const paymentAllocation = parseFloat(row.payment_allocation) || 0;
        const balance = (invAmount - paymentAllocation).toFixed(2);
        if(balance >= 0){
          row.bal_after_alloc = balance;
        }else{
          row.payment_allocation = 0;
          row.bal_after_alloc = 0;
        }
        emit('update-receipt-amount', paymentAllocation)
      };
  
      const fetchEnabledRights = () =>{
          allowedRights.value = [];
          let formData = {
            user: userID.value,
            module: props.rightsModule
          }
          axios
          .post("api/v1/user-permissions-search/",formData)
          .then((response)=>{
            allowedRights.value = response.data.results;
          })
          .catch((error)=>{
            console.log(error.message);
          })
        };
        const isDisabled =(permissionName) =>{
            const permission = allowedRights.value.find(p => p.permission_name === permissionName);
            return permission ? !permission.right_status : true;
        };
  
      onMounted(() => {
        // Optional: Adjust column widths programmatically if needed
        const table = tableRef.value;
        if (table) {
          const ths = table.querySelectorAll('thead th');
          const tds = table.querySelectorAll('tbody td');
          // Logic to ensure column widths are consistent
        }
        fetchEnabledRights();
      });
  
      return {
        handleRowClick, handleAction, handleChange, getNestedValue, handleInputChange,
        tableRef, toggleSelectAll, selectedIds, allSelected, updateSelectedIds, calculateColumnTotal,isDisabled
      };
    }
  });
  </script>
  
  <style scoped>
  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  input {
    width: 100%;
    box-sizing: border-box;
  }
  .table-container {
    position: relative;
    max-height: 59vh;
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
    padding: 6px;
    text-align: left;
  }
  
  .dynamic-table td {
    border: 1px solid #ccc;
    padding: 3px;
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
  .ellipsis {
    max-width: 350px; /* Adjust the max-width as needed */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  </style>
    