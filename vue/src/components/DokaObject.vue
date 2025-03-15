<template>
  <div class="flex items-start space-x-6 p-6 bg-green-100 rounded-lg shadow-md">
    <!-- Properties List -->
    <div class="flex-1 bg-blue-100 p-4 rounded-lg shadow">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Properties</h2>
      <ul class="space-y-2">
        <li v-for="(property, index) in props.properties" :key="index" class="text-gray-600">
          <span class="font-semibold">{{ property.key }}:</span> {{ property.value }}
        </li>
      </ul>
    </div>

    <!-- Image Preview -->
    <div
        v-if="props.binaryFile"
        class="flex-1 flex items-center justify-center bg-yellow-100 p-4 rounded-lg shadow w-96 h-96 "
    >
      <img :src="imageUrl" alt="Uploaded" class="h-full w-full object-contain rounded" />
    </div>
    <div v-else class="flex-1 flex items-center justify-center bg-yellow-100 p-4 rounded-lg shadow h-64 w-64">
      <p class="text-gray-500">No image available</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'

interface Property {
  key: string;
  value: string;
}

interface Props {
  properties: Property[]
  binaryFile?: File
}

const props = defineProps<Props>()

const imageUrl = ref<string | undefined>(undefined)


// Convert binary file to a data URL
const loadImage = (file: File) => {
  const reader = new FileReader();
  reader.onload = () => {
    imageUrl.value = reader.result as string;
  }
  reader.readAsDataURL(file)
}

watch(() => props.binaryFile, (newFile) => {
  if (newFile) {
    loadImage(newFile)
  }
}, { immediate: true })
</script>

<style scoped>

</style>