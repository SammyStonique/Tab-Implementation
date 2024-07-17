<template>
    <div class="flex mt-3">
        <div class="basis-1/2 flex text-left">
            <div class="border-2 border-gray-200">
                <button class=" px-2 py-1.5 border-r-2 border-gray-200 hover:bg-slate-800 hover:text-white" @click="firstPage"><i class="fa fa-angle-double-left" aria-hidden="true"></i></button>
                <div class="hidden">{{ showPreviousBtn }}</div>
                <button class=" px-2 py-1.5 border-r-2 border-gray-200 hover:bg-slate-800 hover:text-white" @click="loadPrev" v-if="showPreviousBtn">Previous</button>
                <button class=" px-2 py-1.5 border-r-2 border-gray-200 hover:bg-slate-800 hover:text-white">{{currentPage}}</button>
                <button class=" px-2 py-1.5 border-r-2 border-gray-200 hover:bg-slate-800 hover:text-white" @click="loadNext" v-if="showNextBtn">Next</button>
                <div class="hidden">{{ showNextBtn }}</div>
                <button class="px-2 py-1.5 hover:bg-slate-800 hover:text-white" @click="lastPage"><i class="fa fa-angle-double-right" aria-hidden="true"></i></button>
            </div>
        </div>
        <div class="basis-1/2 text-right">
            <p style="font-size: 12px">
                Showing {{ result }} records  of {{ count }} 
            </p>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
    props: {
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
        }
        return{
            loadPrev, loadNext, firstPage, lastPage
        }
    }
})
</script>

<style>
</style>