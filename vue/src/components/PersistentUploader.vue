<script setup lang="ts">

import {ref, watch} from 'vue'
import {
  fetchUploadWatchInfo,
  fileUpload,
  ListOfUploadWatchInfoHarbor
} from '../types/upload.ts'
import { useUpload } from '../composables/useUpload.ts'

console.log('PersistentUploader....')

const { myFile } = useUpload()


const listOfUploadInfoReply = ref<ListOfUploadWatchInfoHarbor>({ uploading_files: [] })

// Watch or react to file.value for upload logic
watch(myFile, (newFile: File) => {
  if (newFile) {
    (async () => {
      console.log('New file selected:', newFile.name)
      await Promise.all([
        fileUpload(newFile),
        fileUpload(newFile),
        fileUpload(newFile),
        fileUpload(newFile)
      ])
    })()
  }
})

let timerId: number | null = null

// Note: Here we face an issue that should be solved in the harbor API
//       The getLoadingStatus returns an empty list when the upload is done but also when the upload is not started yet.
//       The vue app is not in charge of managing this dilemma, it is the harbor API that should return a proper list of uploading file.
// Run a timer that will perform a getLoadingStatus every 1 seconds
async function createTimer() {
  if (timerId) {
    return // If a timer is already running, do not create a new one
  }
  timerId = setInterval(async () => {
    console.log('Creating the timer...')
    try {
      listOfUploadInfoReply.value = await fetchUploadWatchInfo()
      console.log('Upload status:', listOfUploadInfoReply.value)

      // if (!status.list_of_upload_info.length) {
      if (listOfUploadInfoReply.value.uploading_files.length === 0) {
        stopTimer()
      }

    } catch (error) {
      console.error('Error fetching upload status:', error)
    }
  }, 1000)
}

function stopTimer() {
  console.log('Stop the timer...')
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

</script>

<template>
  <div>file is uploading...</div>
  <button @click="createTimer">Create Timer</button>

  <div>
    <h3>Upload Info List</h3>
    <table v-if="listOfUploadInfoReply.uploading_files.length">
      <thead>
      <tr>
        <th>Item Info</th>
        <th>File Reference</th>
        <th>Progression</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(info, idx) in listOfUploadInfoReply.uploading_files" :key="idx">
        <td>{{ info.file_name }}</td>
        <td>{{ info.file_ref }}</td>
        <td>{{ info.percent_of_completion }} %</td>
      </tr>
      </tbody>
    </table>
    <div v-else>No upload info available.</div>
  </div>

</template>

<style scoped lang="scss">
div {
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 2rem;
  margin: 2rem auto;
  max-width: 700px;
  color: #f3f3f3;

  h3 {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: 1.5rem;
    color: #00e6d0;
    text-shadow: 0 2px 8px #222;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: rgba(30, 30, 40, 0.95);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.12);

    th, td {
      padding: 1rem 1.2rem;
      text-align: left;
    }

    th {
      background: #222c36;
      color: #00e6d0;
      font-size: 1.1rem;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #00e6d0;
    }

    tr {
      transition: background 0.2s;
      &:hover {
        background: rgba(0,230,208,0.08);
      }
    }

    td {
      font-size: 1rem;
      border-bottom: 1px solid #333a44;
      &:last-child {
        font-weight: 600;
        color: #00e6d0;
      }
    }
  }

  div[v-else] {
    margin-top: 2rem;
    color: #ffb347;
    font-size: 1.2rem;
    text-align: center;
    font-style: italic;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 4px #222;
  }
}
</style>