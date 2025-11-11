<script>
    import { router, page } from '@inertiajs/svelte';
    import { fly } from 'svelte/transition';

    // Props
    let user = $page.props.user;;

    let isUserMenuOpen = false;

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
</script>

<svelte:window on:click={handleClickOutside} />

<!-- Navigation -->
<nav class="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <div class="flex items-center justify-between">
        <a href="/" class="flex items-center space-x-2">
            <img src="/public/android-icon-48x48.png" alt="SlugPost Logo" class="w-8 h-8 sm:w-12 sm:h-12">
            <span class="text-xl sm:text-2xl font-bold text-slate-900">SlugPost</span>
        </a>
        <div class="flex items-center space-x-2 sm:space-x-4">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <a href="/login" class="text-slate-600 hover:text-primary-600 transition-colors font-medium text-sm sm:text-base">Login</a>
            <a href="/register" class="bg-primary-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg hover:bg-primary-700 transition-all font-medium shadow-lg shadow-primary-600/30 text-sm sm:text-base">Sign Up</a>
            {/if}
        </div>
    </div>
</nav>
