<script>
    import { router, inertia } from '@inertiajs/svelte';
    import { onMount, tick } from 'svelte';
    import { Toast } from '../Components/helper.js';

    export let post;
    export let author;
    export let edit_token;
    export let user;

    let form = {
        content: post.content,
        slug: post.slug,
        format: 'html'
    };

    // View modes: 'split', 'editor', 'preview', 'mobile'
    let viewMode = 'split';
    let isSaving = false;
    let lastSaved = post.updated_at;
    let hasUnsavedChanges = false;
    let editorElement;
    let highlightedCode = '';
    let lineNumbers = [];

    $: if (form.content !== post.content) {
        hasUnsavedChanges = true;
    }

    $: {
        highlightedCode = highlightHtml(form.content);
        lineNumbers = form.content.split('\n').map((_, i) => i + 1);
    }

    function highlightHtml(code) {
        if (!code) return '';
        
        // Escape HTML entities
        let result = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Use placeholder for slashes in closing tags to avoid conflicts
        result = result.replace(/&lt;\//g, '&lt;§SLASH§');

        // HTML Comments - must be first
        result = result.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '§COM_START§$1§COM_END§');
        
        // DOCTYPE
        result = result.replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi, '§DOC_START§$1§DOC_END§');

        // Opening tags
        result = result.replace(/(&lt;)([a-zA-Z][\w-]*)/g, '$1§TAG_START§$2§TAG_END§');
        
        // Closing tags (with placeholder)
        result = result.replace(/(&lt;§SLASH§)([a-zA-Z][\w-]*)(&gt;)/g, '$1§TAG_START§$2§TAG_END§$3');
        
        // Attributes with double quotes
        result = result.replace(/\s([a-zA-Z][\w-:]*)(\s*=\s*)"([^"]*)"/g, 
            ' §ATTR_START§$1§ATTR_END§$2§STR_START§"$3"§STR_END§');
        
        // Attributes with single quotes
        result = result.replace(/\s([a-zA-Z][\w-:]*)(\s*=\s*)'([^']*)'/g, 
            ' §ATTR_START§$1§ATTR_END§$2§STR_START§\'$3\'§STR_END§');

        // Angle brackets
        result = result.replace(/&lt;/g, '§BR_START§&lt;§BR_END§');
        result = result.replace(/&gt;/g, '§BR_START§&gt;§BR_END§');
        result = result.replace(/§SLASH§/g, '§BR_START§/§BR_END§');

        // Now replace all placeholders with actual span tags
        result = result
            .replace(/§COM_START§/g, '<span class="hl-comment">')
            .replace(/§COM_END§/g, '</span>')
            .replace(/§DOC_START§/g, '<span class="hl-doctype">')
            .replace(/§DOC_END§/g, '</span>')
            .replace(/§TAG_START§/g, '<span class="hl-tag">')
            .replace(/§TAG_END§/g, '</span>')
            .replace(/§ATTR_START§/g, '<span class="hl-attr">')
            .replace(/§ATTR_END§/g, '</span>')
            .replace(/§STR_START§/g, '<span class="hl-string">')
            .replace(/§STR_END§/g, '</span>')
            .replace(/§BR_START§/g, '<span class="hl-bracket">')
            .replace(/§BR_END§/g, '</span>');

        return result;
    }

    function formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async function submitForm() {
        isSaving = true;
        try {
            const response = await fetch(`/${post.slug}/edit/${edit_token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                hasUnsavedChanges = false;
                lastSaved = new Date().toISOString();
                Toast('Changes saved successfully!', 'success');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            Toast('Failed to save changes. Please try again.', 'error');
        } finally {
            isSaving = false;
        }
    }

    function claimPost() {
        router.visit(`/claim/${post.slug}?token=${edit_token}`);
    }

    function handleKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            submitForm();
        }
    }

    function handleEditorKeydown(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            form.content = form.content.substring(0, start) + '  ' + form.content.substring(end);
            tick().then(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 2;
            });
        }
    }

    function syncScroll(e) {
        const highlightEl = document.querySelector('.highlight-overlay');
        const lineNumbersEl = document.querySelector('.line-numbers');
        if (highlightEl) {
            highlightEl.scrollTop = e.target.scrollTop;
            highlightEl.scrollLeft = e.target.scrollLeft;
        }
        if (lineNumbersEl) {
            lineNumbersEl.scrollTop = e.target.scrollTop;
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    });
</script>

<svelte:head>
    <title>Edit: {post.title} - SlugPost</title>
</svelte:head>

<div class="h-screen flex flex-col bg-[#282c34] text-[#abb2bf] overflow-hidden">
    <!-- Top Toolbar -->
    <header class="flex-shrink-0 h-12 bg-[#21252b] border-b border-[#181a1f] flex items-center justify-between px-4">
        <!-- Left: Logo & Title -->
        <div class="flex items-center space-x-4">
            <a href="/home" use:inertia  class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img src="/public/android-icon-48x48.png" alt="SlugPost" class="w-7 h-7">
                <span class="font-bold text-lg hidden sm:inline">SlugPost</span>
            </a>
            <div class="h-6 w-px bg-[#3e4451] hidden sm:block"></div>
            <div class="hidden sm:block">
                <h1 class="text-sm font-medium text-slate-200 truncate max-w-[200px]">{post.title}</h1>
                <div class="flex items-center space-x-2 text-xs text-slate-500">
                    <span>/{post.slug}</span>
                    {#if hasUnsavedChanges}
                        <span class="text-orange-400">• Unsaved</span>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Center: View Mode Toggle -->
        <div class="flex items-center bg-[#2c313a] rounded-lg p-0.5">
            <button 
                on:click={() => viewMode = 'editor'}
                class="px-3 py-1.5 rounded-md text-xs font-medium transition-all {viewMode === 'editor' ? 'bg-[#3e4451] text-white' : 'text-[#5c6370] hover:text-[#abb2bf]'}"
                title="Editor only"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
            </button>
            <button 
                on:click={() => viewMode = 'split'}
                class="px-3 py-1.5 rounded-md text-xs font-medium transition-all {viewMode === 'split' ? 'bg-[#3e4451] text-white' : 'text-[#5c6370] hover:text-[#abb2bf]'}"
                title="Split view"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="12" y1="3" x2="12" y2="21"></line>
                </svg>
            </button>
            <button 
                on:click={() => viewMode = 'mobile'}
                class="px-3 py-1.5 rounded-md text-xs font-medium transition-all {viewMode === 'mobile' ? 'bg-[#3e4451] text-white' : 'text-[#5c6370] hover:text-[#abb2bf]'}"
                title="Editor + Mobile preview"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
            </button>
            <button 
                on:click={() => viewMode = 'preview'}
                class="px-3 py-1.5 rounded-md text-xs font-medium transition-all {viewMode === 'preview' ? 'bg-[#3e4451] text-white' : 'text-[#5c6370] hover:text-[#abb2bf]'}"
                title="Preview only"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center space-x-2">
            <a 
                href="/{post.slug}/visual/{edit_token}"
                class="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                title="Visual Builder - Edit without code"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                <span class="hidden sm:inline">Visual</span>
            </a>

            <a 
                href="/{post.slug}/settings/{edit_token}"
                class="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#abb2bf] hover:text-white hover:bg-[#3e4451] rounded-lg transition-colors"
                title="Post Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                <span class="hidden sm:inline">Settings</span>
            </a>

            {#if !author && user}
                <button 
                    on:click={claimPost}
                    class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-primary-400 border border-primary-500/50 rounded-lg hover:bg-primary-500/10 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <line x1="19" x2="19" y1="8" y2="14"></line>
                        <line x1="22" x2="16" y1="11" y2="11"></line>
                    </svg>
                    <span>Claim</span>
                </button>
            {/if}
            
            <a 
                href="/{post.slug}" 
                target="_blank"
                class="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#abb2bf] border border-[#3e4451] rounded-lg hover:bg-[#3e4451] transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span class="hidden sm:inline">View</span>
            </a>

            <button
                on:click={submitForm}
                disabled={isSaving || !hasUnsavedChanges}
                class="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {#if isSaving}
                    <svg class="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                {/if}
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            {#if user}
                <a href="/home" class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm" title="Dashboard">
                    {user.name[0].toUpperCase()}
                </a>
            {/if}
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 flex overflow-hidden">
        <!-- Editor Panel -->
        {#if viewMode !== 'preview'}
            <div class="flex-1 flex flex-col bg-[#282c34] {viewMode === 'split' ? 'w-1/2' : viewMode === 'mobile' ? 'flex-1' : 'w-full'}">
                <!-- Editor Header -->
                <div class="flex-shrink-0 h-9 bg-[#21252b] border-b border-[#181a1f] flex items-center px-4">
                    <div class="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#e06c75]">
                            <polyline points="16 18 22 12 16 6"></polyline>
                            <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                        <span class="text-xs font-medium text-[#abb2bf]">HTML</span>
                    </div>
                    <div class="ml-auto flex items-center space-x-3 text-xs text-[#5c6370]">
                        <span>{form.content.length} chars</span>
                        <span>•</span>
                        <span>{form.content.split('\n').length} lines</span>
                    </div>
                </div>

                <!-- Code Editor -->
                <div class="flex-1 relative overflow-hidden">
                    <!-- Line Numbers -->
                    <div class="line-numbers absolute left-0 top-0 bottom-0 w-14 bg-[#282c34] border-r border-[#3e4451] overflow-hidden select-none pointer-events-none z-10">
                        <div class="py-4 pr-4 text-right">
                            {#each lineNumbers as num}
                                <div class="text-xs leading-6 text-[#4b5263] font-mono">{num}</div>
                            {/each}
                        </div>
                    </div>

                    <!-- Syntax Highlighted Overlay -->
                    <div class="highlight-overlay absolute left-14 top-0 right-0 bottom-0 overflow-hidden pointer-events-none z-0">
                        <pre class="p-4 pl-4 text-sm leading-6 font-mono whitespace-pre-wrap break-words text-[#abb2bf]">{@html highlightedCode}</pre>
                    </div>

                    <!-- Actual Textarea -->
                    <textarea
                        bind:this={editorElement}
                        bind:value={form.content}
                        on:scroll={syncScroll}
                        on:keydown={handleEditorKeydown}
                        spellcheck="false"
                        class="absolute inset-0 w-full h-full pl-[72px] pr-4 py-4 bg-transparent text-transparent caret-[#528bff] text-sm leading-6 font-mono resize-none focus:outline-none z-20"
                        placeholder="<html>&#10;  <head>&#10;    <title>My Page</title>&#10;  </head>&#10;  <body>&#10;    <h1>Hello World</h1>&#10;  </body>&#10;</html>"
                    ></textarea>
                </div>

                <!-- Editor Footer -->
                <div class="flex-shrink-0 h-7 bg-[#21252b] border-t border-[#181a1f] flex items-center px-4 text-xs text-[#5c6370]">
                    <div class="flex items-center space-x-4">
                        <span class="flex items-center space-x-1">
                            <kbd class="px-1.5 py-0.5 bg-[#2c313a] rounded text-[10px] border border-[#3e4451]">⌘S</kbd>
                            <span>Save</span>
                        </span>
                        <span class="flex items-center space-x-1">
                            <kbd class="px-1.5 py-0.5 bg-[#2c313a] rounded text-[10px] border border-[#3e4451]">Tab</kbd>
                            <span>Indent</span>
                        </span>
                    </div>
                    <div class="ml-auto">
                        Last saved: {formatDate(lastSaved)}
                    </div>
                </div>
            </div>
        {/if}

        <!-- Resizer (for split view) -->
        {#if viewMode === 'split'}
            <div class="w-1 bg-[#3e4451] hover:bg-[#528bff] cursor-col-resize transition-colors"></div>
        {/if}

        <!-- Preview Panel -->
        {#if viewMode !== 'editor'}
            <div class="flex flex-col bg-white {viewMode === 'split' ? 'w-1/2' : viewMode === 'mobile' ? 'w-[375px] flex-shrink-0' : 'w-full'}">
                <!-- Preview Header -->
                <div class="flex-shrink-0 h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4">
                    <div class="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span class="text-xs font-medium text-slate-600">
                            {viewMode === 'mobile' ? 'Mobile Preview (375px)' : 'Preview'}
                        </span>
                    </div>
                    {#if viewMode === 'mobile'}
                        <div class="ml-auto flex items-center space-x-1 text-xs text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                            </svg>
                            <span>iPhone SE</span>
                        </div>
                    {/if}
                </div>

                <!-- Preview Content -->
                <div class="flex-1 overflow-auto {viewMode === 'mobile' ? 'bg-slate-200 p-4' : ''}">
                    {#if viewMode === 'mobile'}
                        <div class="mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-slate-800" style="width: 375px; height: calc(100% - 2rem);">
                            <div class="h-6 bg-slate-800 flex items-center justify-center">
                                <div class="w-20 h-4 bg-slate-900 rounded-full"></div>
                            </div>
                            <iframe
                                srcdoc={form.content}
                                class="w-full h-[calc(100%-1.5rem)] border-0"
                                title="Mobile Preview"
                                sandbox="allow-scripts"
                            ></iframe>
                        </div>
                    {:else}
                        <iframe
                            srcdoc={form.content}
                            class="w-full h-full border-0"
                            title="Preview"
                            sandbox="allow-scripts"
                        ></iframe>
                    {/if}
                </div>
            </div>
        {/if}
    </main>
</div>

<style>
    .highlight-overlay pre {
        margin: 0;
        background: transparent;
    }

    /* One Dark Pro Theme - Elegant Colors */
    :global(.hl-tag) {
        color: #e06c75;
        font-weight: 500;
    }
    :global(.hl-attr) {
        color: #d19a66;
    }
    :global(.hl-string) {
        color: #98c379;
    }
    :global(.hl-comment) {
        color: #5c6370;
        font-style: italic;
    }
    :global(.hl-doctype) {
        color: #7f848e;
    }
    :global(.hl-bracket) {
        color: #abb2bf;
    }
    :global(.hl-keyword) {
        color: #c678dd;
    }
    :global(.hl-number) {
        color: #d19a66;
    }
    :global(.hl-function) {
        color: #61afef;
    }
    :global(.hl-selector) {
        color: #e06c75;
    }
    :global(.hl-property) {
        color: #56b6c2;
    }
    :global(.hl-value) {
        color: #98c379;
    }
    :global(.hl-punctuation) {
        color: #abb2bf;
    }

    /* Scrollbar styling - One Dark theme */
    textarea::-webkit-scrollbar,
    .highlight-overlay::-webkit-scrollbar,
    .line-numbers::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }
    textarea::-webkit-scrollbar-track,
    .highlight-overlay::-webkit-scrollbar-track,
    .line-numbers::-webkit-scrollbar-track {
        background: #21252b;
    }
    textarea::-webkit-scrollbar-thumb,
    .highlight-overlay::-webkit-scrollbar-thumb,
    .line-numbers::-webkit-scrollbar-thumb {
        background: #4b5263;
        border-radius: 5px;
        border: 2px solid #21252b;
    }
    textarea::-webkit-scrollbar-thumb:hover,
    .highlight-overlay::-webkit-scrollbar-thumb:hover,
    .line-numbers::-webkit-scrollbar-thumb:hover {
        background: #5c6370;
    }

    /* Hide scrollbar on line numbers */
    .line-numbers {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .line-numbers::-webkit-scrollbar {
        display: none;
    }
</style>
