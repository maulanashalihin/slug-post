<script>
    import Header from '../Components/Header.svelte';

    // Props from controller
    export let slug;
    export let edit_token;
    export let user;
    export let is_claimed = false;

    // Generate URLs
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/${slug}`;
    const editUrl = `${baseUrl}/${slug}/edit/${edit_token}`;
    const claimUrl = `${baseUrl}/claim/${slug}?token=${edit_token}`;

    // Copy to clipboard function
    async function copyToClipboard(text, buttonId) {
        try {
            await navigator.clipboard.writeText(text);
            const button = document.getElementById(buttonId);
            const originalHTML = button.innerHTML;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Copied!</span>
            `;
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
</script>

<svelte:head>
    <title>Post Published - SlugPost</title>
</svelte:head>

<Header {user} />

<!-- Main Content -->
<main class="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-4xl">
    
    <!-- Success Icon -->
    <div class="text-center mb-6 sm:mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 text-white rounded-full mb-4 sm:mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-2 sm:mb-3 px-2">
            Post Published!
        </h1>
        <p class="text-base sm:text-xl text-slate-600 px-4">
            Your markdown post is now live and ready to share
        </p>
    </div>

    <!-- URLs Card -->
    <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-6 sm:mb-8">
        
        <!-- Public URL -->
        <div class="p-4 sm:p-8 border-b border-slate-200">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-1">Public URL</h2>
                    <p class="text-xs sm:text-sm text-slate-600">Share this link with anyone</p>
                </div>
                <span class="bg-primary-100 text-primary-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2">Public</span>
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <input 
                    type="text" 
                    readonly 
                    value={publicUrl}
                    class="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div class="flex gap-2">
                    <a 
                        href={publicUrl}
                        target="_blank"
                        class="flex-1 sm:flex-none bg-white border-2 border-primary-600 text-primary-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-50 transition-all font-medium flex items-center justify-center space-x-2 whitespace-nowrap text-sm sm:text-base"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>View</span>
                    </a>
                    <button 
                        on:click={() => copyToClipboard(publicUrl, 'publicCopyBtn')}
                        id="publicCopyBtn"
                        class="flex-1 sm:flex-none bg-primary-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-700 transition-all font-medium flex items-center justify-center space-x-2 whitespace-nowrap text-sm sm:text-base"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                        </svg>
                        <span>Copy</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Edit URL -->
        <div class="p-4 sm:p-8 bg-orange-50">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-1">Edit URL</h2>
                    <p class="text-xs sm:text-sm text-orange-700 font-medium">⚠️ Save this link - shown only once!</p>
                </div>
                <span class="bg-orange-100 text-orange-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2">Private</span>
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <input 
                    type="text" 
                    readonly 
                    value={editUrl}
                    class="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white border border-orange-200 rounded-lg font-mono text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div class="flex gap-2">
                    <a 
                        href={editUrl}
                        target="_blank"
                        class="flex-1 sm:flex-none bg-white border-2 border-slate-300 text-slate-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-slate-50 transition-all font-medium flex items-center justify-center space-x-2 whitespace-nowrap text-sm sm:text-base"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            <path d="m15 5 4 4"></path>
                        </svg>
                        <span>Edit</span>
                    </a>
                    <button 
                        on:click={() => copyToClipboard(editUrl, 'editCopyBtn')}
                        id="editCopyBtn"
                        class="flex-1 sm:flex-none bg-slate-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-slate-800 transition-all font-medium flex items-center justify-center space-x-2 whitespace-nowrap text-sm sm:text-base"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                        </svg>
                        <span>Copy</span>
                    </button>
                </div>
            </div>
            <div class="bg-orange-100 border border-orange-200 rounded-lg p-3 sm:p-4">
                <div class="flex items-start space-x-2 sm:space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-600 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                    </svg>
                    <div class="text-xs sm:text-sm text-orange-800">
                        <p class="font-semibold mb-1">Important Security Notice</p>
                        <p>This edit link will <strong>never be shown again</strong>. Save it in a safe place like a password manager or bookmark it. Without this link, you won't be able to edit your post unless you register and claim it.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        {#if !is_claimed}
        <a 
            href={claimUrl}
            class="bg-primary-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-primary-700 transition-all font-semibold text-base sm:text-lg shadow-xl shadow-primary-600/30 hover:shadow-2xl hover:shadow-primary-600/40 flex items-center justify-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 sm:w-6 sm:h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span>Claim This Post</span>
        </a>
        {:else}
        <div class="bg-green-50 border-2 border-green-200 text-green-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 sm:w-6 sm:h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>Post Already Claimed</span>
        </div>
        {/if}
        <a 
            href="/"
            class="bg-white text-slate-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-all font-semibold text-base sm:text-lg shadow-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
            </svg>
            <span>Publish Another</span>
        </a>
    </div>

    <!-- Tips -->
    <div class="mt-8 sm:mt-12 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 p-4 sm:p-6">
        <h3 class="font-bold text-slate-900 mb-3 sm:mb-4 flex items-center space-x-2 text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-600 sm:w-5 sm:h-5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
            </svg>
            <span>What's Next?</span>
        </h3>
        <ul class="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-600">
            <li class="flex items-start space-x-2 sm:space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent-600 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Share your post</strong> using the public URL with anyone on social media, email, or messaging apps</span>
            </li>
            <li class="flex items-start space-x-2 sm:space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent-600 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Bookmark the edit link</strong> in your browser or save it in a password manager for future updates</span>
            </li>
            {#if !is_claimed}
            <li class="flex items-start space-x-2 sm:space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent-600 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Claim this post</strong> by clicking the button above to manage it from your dashboard</span>
            </li>
            {:else}
            <li class="flex items-start space-x-2 sm:space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent-600 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Post is claimed</strong> - You can manage this post from your dashboard</span>
            </li>
            {/if}
        </ul>
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
