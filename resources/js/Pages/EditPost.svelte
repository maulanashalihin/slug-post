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
    <div class="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-2">
                 <img src="/public/android-icon-48x48.png" alt="SLugPost Logo" class="w-8 h-8 sm:w-12 sm:h-12">
                <span class="text-lg sm:text-xl font-bold text-slate-900">SlugPost</span>
            </a>
            <div class="flex items-center space-x-2 sm:space-x-4">
                <a 
                    href="/{post.slug}"
                    class="text-slate-600 hover:text-slate-900 transition-colors font-medium flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-5 sm:h-5">
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
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
                <div class="flex items-center space-x-1 sm:space-x-2">
                    <a 
                        href="/login" 
                        class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                    >
                        Login
                    </a>
                    <a 
                        href="/register" 
                        class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
<main class="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
    
    <!-- Top Bar -->
    <div class="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div class="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                <div class="flex-1 sm:flex-none">
                    <h1 class="text-lg sm:text-xl font-bold text-slate-900 truncate">{post.title}</h1>
                    <div class="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 mt-1">
                        <span class="truncate max-w-[120px] sm:max-w-none">/{post.slug}</span>
                        <span class="hidden sm:inline">•</span>
                        <span>{post.view_count} views</span>
                        {#if hasUnsavedChanges}
                        <span class="flex items-center space-x-1 text-orange-600 text-xs sm:text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-3.5 sm:h-3.5">
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
            
            <div class="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                {#if !author}
                <button 
                    on:click={claimPost}
                    class="bg-white border-2 border-primary-600 text-primary-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-50 transition-all font-medium flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <line x1="19" x2="19" y1="8" y2="14"></line>
                        <line x1="22" x2="16" y1="11" y2="11"></line>
                    </svg>
                    <span class="hidden sm:inline">Claim</span>
                </button>
                {/if}
                
                <button
                    on:click={submitForm}
                    disabled={isSaving || !hasUnsavedChanges}
                    class="bg-primary-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-primary-700 transition-all font-medium flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none justify-center"
                >
                    {#if isSaving}
                    <svg class="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                    {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
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
    <div class="bg-orange-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div class="flex items-start space-x-2 sm:space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-600 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
            </svg>
            <div class="flex-1">
                <h3 class="font-semibold text-orange-900 mb-1 text-sm sm:text-base">Anonymous Post</h3>
                <p class="text-xs sm:text-sm text-orange-800">This post is not claimed. Register or login to claim ownership and manage it from your dashboard.</p>
            </div>
        </div>
    </div>
    {/if}

    <!-- Tab Navigation -->
    <div class="bg-white rounded-t-lg sm:rounded-t-xl shadow-sm border-x border-t border-slate-200">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-slate-200 gap-2 sm:gap-0">
            <div class="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
                <button 
                    on:click={() => activeTab = 'edit'}
                    class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap {activeTab === 'edit' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'}"
                >
                    <span class="flex items-center space-x-1 sm:space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                        </svg>
                        <span>Info</span>
                    </span>
                </button>
            </div>
            
            <div class="hidden md:flex items-center space-x-2 text-xs text-slate-500">
                <kbd class="px-2 py-1 bg-slate-100 rounded border border-slate-300">⌘S</kbd>
                <span>to save</span>
                <span>•</span>
                <kbd class="px-2 py-1 bg-slate-100 rounded border border-slate-300">⌘P</kbd>
                <span>to preview</span>
            </div>
        </div>
    </div>

    <!-- Tab Content -->
    <div class="bg-white rounded-b-lg sm:rounded-b-xl shadow-sm border-x border-b border-slate-200 overflow-hidden">
        
        {#if activeTab === 'edit'}
        <!-- Editor Tab -->
        <div class="p-3 sm:p-6">
            <textarea 
                bind:value={form.content}
                rows="20"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-xs sm:text-sm resize-none"
                placeholder="# Your Title

Write your markdown content here...

## Features
- Easy to use
- Beautiful rendering
- Syntax highlighting"
            ></textarea>
            
            <div class="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
                <div class="flex items-center space-x-2 sm:space-x-4">
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
        <div class="p-4 sm:p-8">
            <div class="prose prose-slate max-w-none">
                {@html previewHtml}
            </div>
        </div>
        {/if}

        {#if activeTab === 'info'}
        <!-- Info Tab -->
        <div class="p-3 sm:p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                <!-- Post Details -->
                <div class="bg-slate-50 rounded-lg p-4 sm:p-6">
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
                <div class="bg-slate-50 rounded-lg p-4 sm:p-6">
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
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
                <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 sm:p-6 md:col-span-2">
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
<footer class="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-8 sm:mt-16 border-t border-slate-200">
        <div class="flex flex-col md:flex-row justify-between items-center text-xs sm:text-sm text-slate-600">
            <p class="text-center md:text-left">© 2025 SlugPost. Built with ❤️ by Maulana Shalihin</p>
             <div class="flex space-x-4 sm:space-x-6 mt-3 sm:mt-4 md:mt-0">
                <a href="/about" class="hover:text-primary-600 transition-colors">About</a>
                <a href="https://github.com/maulanashalihin/slug-post" target="_blank" rel="noopener noreferrer" class="hover:text-primary-600 transition-colors flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                </a>
                <a href="/docs" class="hover:text-primary-600 transition-colors">Docs</a>
            </div>
        </div>
    </footer>
