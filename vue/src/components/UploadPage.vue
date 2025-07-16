<script setup lang="ts">
import { useUpload } from '../composables/useUpload'

const { setFile } = useUpload()

const onFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setFile(target.files[0])
    createTimer()
  }
}
</script>

<template>
<div>upload page ...</div>
  <div>
    <h2>Upload Page</h2>
    <input type="file" @change="onFileChange" />
  </div>
</template>

<style scoped lang="scss">

</style>