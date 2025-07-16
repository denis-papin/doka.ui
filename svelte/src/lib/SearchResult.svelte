
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


<div class="container">
    <h1 class="header">
        DokaObject Example {nbObjects}
    </h1>

    <!-- DokaObject Components in a Responsive Grid -->
    <div class="grid-container">
        {#each listOfObjects as item (item.item_id)}
            <div class="item-container" on:click={() => handleGetOriginalFile(item.file_ref)}>
                <DokaObject
                        binaryFile={allFiles[item.item_id]}
                        properties={item.properties}
                        class="object"
                />
            </div>
        {/each}
    </div>

    <!-- Image viewer -->
    {#if originalFileUrl}
        <div class="image-viewer">
            <img src={originalFileUrl} alt="originalFile" class="image" />
        </div>
    {/if}
</div>




<style>
    /* Container (equivalent to Tailwind's p-6) */
    .container {
        padding: 1.5rem;
    }

    /* Header styling: text-2xl, font-bold, text-gray-700, mb-6, text-center */
    .header {
        font-size: 1.5rem;       /* text-2xl */
        font-weight: bold;       /* font-bold */
        color: #374151;          /* text-gray-700 */
        margin-bottom: 1.5rem;   /* mb-6 */
        text-align: center;      /* text-center */
    }

    /* Grid container: grid, grid-cols-1, gap-6, mt-6, justify-items-center */
    .grid-container {
        display: grid;
        grid-template-columns: repeat(1, 1fr); /* grid-cols-1 */
        gap: 1.5rem;                           /* gap-6 */
        margin-top: 1.5rem;                    /* mt-6 */
        justify-items: center;                 /* justify-items-center */
    }

    /* Responsive adjustments */
    /* On small screens: 2 columns */
    @media (min-width: 640px) {
        .grid-container {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    /* On large screens: 4 columns */
    @media (min-width: 1024px) {
        .grid-container {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    /* Item container: w-full and flex-grow */
    .item-container {
        width: 100%;   /* w-full */
        flex-grow: 1;  /* flex-grow */
    }

    /* DokaObject component styling (if needed) */
    .object {
        width: 100%;   /* w-full */
        flex-grow: 1;  /* flex-grow */
    }

    /* Image viewer container: fixed, inset-0, flex, w-2/3, justify-center, items-center */
    .image-viewer {
        position: fixed; /* fixed */
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;         /* inset-0 */
        display: flex;   /* flex */
        width: 66.666667%; /* w-2/3 */
        justify-content: center; /* justify-center */
        align-items: center;     /* items-center */
    }

    /* Image styling: w-2/3, rounded */
    .image {
        width: 66.666667%;      /* w-2/3 */
        border-radius: 0.25rem; /* rounded */
    }


</style>