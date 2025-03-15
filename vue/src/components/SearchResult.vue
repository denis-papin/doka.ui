
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-700 mb-6 text-center">DokaObject Example {{nbObjects}}</h1>

    <!-- DokaObject Components in a Responsive Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 justify-items-center">
      <div v-for="item in listOfObjects"  :key="item.item_id" class="w-full flex-grow" @click="handleGetOriginalFile(item.file_ref)">
      <doka-object
          :binary-file="allFiles[item.item_id]"
          :properties="item.properties"
          class="w-full flex-grow"
      />
      </div>
    </div>

    <!-- Image viewer -->
    <div v-if="originalFileUrl" class="fixed inset-0 flex w-2/3  justify-center items-center">
      <img :src="originalFileUrl" alt="originalFile" class="w-2/3 justify-center items-center rounded" />
    </div>
  </div>
</template>


<script setup lang="ts">

/**
 * The SearchResult component is an POC for efficient use of harbor services
 * REF_TAG : DOKA_HARBOR
 *
 *  Note that the data we got from the harbor APIs, are in the format needed by the doka-object
 *
 * The code in this smart component only does
 *  | Fetch the data from the harbor API + CBOR to JS conversion
 *  | Place those data in the local model, for instance the SearchResult object
 *  | Compute some smart view on the model, no transformation
 *  | Handle the chain of API calls, for instance, search_result then get_file
 *  | Pass the sub models to the dumb components, ex doka-object
 */

import {computed, ref, watch} from 'vue'
import DokaObject from './DokaObject.vue' // Adjust the path to the component file

interface SearchResult {
  items: DokaObject[]
}

interface DokaObject {
  item_id: string
  file_ref?: string | undefined
  properties: { key: string; value: string }[]
}

const originalFileUrl = ref<string | undefined>(undefined)

/** Search result aspect */

async function decodeCBOR(data: ArrayBuffer) {
  try {
    // Decode using cborg
    return  await window.decode(new Uint8Array(data));
  } catch (err) {
    console.error('Failed to decode CBOR:', err);
    throw err;
  }
}

const dokaObjects = ref<SearchResult|undefined>(undefined)

const fetchObjects = async () => {
  const response = await fetch('http://127.0.0.1:3000/harbor/cbor/search_result')
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }
  const cborBinary = await response.arrayBuffer()
  dokaObjects.value = await decodeCBOR(cborBinary)
  console.log('>>> list of objects', dokaObjects.value)
}

fetchObjects()

const listOfObjects = computed<DokaObject[]>( () => dokaObjects.value?.items || [] )
const nbObjects = computed<number>( () => listOfObjects.value.length )

/** Image aspect */

const pendingFile = computed<Promise<File>>(async () => {
  const imageName = "loading-line.gif"
  const snowmanPath = new URL('/' + imageName, import.meta.url).href
  const response = await fetch(snowmanPath) // Fetch the image as a blob
  if (!response.ok) {
    throw new Error(`Failed to fetch waiting.gif: ${response.statusText}`)
  }
  const blob = await response.blob() // Convert the response to a blob
  return new File([blob], imageName, { type: blob.type }) // Create and return a File object
})

// Blob URLs for image files

const allFiles = ref<Record<string, File | undefined>>({})

const fetchImagesAsFile = async (file_ref: string | undefined) : Promise<File | undefined> => {
  if (!file_ref) return undefined

  const response = await fetch('http://127.0.0.1:3000/harbor/cbor/get_file/' + file_ref)
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }
  const cborBinary = await response.arrayBuffer()
  const jsonObject = await decodeCBOR(cborBinary) // TODO create a type for the resulting Json return !!!

  return new File([jsonObject.file_data], 'file.jpg', { type: 'image/jpeg' })
}

const fetchOriginalAsFile = async (file_ref: string | undefined) : Promise<File | undefined> => {
  if (!file_ref) return undefined

  const response = await fetch('http://127.0.0.1:3000/harbor/cbor/view_file/' + file_ref)
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }
  const cborBinary = await response.arrayBuffer()
  const jsonObject = await decodeCBOR(cborBinary) // TODO create a type for the resulting Json return !!!

  return new File([jsonObject.file_data], 'file.jpg', { type: 'image/jpeg' })
}

const handleGetOriginalFile = async (file_ref: string | undefined) => {
  const file = await fetchOriginalAsFile(file_ref)
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      originalFileUrl.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Fetch images asynchronously
const fetchImages = async () => {
  const pendingImage : File = await pendingFile.value

  for (const item of listOfObjects.value) {
    allFiles.value[item.item_id] = pendingImage
  }

  for (const item of listOfObjects.value) {
    const img = await fetchImagesAsFile(item.file_ref)
    if (img) {
      allFiles.value[item.item_id] = img
    } else {
      delete allFiles.value[item.item_id]
      allFiles.value[item.item_id] = undefined
    }
  }
}

// Start fetching as soon as the list of objects is present
watch(
    () => listOfObjects.value,
    async (newVal, oldVal) => {
      console.log('Element changed:', { newVal, oldVal })
      if (newVal.length > 0) {
        // wait for 1 seconde before fetching the images
        //await new Promise(resolve => setTimeout(resolve, 1000))
        await fetchImages()
      }
    },
    { immediate: false, deep: true },
)

</script>


<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
