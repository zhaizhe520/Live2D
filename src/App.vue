<template>
    <section>
        <div class="">
            <live2d/>
        </div>
    </section>
</template>

<script setup>
import Live2d from './components/live2d.vue';


</script>

<style scoped>
section{
    display: inline-flex;
}

.dom{
    height: 20px;
    margin-left: 200px;
    margin-top: 100px;
    background-color: pink;
    cursor: pointer;

}

</style>