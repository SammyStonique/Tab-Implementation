<template>
  <div class="flex flex-wrap gap-x-2 w-full">
      <div v-for="(field, index) in fields" :key="index" :class="`filter items-end flex-1 basis-${flex_basis} max-w-[calc(${flex_basis_percentage}%-1.5rem)] p-1.5`">
        <div v-if="field.type === 'text'" class="text-left">
          <div v-if="field.required">
            <label for="">{{ field.label }} : <em>*</em></label><br />
          </div>
          <div v-else>
            <label for="">{{ field.label }}:</label><br />
          </div>
          <input v-model="field.value" @change="handleChange($event, field)" :disabled="field.disabled" :name="field.name" type="text" :class="`bg-slate-50 rounded pl-3 border border-gray-400 text-base w-full`" :placeholder="field.placeholder"/>
        </div>
        <div v-if="field.type === 'password'" class="text-left">
          <div v-if="field.required">
            <label for="">{{ field.label }} : <em>*</em></label><br />
          </div>
          <div v-else>
            <label for="">{{ field.label }}:</label><br />
          </div>
          <input v-model="field.value" :disabled="field.disabled" :name="field.name" type="password" :class="`bg-slate-50 rounded pl-3 border border-gray-400 text-base w-full`" :placeholder="field.placeholder"/>
        </div>
        <div v-if="field.type === 'number'" class="text-left">
          <div v-if="field.required">
            <label for="">{{ field.label }} : <em>*</em></label><br />
          </div>
          <div v-else>
            <label for="">{{ field.label }}:</label><br />
          </div>
          <input v-model="field.value" @change="handleChange($event, field)" :disabled="field.disabled" :name="field.name" type="number" pattern="[0-9]*" oninput="this.value = this.value.replace(/[^0-9]/g, '')" :class="`bg-slate-50 rounded pl-3 border border-gray-400 text-base w-full`" :placeholder="field.placeholder"/>
        </div>
        <div v-if="field.type === 'date'" class="mr-2 text-left">
          <div v-if="field.required">
            <label for="">{{ field.label }} : <em>*</em></label><br />
          </div>
          <div v-else>
            <label for="">{{ field.label }}:</label><br />
          </div>
          <input v-model="field.value" @change="handleChange($event, field)" :name="field.name" type="date" :disabled="field.disabled" :min="field.minDate" :max="field.maxDate" :class="`bg-slate-50 rounded pl-3 border border-gray-400 text-base w-full`" :placeholder="field.placeholder"/>
        </div>
        <div v-if="field.type === 'time'" class="mr-2 text-left">
          <div v-if="field.required">
            <label for="">{{ field.label }} : <em>*</em></label><br />
          </div>
          <div v-else>
            <label for="">{{ field.label }}:</label><br />
          </div>
          <input v-model="field.value" :name="field.name" type="time" :disabled="field.disabled" :class="`bg-slate-50 rounded pl-3 border border-gray-400 text-base w-full`" :placeholder="field.placeholder"/>
        </div>
        <div v-else-if="field.type === 'dropdown'" class="mr-2 text-left">
          <div v-if="field.required">
            <label for="">{{ field.label }} : <em>*</em></label><br />
          </div>
          <div v-else>
            <label for="">{{ field.label }}:</label><br />
          </div>
          <select @change="handleChange($event, field)" v-model="field.value" :name="field.name" :disabled="field.disabled" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
            <option value="" selected disabled>{{ field.placeholder }}</option>
            <option v-for="(option, index) in field.options" :key="index" :value="option.value">{{ option.text }}</option>
          </select>
        </div>
        <div v-else-if="field.type === 'search-dropdown'" class="mr-2 text-left" :disabled="field.disabled">
          <div v-if="field.required">
            <label for="">{{ field.label }} : <em>*</em></label><br />
          </div>
          <div v-else>
            <label for="">{{ field.label }}:</label><br />
          </div>
          <SearchableDropdown  
            :key="field.componentKey"        
            :options="field.selectOptions"
            :updateValue="field.updateValue"
            :dropdownWidth="field.dropdownWidth"
            :searchPlaceholder="field.searchPlaceholder"
            @option-selected="field.optionSelected"
            @clearSearch="field.clearSearch"
            @fetchData="field.fetchData"
          />
        </div>
        <div v-if="field.type === 'text-area'" class="text-left">
          <div v-if="field.required">
            <label for="">{{ field.label }} : <em>*</em></label><br />
          </div>
          <div v-else>
            <label for="">{{ field.label }}:</label><br />
          </div>
          <textarea v-model="field.value" :name="field.name" :disabled="field.disabled" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2" :rows="field.textarea_rows" :cols="field.textarea_cols"></textarea>
        </div>
      </div>
      <div class="flex-1 basis-full p-2">
        <slot name="additional-content"></slot>
      </div>
      <div class="flex-1 basis-full p-2">
        <slot name="additional-content1"></slot>
      </div>
  </div>
  <div class="flex-1 basis-full px-2" v-if="displayButtons">
    <button @click="handleSubmit" class="rounded bg-green-400 cursor-pointer text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-check-circle text-xs mr-1.5" aria-hidden="true"></i>{{saveButtonLabel}}</button>
    <button @click="handleReset" class="rounded bg-green-400 cursor-pointer text-sm mr-2  text-white px-2 py-1.5"><i class="fa fa-refresh text-xs mr-1.5" aria-hidden="true"></i>Reset</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { getCurrentInstance } from 'vue';
import SearchableDropdown from './SearchableDropdown.vue';

export default{
  props:{
      fields:{
          type: Array,
          required: true
      },
      flex_basis:{
        type: String,
        required: true
      },
      flex_basis_percentage:{
        type: String,
        required: true
      },
      displayButtons:{
        type: Boolean,
        required: true
      },
      saveButtonLabel: {
        type: String,
        default: 'Save'
      }
  },
  components:{
    SearchableDropdown
  },
  setup(props, {emit}){
    const {proxy} = getCurrentInstance();
    const handleSubmit = () =>{
      emit('handleSubmit');
    }
    const handleReset = () =>{
      for(let i=0; i < props.fields.length; i++){
        if(props.fields[i].type == 'search-dropdown'){
          props.fields[i].componentKey = 0; 
          props.fields[i].componentKey += 1;
        }
        props.fields[i].value = '';
      }
      emit('handleReset');
    }
    const handleChange = (event, field) =>{
      const selectedValue = event.target.value;
      if (field.method && typeof field.method === 'function') {
        field.method(selectedValue); 
      } else {
        console.warn('Field method is not defined or is not a function');
      }
    }

    return{
      handleSubmit, handleReset, handleChange, 
    }
  }

}
</script>

<style scoped>
.filter {
box-sizing: border-box;
}

.filter input,
.filter select {
width: 100%; /* Ensure inputs take up the full width of their container */
}

.flex-wrap {
flex-wrap: wrap;
}

.flex-grow {
flex-grow: 1;
}
em{
color: red;
}

</style>