<script>
    import { router, inertia } from '@inertiajs/svelte';
    import { onMount } from 'svelte';
    import { Toast } from '../Components/helper.js';

    export let post;
    export let author;
    export let edit_token;
    export let user;

    let form = {
        slug: post.slug,
        title: post.title || '',
        description: post.description || '',
        thumbnail: post.thumbnail || ''
    };

    let originalSlug = post.slug;
    let isSaving = false;
    let isCheckingSlug = false;
    let slugAvailable = true;
    let slugMessage = '';
    let isUploadingThumbnail = false;
    let thumbnailPreview = post.thumbnail || '';

    // Check slug availability
    async function checkSlug() {
        if (form.slug === originalSlug) {
            slugAvailable = true;
            slugMessage = '';
            return;
        }

        if (!form.slug || form.slug.length < 2) {
            slugAvailable = false;
            slugMessage = 'Slug must be at least 2 characters';
            return;
        }

        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(form.slug)) {
            slugAvailable = false;
            slugMessage = 'Only lowercase letters, numbers, and hyphens allowed';
            return;
        }

        isCheckingSlug = true;
        try {
            const response = await fetch(`/api/check-slug/${form.slug}`);
            const data = await response.json();
            slugAvailable = data.available;
            slugMessage = data.message;
        } catch (error) {
            slugAvailable = false;
            slugMessage = 'Error checking slug';
        } finally {
            isCheckingSlug = false;
        }
    }

    // Debounce slug check
    let slugTimeout;
    function handleSlugInput() {
        form.slug = form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        clearTimeout(slugTimeout);
        slugTimeout = setTimeout(checkSlug, 500);
    }

    // Upload thumbnail
    async function uploadThumbnail(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Toast('Please select an image file', 'error');
            return;
        }

        isUploadingThumbnail = true;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload-thumbnail', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                form.thumbnail = data.url;
                thumbnailPreview = data.url;
                Toast('Thumbnail uploaded successfully', 'success');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            Toast('Failed to upload thumbnail', 'error');
        } finally {
            isUploadingThumbnail = false;
        }
    }

    // Remove thumbnail
    function removeThumbnail() {
        form.thumbnail = '';
        thumbnailPreview = '';
    }

    // Save settings
    async function saveSettings() {
        if (!slugAvailable && form.slug !== originalSlug) {
            Toast('Please choose an available slug', 'error');
            return;
        }

        isSaving = true;
        try {
            const response = await fetch(`/${originalSlug}/settings/${edit_token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                const data = await response.json();
                Toast('Settings saved successfully', 'success');
                
                // If slug changed, redirect to new URL
                if (form.slug !== originalSlug) {
                    window.location.href = `/${form.slug}/settings/${edit_token}`;
                }
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            Toast('Failed to save settings', 'error');
        } finally {
            isSaving = false;
        }
    }

    // Get editor URL based on format
    function getEditorUrl() {
        return `/${post.slug}/edit/${edit_token}`;
    }
</script>

<svelte:head>
    <title>Settings: {post.title} - SlugPost</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="container mx-auto px-4 sm:px-6">
            <div class="flex items-center justify-between h-14">
                <div class="flex items-center space-x-4">
                    <a href={getEditorUrl()} class="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                        <span class="font-medium">Back to Editor</span>
                    </a>
                </div>
                <div class="flex items-center space-x-3">
                    <a 
                        href="/{post.slug}" 
                        target="_blank"
                        class="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        <span>View Post</span>
                    </a>
                    <button
                        on:click={saveSettings}
                        disabled={isSaving || (!slugAvailable && form.slug !== originalSlug)}
                        class="flex items-center space-x-1.5 px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {#if isSaving}
                            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                <polyline points="17 21 17 13 7 13 7 21"/>
                                <polyline points="7 3 7 8 15 8"/>
                            </svg>
                        {/if}
                        <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-slate-900">Post Settings</h1>
            <p class="text-slate-600 mt-1">Manage your post's metadata and SEO settings</p>
        </div>

        <div class="space-y-6">
            <!-- Slug -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
                <label class="block text-sm font-semibold text-slate-900 mb-2">
                    URL Slug
                </label>
                <div class="flex items-center">
                    <span class="text-slate-500 text-sm mr-1">slugpost.com/</span>
                    <div class="flex-1 relative">
                        <input
                            type="text"
                            bind:value={form.slug}
                            on:input={handleSlugInput}
                            class="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors
                                {slugAvailable || form.slug === originalSlug ? 'border-slate-300' : 'border-red-300 bg-red-50'}"
                            placeholder="my-awesome-post"
                        />
                        {#if isCheckingSlug}
                            <div class="absolute right-3 top-1/2 -translate-y-1/2">
                                <svg class="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        {:else if form.slug !== originalSlug && slugMessage}
                            <div class="absolute right-3 top-1/2 -translate-y-1/2">
                                {#if slugAvailable}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                {:else}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="15" y1="9" x2="9" y2="15"/>
                                        <line x1="9" y1="9" x2="15" y2="15"/>
                                    </svg>
                                {/if}
                            </div>
                        {/if}
                    </div>
                </div>
                {#if slugMessage && form.slug !== originalSlug}
                    <p class="mt-2 text-sm {slugAvailable ? 'text-green-600' : 'text-red-600'}">
                        {slugMessage}
                    </p>
                {/if}
                <p class="mt-2 text-xs text-slate-500">
                    This is the URL where your post will be accessible. Only lowercase letters, numbers, and hyphens are allowed.
                </p>
            </div>

            <!-- Title -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
                <label class="block text-sm font-semibold text-slate-900 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    bind:value={form.title}
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Enter post title"
                />
                <p class="mt-2 text-xs text-slate-500">
                    The title displayed in search results and social media shares.
                </p>
            </div>

            <!-- Description -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
                <label class="block text-sm font-semibold text-slate-900 mb-2">
                    Description
                </label>
                <textarea
                    bind:value={form.description}
                    rows="3"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    placeholder="Brief description of your post for SEO and social sharing..."
                ></textarea>
                <div class="mt-2 flex items-center justify-between">
                    <p class="text-xs text-slate-500">
                        Recommended: 150-160 characters for optimal SEO.
                    </p>
                    <span class="text-xs {form.description.length > 160 ? 'text-orange-500' : 'text-slate-400'}">
                        {form.description.length}/160
                    </span>
                </div>
            </div>

            <!-- Thumbnail -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
                <label class="block text-sm font-semibold text-slate-900 mb-2">
                    Thumbnail Image
                </label>
                <p class="text-xs text-slate-500 mb-4">
                    This image will be displayed when your post is shared on social media.
                </p>

                {#if thumbnailPreview}
                    <div class="relative mb-4">
                        <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            class="w-full max-w-md rounded-lg border border-slate-200 object-cover aspect-video"
                        />
                        <button
                            on:click={removeThumbnail}
                            class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove thumbnail"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6 6 18"/>
                                <path d="m6 6 12 12"/>
                            </svg>
                        </button>
                    </div>
                {/if}

                <label class="relative cursor-pointer">
                    <div class="flex items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors {isUploadingThumbnail ? 'opacity-50 pointer-events-none' : ''}">
                        {#if isUploadingThumbnail}
                            <div class="flex flex-col items-center">
                                <svg class="animate-spin h-8 w-8 text-primary-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span class="text-sm text-slate-600">Uploading...</span>
                            </div>
                        {:else}
                            <div class="flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 mb-2">
                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                    <circle cx="9" cy="9" r="2"/>
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                </svg>
                                <span class="text-sm text-slate-600">{thumbnailPreview ? 'Change thumbnail' : 'Upload thumbnail'}</span>
                                <span class="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</span>
                            </div>
                        {/if}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        on:change={uploadThumbnail}
                        class="hidden"
                        disabled={isUploadingThumbnail}
                    />
                </label>
            </div>

            <!-- Post Info (Read-only) -->
            <div class="bg-slate-100 rounded-xl border border-slate-200 p-6">
                <h3 class="text-sm font-semibold text-slate-900 mb-4">Post Information</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-slate-500">Format</span>
                        <p class="font-medium text-slate-900 capitalize">{post.format || 'markdown'}</p>
                    </div>
                    <div>
                        <span class="text-slate-500">Views</span>
                        <p class="font-medium text-slate-900">{post.view_count}</p>
                    </div>
                    <div>
                        <span class="text-slate-500">Created</span>
                        <p class="font-medium text-slate-900">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span class="text-slate-500">Last Updated</span>
                        <p class="font-medium text-slate-900">{new Date(post.updated_at).toLocaleDateString()}</p>
                    </div>
                    {#if author}
                    <div class="col-span-2">
                        <span class="text-slate-500">Author</span>
                        <p class="font-medium text-slate-900">{author.name}</p>
                    </div>
                    {/if}
                </div>
            </div>
        </div>
    </main>
</div>
