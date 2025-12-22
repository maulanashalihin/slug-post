<script>
    import { router, page, inertia } from '@inertiajs/svelte';
    import { fly, fade, slide } from 'svelte/transition';
    import { cubicOut, cubicInOut } from 'svelte/easing';

    let user = $page.props.user;
    let currentPath = $page.url;

    let isUserMenuOpen = false;
    let isMobileMenuOpen = false;
    let scrolled = false;

    function handleLogout() {
        router.post('/logout');
    }

    function handleClickOutside(event) {
        if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
            isUserMenuOpen = false;
        }
    }

    function handleScroll() {
        scrolled = window.scrollY > 10;
    }

    function closeMobileMenu() {
        isMobileMenuOpen = false;
    }

    function isActive(path) {
        if (path === '/') return currentPath === '/';
        return currentPath.startsWith(path);
    }
</script>

<svelte:window on:click={handleClickOutside} on:scroll={handleScroll} />

<!-- Sticky Navigation -->
<header 
    class="sticky top-0 z-50 transition-all duration-300 {scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50' : 'bg-transparent'}"
>
    <nav class="container mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16 sm:h-20">
            <!-- Logo -->
            <a href="/home" use:inertia class="flex items-center space-x-2.5 group">
                <div class="relative">
                    <img src="/public/android-icon-48x48.png" alt="SlugPost Logo" class="w-9 h-9 sm:w-10 sm:h-10 transition-transform group-hover:scale-105">
                </div>
                <span class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">SlugPost</span>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center space-x-1">
                {#if user}
                    <a 
                        href="/" 
                        use:inertia
                        class="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full
                            {isActive('/') && currentPath === '/' ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
                    >
                        <span class="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 5v14"></path>
                                <path d="M5 12h14"></path>
                            </svg>
                            <span>Create</span>
                        </span>
                    </a>
                    <a 
                        href="/home" 
                        use:inertia
                        class="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full
                            {isActive('/home') ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
                    >
                        <span class="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                            </svg>
                            <span>My Posts</span>
                        </span>
                    </a>

                    <!-- Divider -->
                    <div class="w-px h-6 bg-slate-200 mx-2"></div>

                    <!-- User Dropdown -->
                    <div class="relative user-menu-container">
                        <button 
                            class="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 hover:bg-slate-100 {isUserMenuOpen ? 'bg-slate-100' : ''}"
                            on:click={() => isUserMenuOpen = !isUserMenuOpen}
                        >
                            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                                <span class="text-white font-semibold text-sm">{user.name[0].toUpperCase()}</span>
                            </div>
                            <span class="font-medium text-slate-700 max-w-[100px] truncate">{user.name}</span>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                stroke-width="2" 
                                stroke-linecap="round" 
                                stroke-linejoin="round"
                                class="text-slate-400 transition-transform duration-200 {isUserMenuOpen ? 'rotate-180' : ''}"
                            >
                                <path d="m6 9 6 6 6-6"/>
                            </svg>
                        </button>

                        {#if isUserMenuOpen}
                        <div 
                            class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/50 py-2 overflow-hidden"
                            transition:fly={{ y: -8, duration: 200, easing: cubicOut }}
                        >
                            <!-- User Info -->
                            <div class="px-4 py-3 border-b border-slate-100">
                                <p class="text-sm font-semibold text-slate-900">{user.name}</p>
                                <p class="text-xs text-slate-500 truncate">{user.email || 'No email'}</p>
                            </div>

                            <div class="py-2">
                                <a 
                                    href="/profile" 
                                    use:inertia
                                    class="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <span>Edit Profile</span>
                                </a>
                            </div>

                            <div class="border-t border-slate-100 pt-2">
                                <button 
                                    on:click={handleLogout}
                                    class="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" x2="9" y1="12" y2="12"></line>
                                    </svg>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                        {/if}
                    </div>
                {:else}
                    <a href="/login" use:inertia class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Login</a>
                    <a href="/register" use:inertia class="ml-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 font-medium text-sm">
                        Get Started
                    </a>
                {/if}
            </div>

            <!-- Mobile Menu Button -->
            <button 
                class="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                on:click={() => isMobileMenuOpen = !isMobileMenuOpen}
                aria-label="Toggle menu"
            >
                <div class="w-5 h-4 flex flex-col justify-between">
                    <span class="w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 origin-center {isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}"></span>
                    <span class="w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 {isMobileMenuOpen ? 'opacity-0 scale-0' : ''}"></span>
                    <span class="w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 origin-center {isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}"></span>
                </div>
            </button>
        </div>
    </nav>
</header>

<!-- Mobile Menu Overlay -->
{#if isMobileMenuOpen}
<button 
    class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden cursor-default"
    transition:fade={{ duration: 200 }}
    on:click={closeMobileMenu}
    aria-label="Close menu"
></button>
{/if}

<!-- Mobile Menu Drawer -->
{#if isMobileMenuOpen}
<div 
    class="fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-50 md:hidden"
    transition:fly={{ x: 280, duration: 300, easing: cubicInOut }}
>
    <!-- Drawer Header -->
    <div class="flex items-center justify-between px-5 h-16 border-b border-slate-100">
        <span class="font-bold text-slate-900">Menu</span>
        <button 
            class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            on:click={closeMobileMenu}
            aria-label="Close menu"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-600">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
            </svg>
        </button>
    </div>

    <!-- Drawer Content -->
    <div class="p-5 space-y-2">
        {#if user}
            <!-- User Card -->
            <div class="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                    <span class="text-white font-bold text-lg">{user.name[0].toUpperCase()}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-slate-900 truncate">{user.name}</p>
                    <p class="text-xs text-slate-500 truncate">{user.email || 'No email'}</p>
                </div>
            </div>

            <!-- Navigation Links -->
            <a 
                href="/" 
                use:inertia
                on:click={closeMobileMenu}
                class="flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200
                    {isActive('/') && currentPath === '/' ? 'bg-primary-50 text-primary-600' : 'text-slate-700 hover:bg-slate-50'}"
            >
                <div class="w-9 h-9 rounded-lg flex items-center justify-center {isActive('/') && currentPath === '/' ? 'bg-primary-100' : 'bg-slate-100'}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 5v14"></path>
                        <path d="M5 12h14"></path>
                    </svg>
                </div>
                <span class="font-medium">Create Post</span>
            </a>

            <a 
                href="/home" 
                use:inertia
                on:click={closeMobileMenu}
                class="flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200
                    {isActive('/home') ? 'bg-primary-50 text-primary-600' : 'text-slate-700 hover:bg-slate-50'}"
            >
                <div class="w-9 h-9 rounded-lg flex items-center justify-center {isActive('/home') ? 'bg-primary-100' : 'bg-slate-100'}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    </svg>
                </div>
                <span class="font-medium">My Posts</span>
            </a>

            <a 
                href="/profile" 
                use:inertia
                on:click={closeMobileMenu}
                class="flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200
                    {isActive('/profile') ? 'bg-primary-50 text-primary-600' : 'text-slate-700 hover:bg-slate-50'}"
            >
                <div class="w-9 h-9 rounded-lg flex items-center justify-center {isActive('/profile') ? 'bg-primary-100' : 'bg-slate-100'}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <span class="font-medium">Edit Profile</span>
            </a>

            <!-- Divider -->
            <div class="my-4 border-t border-slate-100"></div>

            <!-- Logout -->
            <button 
                on:click={() => { closeMobileMenu(); handleLogout(); }}
                class="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
            >
                <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" x2="9" y1="12" y2="12"></line>
                    </svg>
                </div>
                <span class="font-medium">Logout</span>
            </button>
        {:else}
            <!-- Guest Links -->
            <div class="space-y-3 pt-4">
                <a 
                    href="/login" 
                    use:inertia
                    on:click={closeMobileMenu}
                    class="block w-full text-center px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                >
                    Login
                </a>
                <a 
                    href="/register" 
                    use:inertia
                    on:click={closeMobileMenu}
                    class="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
                >
                    Get Started
                </a>
            </div>
        {/if}
    </div>

    <!-- Drawer Footer -->
    <div class="absolute bottom-0 left-0 right-0 p-5 border-t border-slate-100 bg-slate-50/50">
        <div class="flex items-center justify-center space-x-4 text-xs text-slate-500">
            <a href="/about" use:inertia on:click={closeMobileMenu} class="hover:text-primary-600 transition-colors">About</a>
            <span>•</span>
            <a href="/docs" use:inertia on:click={closeMobileMenu} class="hover:text-primary-600 transition-colors">Docs</a>
            <span>•</span>
            <a href="https://github.com/maulanashalihin/slug-post" target="_blank" rel="noopener noreferrer" class="hover:text-primary-600 transition-colors">GitHub</a>
        </div>
    </div>
</div>
{/if}
