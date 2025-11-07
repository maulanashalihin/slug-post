<script>
    import { router } from '@inertiajs/svelte';
    import { fly } from 'svelte/transition';

    export let user;
    export let posts = [];

    // Format date
    function formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Handle logout
    function handleLogout() {
        router.post('/logout');
    }

    // User menu state
    let isUserMenuOpen = false;

    // Click outside handler
    function handleClickOutside(event) {
        if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
            isUserMenuOpen = false;
        }
    }
</script>

<svelte:head>
    <title>My Posts - SlugPost</title>
</svelte:head>

<svelte:window on:click={handleClickOutside} />

<!-- Navigation -->
<nav class="bg-white border-b border-slate-200">
    <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
            <a href="/" class="flex items-center space-x-2">
              <img src="/public/android-icon-48x48.png" alt="SLugPost Logo">
                <span class="text-xl font-bold text-slate-900">SlugPost</span>
            </a>
            
            {#if user}
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
                        class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors bg-slate-50"
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
            {/if}
        </div>
    </div>
</nav>

<!-- Main Content -->
<main class="container mx-auto px-6 py-12 max-w-6xl">
    
    <!-- Header -->
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-slate-900 mb-2">My Posts</h1>
        <p class="text-slate-600">Manage all your published markdown posts</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-slate-600 mb-1">Total Posts</p>
                    <p class="text-3xl font-bold text-slate-900">{posts.length}</p>
                </div>
                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-600">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    </svg>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-slate-600 mb-1">Total Views</p>
                    <p class="text-3xl font-bold text-slate-900">{posts.reduce((sum, post) => sum + post.view_count, 0)}</p>
                </div>
                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-600">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-slate-600 mb-1">This Month</p>
                    <p class="text-3xl font-bold text-slate-900">{posts.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length}</p>
                </div>
                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-600">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Create New Post Button -->
    <div class="mb-6">
        <a 
            href="/" 
            class="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg shadow-primary-600/30"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
            </svg>
            <span>Create New Post</span>
        </a>
    </div>

    <!-- Posts List -->
    {#if posts.length > 0}
    <div class="space-y-4">
        {#each posts as post}
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <a href="/{post.slug}" class="group">
                        <h3 class="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {post.title}
                        </h3>
                    </a>
                    <div class="flex items-center space-x-4 text-sm text-slate-600 mb-4">
                        <span class="flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                <line x1="16" x2="16" y1="2" y2="6"></line>
                                <line x1="8" x2="8" y1="2" y2="6"></line>
                                <line x1="3" x2="21" y1="10" y2="10"></line>
                            </svg>
                            <span>{formatDate(post.created_at)}</span>
                        </span>
                        <span>•</span>
                        <span class="flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>{post.view_count} views</span>
                        </span>
                        <span>•</span>
                        <span class="font-mono text-xs bg-slate-100 px-2 py-1 rounded">/{post.slug}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <a 
                            href="/{post.slug}" 
                            class="inline-flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>View</span>
                        </a>
                        <span class="text-slate-300">|</span>
                        <a 
                            href="/{post.slug}/edit/{post.edit_token}" 
                            class="inline-flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-900 font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                <path d="m15 5 4 4"></path>
                            </svg>
                            <span>Edit</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        {/each}
    </div>
    {:else}
    <!-- Empty State -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
            </svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">No posts yet</h3>
        <p class="text-slate-600 mb-6">Start creating your first markdown post!</p>
        <a 
            href="/" 
            class="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all font-semibold"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
            </svg>
            <span>Create Your First Post</span>
        </a>
    </div>
    {/if}

</main>

<!-- Footer -->
<footer class="container mx-auto px-6 py-8 mt-16 border-t border-slate-200">
        <div class="flex flex-col md:flex-row justify-between items-center text-sm text-slate-600">
            <p>© 2025 SlugPost. Built with ❤️ by Maulana Shalihin</p>
             <div class="flex space-x-6 mt-4 md:mt-0">
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