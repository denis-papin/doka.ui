<script lang="ts">
    export let binaryFile: File | undefined;
    export let properties: { key: string; value: string }[] = [];

    let imageUrl: string | undefined = undefined;

    // Reactive statement to update the image URL when binaryFile changes
    $: if (binaryFile) {
        const reader = new FileReader();
        reader.onload = () => {
            imageUrl = reader.result as string;
        };
        reader.readAsDataURL(binaryFile);
    } else {
        imageUrl = undefined;
    }
</script>

<div class="doka-object border p-4 rounded shadow">
    {#if imageUrl}
        <img src={imageUrl} alt="Doka Object" class="w-full h-auto" />
    {:else}
        <div class="placeholder bg-gray-200 p-4 text-center">No image available</div>
    {/if}

    {#if properties.length > 0}
        <ul class="mt-2">
            {#each properties as prop}
                <li><strong>{prop.key}:</strong> {prop.value}</li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .doka-object {
        font-family: sans-serif;
        background-color: #fff;
    }
    .placeholder {
        font-size: 0.9rem;
        color: #666;
    }
</style>
