<template>
    <div class="dynamic-form">
      <form @submit.prevent="handleSubmit">
        <div v-for="(row, rowIndex) in formRows" :key="rowIndex" class="form-row" :style="{ gridTemplateColumns: getGridTemplateColumns(row) }">
          <div v-for="(field, fieldIndex) in row" :key="fieldIndex" class="form-field" :class="`col-span-${field.size || 1}`">
            <label :for="field.name" class="text-left">{{ field.label }}:</label>
            <input v-if="field.type === 'text'"
                :type="field.type" 
                :id="field.name" 
                v-model="formData[field.name]"
                class="rounded border border-gray-600 text-lg pl-2 focus:outline-none"
            />
            <input
              v-if="field.type === 'number'"
              :type="field.type"
              :id="field.name"
              v-model="formData[field.name]"
              class="rounded border border-gray-600 text-lg pl-2 focus:outline-none"
            />
            <select v-if="field.type === 'select'" :id="field.name" v-model="formData[field.name]" class="rounded border border-gray-600 bg-white text-lg pl-2 pt-2">
              <option v-for="option in field.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

          </div>
        </div>
        <button type="submit" class="rounded border bg-green-400 w-20 py-1.5 px-1.5 text-white text-lg">{{ submitButtonLabel }}</button>
      </form>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, watch } from 'vue';
  
  export default defineComponent({
    name: 'DynamicForm',
    props: {
      fields: {
        type: Array,
        required: true
      },
      submitButtonLabel: {
        type: String,
        default: 'Save'
      }
    },
    setup(props, { emit }) {
      const formData = ref({});
  
      const formRows = ref([]);
  
      // Initialize form data and rows
      props.fields.forEach((field) => {
        formData.value[field.name] = field.value || '';
      });

      // Watch for changes in props.fields and update formRows
      watch(() => props.fields, (newFields) => {
        formRows.value = newFields.reduce((acc, field) => {
          if (!acc[field.row]) {
            acc[field.row] = [];
          }
          acc[field.row].push(field);
          return acc;
        }, []);
      }, { immediate: true });
  
      const getGridTemplateColumns = (row = []) => {
        return row.map(field => `span ${field.size || 1}`).join(' ');
      };
  
      const handleSubmit = () => {
        emit('submit', formData.value);
      };
  
      return {
        formData,
        formRows,
        getGridTemplateColumns,
        handleSubmit
      };
    }
  });
  </script>
  
  <style scoped>
  .dynamic-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-row {
    display: grid;
    gap: 1rem;
  }
  
  .form-field {
    display: flex;
    flex-direction: column;
  }
  
  .form-field.col-span-1 {
    grid-column: span 1;
  }
  
  .form-field.col-span-2 {
    grid-column: span 2;
  }
  
  .form-field.col-span-3 {
    grid-column: span 3;
  }
  
  .form-field.col-span-4 {
    grid-column: span 4;
  }
  
  /* Add more column spans as needed */
  </style>
  