<template>
  <div class="grid-container">
    <!--    <h1 class="">DocumentPlace Example {{nbObjects}}</h1>-->
    <div class="search-result-container">

      <!-- DocumentPlace Components in a Responsive Grid -->

      <div v-for="item in listOfObjects" :key="item.item_id" class="items"
           @click="handleGetOriginalFile(item.file_ref)">


        <document-place
            :binary-file="allFiles[item.item_id]"
            :properties="item.properties"
            class="document-place"
        />

      </div>
    </div>

    <!-- Image viewer -->
    <div v-if="originalFileUrl" class="image-viewer">
      <document-viewer :document-url="originalFileUrl"/>
    </div>
  </div>
</template>

<script lang="ts" setup>

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
import DocumentPlace from './DocumentPlace.vue'
import {decodeCBOR} from "~/libs/helpers";

interface SearchResult {
  items: DocumentData[]
}

interface DocumentData {
  item_id: string
  file_ref?: string | undefined
  properties: { key: string; value: string }[]
}

const originalFileUrl = ref<string | undefined>(undefined)

/** Search result aspect */


const dokaObjects = ref<SearchResult | undefined>(undefined)

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

const listOfObjects = computed<DocumentData[]>(() => dokaObjects.value?.items || [])
const nbObjects = computed<number>(() => listOfObjects.value.length)

/** Image aspect */

const pendingFile = computed<Promise<File>>(async () => {
  const imageName = "loading-line.gif"
  const snowmanPath = new URL('/' + imageName, import.meta.url).href
  const response = await fetch(snowmanPath) // Fetch the image as a blob
  if (!response.ok) {
    throw new Error(`Failed to fetch waiting.gif: ${response.statusText}`)
  }
  const blob = await response.blob() // Convert the response to a blob
  return new File([blob], imageName, {type: blob.type}) // Create and return a File object
})

// Blob URLs for image files

const allFiles = ref<Record<string, File | undefined>>({})

const fetchImagesAsFile = async (file_ref: string | undefined): Promise<File | undefined> => {
  if (!file_ref) return undefined

  const response = await fetch('http://127.0.0.1:3000/harbor/cbor/get_file/' + file_ref)
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }
  // const jsonObject = await response.json()
  const cborBinary = await response.arrayBuffer()
  const jsonObject = await decodeCBOR(cborBinary) // TODO create a type for the resulting Json return !!!

  return new File([jsonObject.file_data], 'file.jpg', {type: 'image/jpeg'})
}

const fetchOriginalAsFile = async (file_ref: string | undefined): Promise<File | undefined> => {
  if (!file_ref) return undefined

  const response = await fetch('http://127.0.0.1:3000/harbor/cbor/view_file/' + file_ref)
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }
  // const jsonObject = await response.json()
  const cborBinary = await response.arrayBuffer()
  const jsonObject = await decodeCBOR(cborBinary) // TODO create a type for the resulting Json return !!!
  return new File([jsonObject.file_data], 'file.jpg', {type: 'image/jpeg'})
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
  const pendingImage: File = await pendingFile.value

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
      console.log('Element changed:', {newVal, oldVal})
      if (newVal.length > 0) {
        // wait for 1 seconde before fetching the images
        //await new Promise(resolve => setTimeout(resolve, 1000))
        await fetchImages()
      }
    },
    {immediate: false, deep: true},
)

</script>


<style lang="scss" scoped>


.grid-container {
  border: 1px solid red;
  display: flex;
  flex-direction: row; /* Ensures horizontal alignment */
  width: 100%;
  height: 100%;
  // grid-template-columns: repeat(1, 1fr);
  // gap: 1.5rem;
  margin-top: 1.5rem;
  // justify-items: center;

  //@media (min-width: 640px) {
  //  grid-template-columns: repeat(2, 1fr);
  //}
  //
  //@media (min-width: 1024px) {
  //  grid-template-columns: repeat(4, 1fr);
  //}
}

.search-result-container {
  border: 1px solid blue;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  // grid-template-columns: 1fr;
  // gap: 1.5rem;
  //padding: 1.5rem;
  //justify-items: center;
  flex-grow: 1;
  width: 70%;
  height: 100%;
  //@media (min-width: 640px) { // sm:grid-cols-2
  //  grid-template-columns: repeat(2, 1fr);
  //}
  //
  //@media (min-width: 1024px) { // lg:grid-cols-3
  //  grid-template-columns: repeat(3, 1fr);
  //}
  //
  //@media (min-width: 1280px) { // xl:grid-cols-4
  //  grid-template-columns: repeat(4, 1fr);
  //}
}

.items {
  border: 1px solid yellow;
  padding: 0.8rem;
  // width: 10%;
  // flex-grow: 1;
  //cursor: pointer;
  //display: flex;
  //justify-content: center;
}

.document-place {
  width: 100%;
  max-width: 300px; // Ensures objects don't stretch too much on large screens
}

.image-viewer {
  // display: none;
  border: 1px solid black;
  // flex-grow: 1;
  width: 30%;
  padding: 5rem 0.8rem 0.8rem 0.8rem;
  height: 100%;
  // width: 33.3333%;
}
</style>