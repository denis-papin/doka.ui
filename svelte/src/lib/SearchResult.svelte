
<script lang="ts">
    import { onMount } from 'svelte';
    import DokaObject from './DokaObject.svelte';

    // Interfaces
    interface SearchResult {
        items: DokaObjectItem[];
    }

    interface DokaObjectItem {
        item_id: string;
        file_ref?: string;
        properties: { key: string; value: string }[];
    }

    // Local state variables
    let originalFileUrl: string | undefined = undefined;
    let dokaObjects: SearchResult | undefined = undefined;
    let allFiles: Record<string, File | undefined> = {};

    let _listOfObjects : DokaObjectItem[] = dokaObjects?.items || []

    // Reactive declarations for computed properties
    $: listOfObjects/*: DokaObjectItem[]*/ = dokaObjects?.items || [];
    $: nbObjects/*: number*/ = listOfObjects.length;

    // CBOR decoding function – assumes window.decode is available
    async function decodeCBOR(data: ArrayBuffer): Promise<any> {
        try {
            return await window.decode(new Uint8Array(data));
        } catch (err) {
            console.error('Failed to decode CBOR:', err);
            throw err;
        }
    }

    // Fetch the list of objects from the API and decode them
    async function fetchObjects() {
        const response = await fetch('http://127.0.0.1:3000/harbor/cbor/search_result');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const cborBinary = await response.arrayBuffer();
        dokaObjects = await decodeCBOR(cborBinary);
        console.log('>>> list of objects', dokaObjects);
    }

    // onMount lifecycle hook to fetch data when the component mounts
    onMount(() => {
        fetchObjects();
    });

    // Fetch a placeholder pending file (loading-line.gif)
    async function getPendingFile(): Promise<File> {
        const imageName = "loading-line.gif";
        const snowmanPath = new URL('/' + imageName, import.meta.url).href;
        const response = await fetch(snowmanPath);
        if (!response.ok) {
            throw new Error(`Failed to fetch waiting.gif: ${response.statusText}`);
        }
        const blob = await response.blob();
        return new File([blob], imageName, { type: blob.type });
    }

    // Fetch an image file from a file reference
    async function fetchImagesAsFile(file_ref: string | undefined): Promise<File | undefined> {
        if (!file_ref) return undefined;

        const response = await fetch('http://127.0.0.1:3000/harbor/cbor/get_file/' + file_ref);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const cborBinary = await response.arrayBuffer();
        const jsonObject = await decodeCBOR(cborBinary);
        return new File([jsonObject.file_data], 'file.jpg', { type: 'image/jpeg' });
    }

    // Fetch the original file to be displayed
    async function fetchOriginalAsFile(file_ref: string | undefined): Promise<File | undefined> {
        if (!file_ref) return undefined;

        const response = await fetch('http://127.0.0.1:3000/harbor/cbor/view_file/' + file_ref);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const cborBinary = await response.arrayBuffer();
        const jsonObject = await decodeCBOR(cborBinary);
        return new File([jsonObject.file_data], 'file.jpg', { type: 'image/jpeg' });
    }

    // Handler for when a user clicks on an item to view the original file
    async function handleGetOriginalFile(file_ref: string | undefined) {
        const file = await fetchOriginalAsFile(file_ref);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                originalFileUrl = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    // Fetch images for all objects – first setting a pending image then replacing them with actual images
    async function fetchImages() {
        const pendingImage: File = await getPendingFile();

        // Set pending image for each item initially
        for (const item of listOfObjects) {
            allFiles[item.item_id] = pendingImage;
        }

        // Replace with the actual image if available
        for (const item of listOfObjects) {
            const img = await fetchImagesAsFile(item.file_ref);
            allFiles[item.item_id] = img || undefined;
        }
    }

    // Reactive statement: when listOfObjects becomes non-empty, fetch the images.
    $: if (listOfObjects.length > 0) {
        fetchImages();
    }
</script>


<div class="p-6">
    <h1 class="text-2xl font-bold text-gray-700 mb-6 text-center">
        DokaObject Example {nbObjects}
    </h1>

    <!-- DokaObject Components in a Responsive Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 justify-items-center">
        {#each listOfObjects as item (item.item_id)}
            <div class="w-full flex-grow" on:click={() => handleGetOriginalFile(item.file_ref)}>
                <DokaObject
                        binaryFile={allFiles[item.item_id]}
                        properties={item.properties}
                        class="w-full flex-grow"
                />
            </div>
        {/each}
    </div>

    <!-- Image viewer -->
    {#if originalFileUrl}
        <div class="fixed inset-0 flex w-2/3 justify-center items-center">
            <img src={originalFileUrl} alt="originalFile" class="w-2/3 justify-center items-center rounded" />
        </div>
    {/if}
</div>


<style>
    /* These styles mirror the Vue scoped styles */
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