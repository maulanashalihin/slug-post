<script>
    import { router } from '@inertiajs/svelte';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { Toast } from '../Components/helper.js';

    // Props from controller
    export let post;
    export let author;
    export let edit_token;
    export let user;

    // Form state
    let form = {
        content: post.content,
        slug: post.slug
    };

    // UI state
    let activeTab = 'edit'; // 'edit', 'preview', 'info'
    let previewHtml = '';
    let isSaving = false;
    let lastSaved = post.updated_at;
    let hasUnsavedChanges = false;
    let isUserMenuOpen = false;

    // Track changes
    $: if (form.content !== post.content) {
        hasUnsavedChanges = true;
    }

    // Format date
    function formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Generate preview
    function generatePreview() {
        activeTab = 'preview';
        // Simple markdown preview
        previewHtml = form.content
            .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-6 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-4">$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n\n/gim, '</p><p class="mb-4">')
            .replace(/\n/gim, '<br/>');
        previewHtml = '<p class="mb-4">' + previewHtml + '</p>';
    }

    // Submit form
    async function submitForm() {
        isSaving = true;
        try {
            const response = await fetch(`/${post.slug}/edit/${edit_token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                isSaving = false;
                hasUnsavedChanges = false;
                lastSaved = new Date().toISOString();
                Toast('Changes saved successfully!', 'success');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            isSaving = false;
            Toast('Failed to save changes. Please try again.', 'error');
        }
    }

    // Cancel and go back
    function cancel() {
        if (hasUnsavedChanges) {
            if (confirm('Are you sure? Any unsaved changes will be lost.')) {
                router.visit(`/${post.slug}`);
            }
        } else {
            router.visit(`/${post.slug}`);
        }
    }

    // Claim post
    function claimPost() {
        router.visit(`/claim/${post.slug}?token=${edit_token}`);
    }

    // Keyboard shortcuts
    function handleKeydown(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            submitForm();
        }
        // Ctrl/Cmd + P to preview
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            generatePreview();
        }
    }

    // Handle logout
    function handleLogout() {
        router.post('/logout');
    }

    // Click outside handler for dropdown
    function handleClickOutside(event) {
        if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
            isUserMenuOpen = false;
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<svelte:head>
    <title>Edit: {post.title} - SlugPost</title>
</svelte:head>

<!-- Navigation -->
<nav class="bg-white border-b border-slate-200">
    <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-600">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M10 9H8"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                </svg>
                <span class="text-xl font-bold text-slate-900">SlugPost</span>
            </a>
            <div class="flex items-center space-x-4">
                <a 
                    href="/{post.slug}"
                    class="text-slate-600 hover:text-slate-900 transition-colors font-medium flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span class="hidden sm:inline">View Post</span>
                </a>

                {#if user}
                <!-- User Dropdown -->
                <div class="relative user-menu-container">
                    <button 
                        class="flex items-center space-x-2 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
                        on:click={() => isUserMenuOpen = !isUserMenuOpen}
                    >
                        <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span class="text-primary-700 font-medium text-sm">{user.name[0].toUpperCase()}</span>
                        </div>
                        <span class="font-medium text-slate-900 hidden sm:inline">{user.name}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-slate-600">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>

                    {#if isUserMenuOpen}
                    <div 
                        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50"
                        transition:fly={{ y: -10, duration: 200 }}
                    >
                        <a 
                            href="/profile" 
                            class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <div class="flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span>Edit Profile</span>
                            </div>
                        </a>
                        <a 
                            href="/home" 
                            class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <div class="flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                                </svg>
                                <span>My Posts</span>
                            </div>
                        </a>
                        <hr class="my-2 border-slate-200">
                        <button 
                            on:click={handleLogout}
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <div class="flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" x2="9" y1="12" y2="12"></line>
                                </svg>
                                <span>Logout</span>
                            </div>
                        </button>
                    </div>
                    {/if}
                </div>
                {:else}
                <!-- Login/Register Buttons -->
                <div class="flex items-center space-x-2">
                    <a 
                        href="/login" 
                        class="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                    >
                        Login
                    </a>
                    <a 
                        href="/register" 
                        class="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Register
                    </a>
                </div>
                {/if}
            </div>
        </div>
    </div>
</nav>

<!-- Main Content -->
<main class="container mx-auto px-6 py-6 max-w-7xl">
    
    <!-- Top Bar -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center space-x-4">
                <div>
                    <h1 class="text-xl font-bold text-slate-900">{post.title}</h1>
                    <div class="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                        <span>/{post.slug}</span>
                        <span>•</span>
                        <span>{post.view_count} views</span>
                        {#if hasUnsavedChanges}
                        <span class="flex items-center space-x-1 text-orange-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" x2="12" y1="8" y2="12"></line>
                                <line x1="12" x2="12.01" y1="16" y2="16"></line>
                            </svg>
                            <span>Unsaved changes</span>
                        </span>
                        {/if}
                    </div>
                </div>
            </div>
            
            <div class="flex items-center space-x-3">
                {#if !author}
                <button 
                    on:click={claimPost}
                    class="bg-white border-2 border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all font-medium flex items-center space-x-2 text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <line x1="19" x2="19" y1="8" y2="14"></line>
                        <line x1="22" x2="16" y1="11" y2="11"></line>
                    </svg>
                    <span>Claim</span>
                </button>
                {/if}
                
                <button 
                    on:click={cancel}
                    class="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm"
                >
                    Cancel
                </button>
                
                <button 
                    on:click={submitForm}
                    disabled={isSaving || !hasUnsavedChanges}
                    class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-all font-medium flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if isSaving}
                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                    {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    <span>Save</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>

    {#if !author}
    <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <div class="flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-600 flex-shrink-0 mt-0.5">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
            </svg>
            <div>
                <h3 class="font-semibold text-orange-900 mb-1">Anonymous Post</h3>
                <p class="text-sm text-orange-800">This post is not claimed. Register or login to claim ownership and manage it from your dashboard.</p>
            </div>
        </div>
    </div>
    {/if}

    <!-- Tab Navigation -->
    <div class="bg-white rounded-t-xl shadow-sm border-x border-t border-slate-200">
        <div class="flex items-center justify-between px-6 py-3 border-b border-slate-200">
            <div class="flex items-center space-x-1">
                <button 
                    on:click={() => activeTab = 'edit'}
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {activeTab === 'edit' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'}"
                >
                    <span class="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            <path d="m15 5 4 4"></path>
                        </svg>
                        <span>Edit</span>
                    </span>
                </button>
                <button 
                    on:click={generatePreview}
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {activeTab === 'preview' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'}"
                >
                    <span class="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>Preview</span>
                    </span>
                </button>
                <button 
                    on:click={() => activeTab = 'info'}
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {activeTab === 'info' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'}"
                >
                    <span class="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                        </svg>
                        <span>Info</span>
                    </span>
                </button>
            </div>
            
            <div class="flex items-center space-x-2 text-xs text-slate-500">
                <kbd class="px-2 py-1 bg-slate-100 rounded border border-slate-300">⌘S</kbd>
                <span>to save</span>
                <span>•</span>
                <kbd class="px-2 py-1 bg-slate-100 rounded border border-slate-300">⌘P</kbd>
                <span>to preview</span>
            </div>
        </div>
    </div>

    <!-- Tab Content -->
    <div class="bg-white rounded-b-xl shadow-sm border-x border-b border-slate-200 overflow-hidden">
        
        {#if activeTab === 'edit'}
        <!-- Editor Tab -->
        <div class="p-6">
            <textarea 
                bind:value={form.content}
                rows="24"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm resize-none"
                placeholder="# Your Title

Write your markdown content here...

## Features
- Easy to use
- Beautiful rendering
- Syntax highlighting"
            ></textarea>
            
            <div class="mt-4 flex items-center justify-between text-sm text-slate-600">
                <div class="flex items-center space-x-4">
                    <span>{form.content.length} characters</span>
                    <span>•</span>
                    <span>{form.content.split('\n').length} lines</span>
                </div>
                <div class="text-xs text-slate-500">
                    Last saved: {formatDate(lastSaved)}
                </div>
            </div>
        </div>
        {/if}

        {#if activeTab === 'preview'}
        <!-- Preview Tab -->
        <div class="p-8">
            <div class="prose prose-slate max-w-none">
                {@html previewHtml}
            </div>
        </div>
        {/if}

        {#if activeTab === 'info'}
        <!-- Info Tab -->
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- Post Details -->
                <div class="bg-slate-50 rounded-lg p-6">
                    <h3 class="font-bold text-slate-900 mb-4 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                        </svg>
                        <span>Post Details</span>
                    </h3>
                    <div class="space-y-3 text-sm">
                        <div>
                            <div class="text-slate-600 mb-1">Slug</div>
                            <div class="font-mono text-slate-900 bg-white px-3 py-2 rounded border border-slate-200">/{post.slug}</div>
                        </div>
                        <div>
                            <div class="text-slate-600 mb-1">Title</div>
                            <div class="text-slate-900 bg-white px-3 py-2 rounded border border-slate-200">{post.title}</div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <div class="text-slate-600 mb-1">Views</div>
                                <div class="font-semibold text-slate-900 bg-white px-3 py-2 rounded border border-slate-200">{post.view_count}</div>
                            </div>
                            <div>
                                <div class="text-slate-600 mb-1">Status</div>
                                <div class="text-slate-900 bg-white px-3 py-2 rounded border border-slate-200">
                                    {#if author}
                                    <span class="text-green-600">Claimed</span>
                                    {:else}
                                    <span class="text-orange-600">Anonymous</span>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Timestamps & Author -->
                <div class="bg-slate-50 rounded-lg p-6">
                    <h3 class="font-bold text-slate-900 mb-4 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>Timeline</span>
                    </h3>
                    <div class="space-y-3 text-sm">
                        <div>
                            <div class="text-slate-600 mb-1">Created</div>
                            <div class="text-slate-900 bg-white px-3 py-2 rounded border border-slate-200">{formatDate(post.created_at)}</div>
                        </div>
                        <div>
                            <div class="text-slate-600 mb-1">Last Updated</div>
                            <div class="text-slate-900 bg-white px-3 py-2 rounded border border-slate-200">{formatDate(post.updated_at)}</div>
                        </div>
                        {#if author}
                        <div>
                            <div class="text-slate-600 mb-1">Author</div>
                            <div class="text-slate-900 bg-white px-3 py-2 rounded border border-slate-200 flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span>{author.name}</span>
                            </div>
                        </div>
                        {/if}
                    </div>
                </div>

                <!-- Markdown Help -->
                <div class="bg-primary-50 border border-primary-200 rounded-lg p-6 md:col-span-2">
                    <h3 class="font-bold text-primary-900 mb-3 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <path d="M12 17h.01"></path>
                        </svg>
                        <span>Markdown Syntax</span>
                    </h3>
                    <div class="grid grid-cols-2 gap-4 text-sm text-primary-800">
                        <div>
                            <p class="mb-2"><code class="bg-primary-100 px-2 py-1 rounded"># Heading 1</code></p>
                            <p class="mb-2"><code class="bg-primary-100 px-2 py-1 rounded">## Heading 2</code></p>
                            <p class="mb-2"><code class="bg-primary-100 px-2 py-1 rounded">**bold text**</code></p>
                        </div>
                        <div>
                            <p class="mb-2"><code class="bg-primary-100 px-2 py-1 rounded">*italic text*</code></p>
                            <p class="mb-2"><code class="bg-primary-100 px-2 py-1 rounded">[link](url)</code></p>
                            <p class="mb-2"><code class="bg-primary-100 px-2 py-1 rounded">```code block```</code></p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        {/if}

    </div>

</main>

<!-- Footer -->
<footer class="container mx-auto px-6 py-8 mt-16 border-t border-slate-200">
    <div class="flex flex-col md:flex-row justify-between items-center text-sm text-slate-600">
        <p>© 2024 SlugPost. Built with ❤️ by Maulana Shalihin</p>
        <div class="flex space-x-6 mt-4 md:mt-0">
            <a href="/" class="hover:text-primary-600 transition-colors">Home</a>
            <a href="/about" class="hover:text-primary-600 transition-colors">About</a>
            <a href="https://github.com" class="hover:text-primary-600 transition-colors">GitHub</a>
        </div>
    </div>
</footer>
