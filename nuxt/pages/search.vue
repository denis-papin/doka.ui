<script lang="ts" setup>

function add_one(n: number): number {
  return n + 1
}

const counter = ref(0)

const handleAddOne = () => counter.value = add_one(counter.value)


</script>

<template>
  <div>
    <div>This is my search page : {{ counter }}</div>
    <button @click="handleAddOne">Add One</button>
    <search-result/>
  </div>
</template>

<style scoped>

</style>