<template>
  <div class="container">
    <!-- Properties List -->
    <div class="properties">
      <h2 class="properties-title">Properties</h2>
      <ul class="properties-list">
        <li v-for="(property, index) in props.properties" :key="index" class="property-item">
          <span class="property-key">{{ property.key }}:</span> {{ property.value }}
        </li>
      </ul>
    </div>

    <!-- Image Preview -->
    <div v-if="props.binaryFile" class="image-preview">
      <img :src="imageUrl" alt="Uploaded" class="image"/>
    </div>
    <div v-else class="no-image">
      <p class="no-image-text">No image available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'

interface Property {
  key: string
  value: string
}

interface Props {
  properties: Property[]
  binaryFile?: File
}

const props = defineProps<Props>()
const imageUrl = ref<string | undefined>(undefined)

const loadImage = (file: File) => {
  const reader = new FileReader()
  reader.onload = () => {
    imageUrl.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

watch(() => props.binaryFile, (newFile) => {
  if (newFile) {
    loadImage(newFile)
  }
}, {immediate: true})
</script>

<style scoped>
.container {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 24px;
  background-color: #d1fae5; /* green-100 equivalent */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.properties {
  flex: 1;
  background-color: #bfdbfe; /* blue-100 equivalent */
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.properties-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151; /* gray-700 */
  margin-bottom: 16px;
}

.properties-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.property-item {
  margin-bottom: 8px;
  color: #4b5563; /* gray-600 */
}

.property-key {
  font-weight: 600;
}

.image-preview,
.no-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fef3c7; /* yellow-100 */
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  width: 384px;
  height: 384px;
}

.image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.no-image-text {
  color: #6b7280; /* gray-500 */
}
</style>
