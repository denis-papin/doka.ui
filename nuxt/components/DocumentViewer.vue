<template>
  <!-- Image viewer as a drawer with transition -->
  <transition name="slide">
    <div v-if="documentUrl" class="card">
      <img :src="documentUrl" alt="originalFile" class="image" />
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  documentUrl: string | undefined
}

defineProps<Props>()
</script>

<style scoped lang="scss">

/* Add any additional styling if needed */

$primary-color: #3498db;

.card {
  background: $primary-color;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: white;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

</style>