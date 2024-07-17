<template>
    <table class="dynamic-table rounded">
        <thead class="bg-gray-800 text-white">
            <tr class="rounded bg-slate-800 text-white font-semibold text-sm uppercase">
                <th v-for="(column, index) in columns" :key="index">
                    {{ column.label }}
                </th>
            </tr>
        </thead>
        <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex" @click="handleRowClick(row)" class="even:bg-gray-100 text-xs uppercase">
          <td v-for="(column, colIndex) in columns" :key="colIndex">
            {{ row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </template>
  
  <script>
  import { defineComponent, ref } from 'vue';
  
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
      }
    },
    emits: ['row-click'],
    setup(props, { emit }) {
      // No reactive state needed in this example
  
      // Method to handle row click
      const handleRowClick = (row) => {
        emit('row-click', row);
      };
  
      return {
        handleRowClick
      };
    }
  });
  </script>
  
  <style scoped>
  /* Add your table styling here */
  .dynamic-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .dynamic-table th, .dynamic-table td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }
  </style>
  