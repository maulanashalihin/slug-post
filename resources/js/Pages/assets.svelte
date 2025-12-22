<script>
    import { page } from '@inertiajs/svelte';
    import { fly, fade, scale } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import Header from '../Components/Header.svelte';

    let { assets: initialAssets } = $page.props;
    let assets = $state(initialAssets || []);
    let isUploading = $state(false);
    let dragOver = $state(false);
    let uploadProgress = $state(0);
    let copiedId = $state(null);
    let deletingId = $state(null);
    let confirmDeleteId = $state(null);

    async function handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        const file = files[0];
        if (!file.type.includes('image')) {
            alert('Only image files are allowed');
            return;
        }

        isUploading = true;
        uploadProgress = 0;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/assets/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const newAsset = await response.json();
                assets = [newAsset, ...assets];
                uploadProgress = 100;
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            isUploading = false;
            uploadProgress = 0;
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        dragOver = false;
        const files = event.dataTransfer.files;
        handleFileUpload(files);
    }

    function handleDragOver(event) {
        event.preventDefault();
        dragOver = true;
    }

    function handleDragLeave() {
        dragOver = false;
    }

    function handleFileInput(event) {
        const files = event.target.files;
        handleFileUpload(files);
    }

    async function copyToClipboard(url, id) {
        try {
            await navigator.clipboard.writeText(url);
            copiedId = id;
            setTimeout(() => {
                copiedId = null;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    async function deleteAsset(id) {
        if (deletingId) return;
        
        deletingId = id;
        try {
            const response = await fetch(`/api/assets/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                assets = assets.filter(a => a.id !== id);
            } else {
                alert('Failed to delete asset');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete asset');
        } finally {
            deletingId = null;
            confirmDeleteId = null;
        }
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
</script>

<svelte:head>
    <title>My Assets - SlugPost</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <Header />
    
    <main class="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        <!-- Page Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-900 mb-2">My Assets</h1>
            <p class="text-slate-600">Upload and manage your images</p>
        </div>

        <!-- Upload Area -->
        <div 
            class="relative mb-8 border-2 border-dashed rounded-2xl transition-all duration-300 {dragOver ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-slate-400 bg-white'}"
            ondrop={handleDrop}
            ondragover={handleDragOver}
            ondragleave={handleDragLeave}
            role="button"
            tabindex="0"
        >
            <label class="flex flex-col items-center justify-center py-12 cursor-pointer">
                <input 
                    type="file" 
                    accept="image/*" 
                    class="hidden" 
                    onchange={handleFileInput}
                    disabled={isUploading}
                />
                
                {#if isUploading}
                    <div class="flex flex-col items-center" transition:fade>
                        <div class="w-16 h-16 mb-4 relative">
                            <svg class="animate-spin w-16 h-16 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <p class="text-slate-600 font-medium">Uploading...</p>
                    </div>
                {:else}
                    <div class="flex flex-col items-center" transition:fade>
                        <div class="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-600">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" x2="12" y1="3" y2="15"></line>
                            </svg>
                        </div>
                        <p class="text-slate-700 font-semibold mb-1">Drop image here or click to upload</p>
                        <p class="text-slate-500 text-sm">Supports: JPG, PNG, GIF, WebP (Max 10MB)</p>
                    </div>
                {/if}
            </label>
        </div>

        <!-- Assets Grid -->
        {#if assets.length > 0}
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {#each assets as asset, index (asset.id)}
                    <div 
                        class="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200"
                        transition:fly={{ y: 20, duration: 300, delay: index * 50, easing: cubicOut }}
                    >
                        <!-- Image -->
                        <div class="aspect-square overflow-hidden bg-slate-100">
                            <img 
                                src={asset.url} 
                                alt={asset.name}
                                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
                        
                        <!-- Delete button (top right) -->
                        <button 
                            onclick={() => confirmDeleteId = asset.id}
                            class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
                            title="Delete"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                        </button>

                        <!-- Confirm delete overlay -->
                        {#if confirmDeleteId === asset.id}
                            <div class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-3 z-10" transition:fade={{ duration: 150 }}>
                                <p class="text-white text-sm font-medium mb-3 text-center">Hapus gambar ini?</p>
                                <div class="flex gap-2">
                                    <button 
                                        onclick={() => confirmDeleteId = null}
                                        class="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        onclick={() => deleteAsset(asset.id)}
                                        disabled={deletingId === asset.id}
                                        class="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                        {#if deletingId === asset.id}
                                            <span class="flex items-center gap-1">
                                                <svg class="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Menghapus...
                                            </span>
                                        {:else}
                                            Hapus
                                        {/if}
                                    </button>
                                </div>
                            </div>
                        {/if}

                        <!-- Overlay on hover -->
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none {confirmDeleteId === asset.id ? 'hidden' : ''}">
                            <div class="flex items-center justify-between pointer-events-auto">
                                <span class="text-white text-xs truncate max-w-[60%]">{formatFileSize(asset.size)}</span>
                                <button 
                                    onclick={() => copyToClipboard(asset.url, asset.id)}
                                    class="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-medium transition-colors"
                                >
                                    {#if copiedId === asset.id}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>Copied!</span>
                                    {:else}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                                        </svg>
                                        <span>Copy URL</span>
                                    {/if}
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <!-- Empty State -->
            <div class="text-center py-16" transition:fade>
                <div class="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                        <circle cx="9" cy="9" r="2"></circle>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-slate-700 mb-2">No assets yet</h3>
                <p class="text-slate-500 mb-6">Upload your first image to get started</p>
            </div>
        {/if}
    </main>
</div>

<style>
    :global(.primary-50) { background-color: rgb(239 246 255); }
    :global(.primary-100) { background-color: rgb(219 234 254); }
    :global(.primary-200) { background-color: rgb(191 219 254); }
    :global(.primary-500) { color: rgb(59 130 246); }
    :global(.primary-600) { color: rgb(37 99 235); }
    :global(.border-primary-500) { border-color: rgb(59 130 246); }
    :global(.bg-primary-50) { background-color: rgb(239 246 255); }
</style>
