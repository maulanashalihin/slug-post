<script>
    import { router } from '@inertiajs/svelte';
    import { onMount } from 'svelte';
    import { Toast } from '../Components/helper.js';
    import Header from '../Components/Header.svelte';

    export let user;

    let form = {
        content: '',
        slug: '',
        format: 'markdown'
    };

    let isPublishing = false;
    let isCheckingSlug = false;
    let slugAvailable = true;
    let slugMessage = 'Only lowercase letters, numbers, and hyphens allowed';

    // Check slug availability
    async function checkSlug() {
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

    // Auto-generate slug from content title
    function handleContentInput() {
        if (!form.slug) {
            let title = '';
            if (form.format === 'markdown') {
                const titleMatch = form.content.match(/^#\s+(.+)$/m);
                if (titleMatch) title = titleMatch[1];
            } else {
                const titleMatch = form.content.match(/<h1[^>]*>(.*?)<\/h1>/i);
                if (titleMatch) title = titleMatch[1].replace(/<[^>]*>?/gm, '');
            }

            if (title) {
                form.slug = title.trim().toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                checkSlug();
            }
        }
    }

    // Handle file upload
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                form.content = e.target.result;
                
                // Auto-generate slug from filename
                const filename = file.name.replace(/\.(md|markdown|txt|html)$/i, '');
                if (!form.slug) {
                    form.slug = filename.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    checkSlug();
                }
            };
            reader.readAsText(file);
        }
    }

    // Publish post
    async function publishPost() {
        if (!form.content.trim()) {
            Toast('Please enter content', 'error');
            return;
        }

        if (!form.slug.trim()) {
            Toast('Please enter a URL slug', 'error');
            return;
        }

        if (!slugAvailable) {
            Toast('Please choose an available slug', 'error');
            return;
        }

        isPublishing = true;
        try {
            const response = await fetch('/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Toast('Post published successfully!', 'success');
                window.location.href = `/${data.slug}/edit/${data.edit_token}`;
            } else {
                Toast(data.error || 'Failed to publish post', 'error');
            }
        } catch (error) {
            Toast('Network error. Please try again.', 'error');
        } finally {
            isPublishing = false;
        }
    }

    // Get placeholder based on format
    $: placeholder = form.format === 'markdown' 
        ? `# My Awesome Post

Write your markdown content here...

- Support for **bold** and *italic*
- Code blocks with syntax highlighting
- Tables, lists, and more!`
        : `<h1>My Awesome Post</h1>

<p>Write your HTML content here...</p>

<ul>
  <li>Support for <strong>bold</strong> and <em>italic</em></li>
</ul>`;
</script>

<svelte:head>
    <title>Create Post - SlugPost</title>
</svelte:head>

<Header {user} />

<main class="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
    <!-- Page Header -->
    <div class="mb-6 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Create New Post</h1>
        <p class="text-slate-600 mt-1">Write or paste your content below</p>
    </div>

    <!-- Create Form -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 sm:p-8 space-y-6">
            
            <!-- Format Selection -->
            <div>
                <label for="format-markdown" class="block text-sm font-semibold text-slate-700 mb-3">Format</label>
                <div class="flex space-x-4">
                    <label class="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            id="format-markdown"
                            type="radio" 
                            bind:group={form.format} 
                            value="markdown" 
                            class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <div class="flex items-center space-x-2">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                Markdown
                            </span>
                        </div>
                    </label>
                    <label class="flex items-center space-x-3 cursor-pointer group">
                        <input 
                            type="radio" 
                            bind:group={form.format} 
                            value="html" 
                            class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <div class="flex items-center space-x-2">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                                    <polyline points="16 18 22 12 16 6"></polyline>
                                    <polyline points="8 6 2 12 8 18"></polyline>
                                </svg>
                                HTML
                            </span>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Content -->
            <div>
                <label for="content" class="block text-sm font-semibold text-slate-700 mb-2">
                    {form.format === 'markdown' ? 'Markdown' : 'HTML'} Content
                </label>
                <textarea
                    id="content"
                    bind:value={form.content}
                    on:input={handleContentInput}
                    rows="14"
                    {placeholder}
                    class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm resize-y transition-colors"
                ></textarea>
                <p class="text-xs text-slate-500 mt-2">
                    {#if form.format === 'markdown'}
                        Supports full markdown syntax including code blocks, tables, and images
                    {:else}
                        Paste your HTML code here. Need a landing page? Create with 
                        <a href="https://gemini.google.com/gem/1LI3U0Dv5b_2RCEl9dluN9SnAxn_64as2?usp=sharing" target="_blank" class="text-primary-600 hover:underline font-medium">Gemini AI</a>
                    {/if}
                </p>
            </div>

            <!-- Custom Slug -->
            <div>
                <label for="slug" class="block text-sm font-semibold text-slate-700 mb-2">
                    Custom URL Slug
                </label>
                <div class="flex items-center">
                    <span class="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-l-lg border border-r-0 border-slate-300 text-sm font-medium">
                        slugpost.com/
                    </span>
                    <div class="flex-1 relative">
                        <input
                            type="text"
                            id="slug"
                            bind:value={form.slug}
                            on:input={handleSlugInput}
                            placeholder="my-awesome-post"
                            class="w-full px-4 py-2.5 border border-slate-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm pr-10 transition-colors
                                {!slugAvailable && form.slug ? 'border-red-300 bg-red-50' : ''}"
                        />
                        {#if isCheckingSlug}
                            <div class="absolute right-3 top-1/2 -translate-y-1/2">
                                <svg class="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        {:else if form.slug}
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
                <p class="text-xs mt-2 {slugAvailable ? 'text-slate-500' : 'text-red-600'}">
                    {slugMessage}
                </p>
            </div>

            <!-- File Upload -->
            <div>
                <label for="file-upload" class="block text-sm font-semibold text-slate-700 mb-2">
                    Or Upload File
                </label>
                <label for="file-upload" class="relative cursor-pointer">
                    <div class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-slate-400 mb-2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" x2="12" y1="3" y2="15"></line>
                        </svg>
                        <span class="text-primary-600 font-semibold hover:text-primary-700">Click to upload</span>
                        <span class="text-slate-600"> or drag and drop</span>
                        <p class="text-xs text-slate-500 mt-1">MD, HTML, or TXT files</p>
                    </div>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".md,.markdown,.txt,.html"
                        on:change={handleFileUpload}
                        class="hidden"
                    />
                </label>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <div class="flex items-center space-x-2 text-sm text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-600">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Post will be saved to your account</span>
                </div>
                <button
                    on:click={publishPost}
                    disabled={isPublishing || !slugAvailable || !form.content || !form.slug}
                    class="w-full sm:w-auto bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {#if isPublishing}
                        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Publishing...</span>
                    {:else}
                        <span>Publish Post</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    {/if}
                </button>
            </div>
        </div>
    </div>
</main>
