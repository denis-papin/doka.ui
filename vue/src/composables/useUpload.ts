import { ref } from 'vue'

const myFile = ref<File | null>(null)

export function useUpload() {
    return {
        myFile: myFile,
        setFile: (f: File) => { myFile.value = f }
    }
}