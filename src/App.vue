<template>
    <section>
        <div><live2d/></div>
        <div class="dom">指定DOM</div>
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
    margin-left: 200px;
    margin-top: 100px;
}

</style>