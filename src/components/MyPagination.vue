<template>
    <div class="flex mt-1.5">
        <div class="basis-1/2 flex text-left">
            <div class="border-2 border-gray-200">
                <button class=" px-2  border-r-2 border-gray-200 hover:bg-slate-800 hover:text-white" @click="firstPage"><i class="fa fa-angle-double-left" aria-hidden="true"></i></button>
                <div class="hidden">{{ showPreviousBtn }}</div>
                <button class=" px-2  border-r-2 border-gray-200 hover:bg-slate-800 hover:text-white" @click="loadPrev" v-if="showPreviousBtn">Previous</button>
                <button class=" px-2  border-r-2 border-gray-200 hover:bg-slate-800 hover:text-white">{{currentPage}}</button>
                <button class=" px-2  border-r-2 border-gray-200 hover:bg-slate-800 hover:text-white" @click="loadNext" v-if="showNextBtn">Next</button>
                <div class="hidden">{{ showNextBtn }}</div>
                <button class="px-2  hover:bg-slate-800 hover:text-white" @click="lastPage"><i class="fa fa-angle-double-right" aria-hidden="true"></i></button>
            </div>
            <p class="ml-3" style="font-size: 12px">Page {{ currentPage }}</p>
        </div>
        <div class="basis-1/2 flex justify-end text-right">
            <select @change="selectSearchQuantity" v-model="localValue" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 w-16 mr-3">
                <option value="50" selected>50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
            </select>
            <p style="font-size: 12px">
                Showing {{ result }} records  of {{ count }} 
            </p>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
    props: {
        selectedValue: {
            type: Number,
            required: true,
            default: () => 50
        },
        currentPage: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            required: true
        },
        nextPage: {
            type: Number,
            required: true
        },
        prevPage: {
            type: Number,
            required: true
        },
        result: {
            type: Number,
            required: true
        },
        showPreviousBtn: {
            type: Boolean,
            required: true
        },
        showNextBtn: {
            type: Boolean,
            required: true
        },
    },
    setup(props, { emit }){
        const localValue = ref(props.selectedValue);
        const loadPrev = () =>{
            emit("loadPrev");
        }
        const loadNext = () =>{
            emit("loadNext");
        }
        const firstPage = () =>{
            emit("firstPage");
        }
        const lastPage = () =>{
            emit("lastPage");
        };
        const selectSearchQuantity = () =>{
            emit("selectSearchQuantity", localValue.value);
        };
        watch(() => props.selectedValue, (newValue) => {
            localValue.value = newValue;
        });
        return{
            loadPrev, loadNext, firstPage, lastPage, selectSearchQuantity,localValue
        }
    }
})
</script>

<style>
</style>