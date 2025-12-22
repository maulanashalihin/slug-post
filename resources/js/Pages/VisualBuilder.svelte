<script>
    import { router } from '@inertiajs/svelte';
    import { onMount, tick } from 'svelte';
    import { Toast } from '../Components/helper.js';

    export let post;
    export let author;
    export let edit_token;
    export let user;
    export let assets = [];

    let form = {
        content: post.content,
        slug: post.slug,
        format: 'html'
    };

    let isSaving = false;
    let lastSaved = post.updated_at;
    let hasUnsavedChanges = false;
    let previewFrame;
    let selectedElement = null;
    let editingText = false;
    let showImagePicker = false;
    let currentImageElement = null;
    let isUploadingImage = false;
    let userAssets = assets;

    // Link editor state
    let showLinkEditor = false;
    let currentLinkElement = null;
    let linkForm = {
        href: '',
        text: ''
    };

    $: if (form.content !== post.content) {
        hasUnsavedChanges = true;
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

    // Save changes
    async function submitForm() {
        isSaving = true;
        try {
            // Update content from iframe (converts spans back to anchors)
            updateContentFromFrame();
            
            const response = await fetch(`/${post.slug}/edit/${edit_token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                hasUnsavedChanges = false;
                lastSaved = new Date().toISOString();
                Toast('Changes saved!', 'success');
                // Reinitialize visual editing (converts anchors back to spans)
                setTimeout(() => {
                    initVisualEditing();
                }, 100);
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            Toast('Failed to save changes', 'error');
        } finally {
            isSaving = false;
        }
    }

    // Keyboard shortcuts
    function handleKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            submitForm();
        }
        if (e.key === 'Escape') {
            selectedElement = null;
            editingText = false;
            showImagePicker = false;
            showLinkEditor = false;
            currentLinkElement = null;
        }
    }

    // Load assets from server
    async function loadAssets() {
        try {
            const response = await fetch('/api/assets');
            if (response.ok) {
                const data = await response.json();
                userAssets = data.assets || [];
            }
        } catch (error) {
            console.error('Failed to load assets:', error);
        }
    }

    // Upload new image
    async function uploadImage(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Toast('Please select an image file', 'error');
            return;
        }

        isUploadingImage = true;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/assets/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                // Add to assets list
                userAssets = [data, ...userAssets];
                // If we have a current image element, update it
                if (currentImageElement) {
                    selectImage(data.url);
                }
                Toast('Image uploaded!', 'success');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            Toast('Failed to upload image', 'error');
        } finally {
            isUploadingImage = false;
        }
    }

    // Select image from picker
    function selectImage(url) {
        if (currentImageElement && previewFrame) {
            const doc = previewFrame.contentDocument;
            const img = doc.querySelector(`[data-visual-id="${currentImageElement}"]`);
            if (img) {
                img.src = url;
                // Update the HTML content
                updateContentFromFrame();
            }
        }
        showImagePicker = false;
        currentImageElement = null;
    }

    // Update form.content from iframe
    function updateContentFromFrame() {
        if (previewFrame && previewFrame.contentDocument) {
            const doc = previewFrame.contentDocument;
            
            // Restore spans back to anchor tags
            const convertedLinks = doc.querySelectorAll('span[data-was-link="true"]');
            convertedLinks.forEach(span => {
                const anchor = doc.createElement('a');
                // Copy all attributes except data-was-link
                Array.from(span.attributes).forEach(attr => {
                    if (attr.name !== 'data-was-link' && attr.name !== 'data-visual-id') {
                        anchor.setAttribute(attr.name, attr.value);
                    }
                });
                // Restore href from data-original-href
                const originalHref = span.getAttribute('data-original-href');
                if (originalHref) {
                    anchor.setAttribute('href', originalHref);
                    anchor.removeAttribute('data-original-href');
                }
                // Copy inner HTML
                anchor.innerHTML = span.innerHTML;
                // Replace in DOM
                span.parentNode.replaceChild(anchor, span);
            });
            
            // Remove visual builder attributes before saving
            const elements = doc.querySelectorAll('[data-visual-id]');
            elements.forEach(el => el.removeAttribute('data-visual-id'));
            
            const editableElements = doc.querySelectorAll('[contenteditable]');
            editableElements.forEach(el => el.removeAttribute('contenteditable'));
            
            // Remove selected class
            doc.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
            
            // Remove visual builder styles
            const styleEl = doc.getElementById('visual-builder-styles');
            if (styleEl) styleEl.remove();
            
            form.content = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
            hasUnsavedChanges = true;
        }
    }

    // Initialize visual editing in iframe
    function initVisualEditing() {
        if (!previewFrame || !previewFrame.contentDocument) return;
        
        const doc = previewFrame.contentDocument;
        let idCounter = 0;

        // Replace ALL anchor tags with spans to prevent any clickable behavior
        const allLinks = doc.querySelectorAll('a');
        allLinks.forEach(link => {
            const span = doc.createElement('span');
            // Copy all attributes
            Array.from(link.attributes).forEach(attr => {
                span.setAttribute(attr.name, attr.value);
            });
            // Store original href
            if (link.hasAttribute('href')) {
                span.setAttribute('data-original-href', link.getAttribute('href'));
            }
            // Mark as converted link
            span.setAttribute('data-was-link', 'true');
            // Copy inner HTML
            span.innerHTML = link.innerHTML;
            // Copy computed styles for display
            span.style.cssText = link.style.cssText;
            span.style.cursor = 'pointer';
            // Replace in DOM
            link.parentNode.replaceChild(span, link);
        });

        // Disable form submissions
        const allForms = doc.querySelectorAll('form');
        allForms.forEach(formEl => {
            formEl.onsubmit = (e) => { e.preventDefault(); return false; };
            formEl.setAttribute('action', 'javascript:void(0)');
        });

        // Disable buttons - change type to prevent form submit
        const allButtons = doc.querySelectorAll('button[type="submit"], input[type="submit"]');
        allButtons.forEach(btn => {
            if (btn.tagName === 'BUTTON') btn.type = 'button';
        });

        // Intercept window.location changes
        try {
            Object.defineProperty(previewFrame.contentWindow, 'location', {
                get: () => previewFrame.contentWindow.document.location,
                set: () => { return false; }
            });
        } catch(e) {}

        // Block navigation via base tag
        const baseTag = doc.querySelector('base');
        if (baseTag) baseTag.remove();

        // Add visual IDs to all editable elements
        const textElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, li, td, th, label, button, div');
        textElements.forEach(el => {
            // Only add to leaf elements or elements with direct text
            const hasDirectText = Array.from(el.childNodes).some(node => 
                node.nodeType === Node.TEXT_NODE && node.textContent.trim()
            );
            if (el.children.length === 0 || hasDirectText) {
                el.setAttribute('data-visual-id', `text-${idCounter++}`);
            }
        });

        // Add visual IDs to images
        const images = doc.querySelectorAll('img');
        images.forEach(img => {
            img.setAttribute('data-visual-id', `img-${idCounter++}`);
        });

        // Add click handlers with capture phase
        doc.addEventListener('click', handleElementClick, true);
        
        // Add styles for visual editing
        const style = doc.createElement('style');
        style.id = 'visual-builder-styles';
        style.textContent = `
            * {
                cursor: default !important;
            }
            [data-visual-id] {
                cursor: pointer !important;
                transition: outline 0.15s ease;
            }
            [data-visual-id]:hover {
                outline: 2px dashed #3b82f6 !important;
                outline-offset: 2px !important;
            }
            [data-visual-id].selected {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px !important;
                background-color: rgba(59, 130, 246, 0.05) !important;
            }
            [contenteditable="true"] {
                outline: 2px solid #10b981 !important;
                outline-offset: 2px !important;
                background-color: rgba(16, 185, 129, 0.05) !important;
                min-height: 1em;
                cursor: text !important;
            }
            [contenteditable="true"]:focus {
                outline: 2px solid #10b981 !important;
            }
            img[data-visual-id]:hover {
                outline: 2px dashed #f59e0b !important;
            }
            img[data-visual-id].selected {
                outline: 2px solid #f59e0b !important;
            }
        `;
        doc.head.appendChild(style);
    }

    // Handle click on element in iframe
    function handleElementClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target;
        const visualId = target.getAttribute('data-visual-id');
        
        if (!visualId) return;

        // Clear previous selection
        const doc = previewFrame.contentDocument;
        doc.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        doc.querySelectorAll('[contenteditable]').forEach(el => {
            el.removeAttribute('contenteditable');
            el.blur();
        });

        target.classList.add('selected');
        selectedElement = visualId;

        // Check if it's an image
        if (target.tagName === 'IMG') {
            currentImageElement = visualId;
            showImagePicker = true;
            loadAssets();
        } else if (target.getAttribute('data-was-link') === 'true') {
            // Open link editor modal for converted anchor tags (now spans)
            currentLinkElement = visualId;
            linkForm.href = target.getAttribute('data-original-href') || '';
            linkForm.text = target.innerText || '';
            showLinkEditor = true;
        } else {
            // Make text editable
            target.setAttribute('contenteditable', 'true');
            target.focus();
            editingText = true;

            // Listen for changes
            target.addEventListener('blur', () => {
                // Just mark as changed, don't update content yet (would cause reload)
                hasUnsavedChanges = true;
                editingText = false;
                target.classList.remove('selected');
            }, { once: true });

            target.addEventListener('input', () => {
                hasUnsavedChanges = true;
            });
        }
    }

    // Save link changes
    function saveLinkChanges() {
        if (currentLinkElement && previewFrame) {
            const doc = previewFrame.contentDocument;
            const link = doc.querySelector(`[data-visual-id="${currentLinkElement}"]`);
            if (link) {
                link.setAttribute('data-original-href', linkForm.href);
                link.innerText = linkForm.text;
                // Mark as changed without full content update
                hasUnsavedChanges = true;
            }
        }
        showLinkEditor = false;
        currentLinkElement = null;
    }

    // Handle iframe load
    function handleFrameLoad() {
        setTimeout(() => {
            initVisualEditing();
        }, 100);
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    });
</script>

<svelte:head>
    <title>Visual Builder: {post.title} - SlugPost</title>
</svelte:head>

<div class="h-screen flex flex-col bg-slate-100 overflow-hidden">
    <!-- Top Toolbar -->
    <header class="flex-shrink-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
        <!-- Left: Logo & Title -->
        <div class="flex items-center space-x-4">
            <a href="/home" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img src="/public/android-icon-48x48.png" alt="SlugPost" class="w-8 h-8">
                <span class="font-bold text-lg text-slate-900 hidden sm:inline">SlugPost</span>
            </a>
            <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div class="hidden sm:block">
                <h1 class="text-sm font-semibold text-slate-900 truncate max-w-[200px]">{post.title}</h1>
                <div class="flex items-center space-x-2 text-xs text-slate-500">
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium">
                        Visual Builder
                    </span>
                    {#if hasUnsavedChanges}
                        <span class="text-orange-500">• Unsaved</span>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Center: Help Text -->
        <div class="hidden md:flex items-center space-x-2 text-sm text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
            </svg>
            <span>Click any text or image to edit</span>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center space-x-2">
            <a 
                href="/{post.slug}/edit/{edit_token}"
                class="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Switch to Code Editor"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <span class="hidden sm:inline">Code</span>
            </a>

            <a 
                href="/{post.slug}/settings/{edit_token}"
                class="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Post Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                <span class="hidden sm:inline">Settings</span>
            </a>
            
            <a 
                href="/{post.slug}" 
                target="_blank"
                class="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span class="hidden sm:inline">Preview</span>
            </a>

            <button
                on:click={submitForm}
                disabled={isSaving || !hasUnsavedChanges}
                class="flex items-center space-x-1.5 px-4 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
        </div>
    </header>

    <!-- Main Content - Preview Frame -->
    <main class="flex-1 overflow-hidden bg-slate-200 p-4">
        <div class="h-full bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
                bind:this={previewFrame}
                srcdoc={form.content}
                on:load={handleFrameLoad}
                class="w-full h-full border-0"
                title="Visual Editor"
            ></iframe>
        </div>
    </main>

    <!-- Bottom Status Bar -->
    <footer class="flex-shrink-0 h-10 bg-white border-t border-slate-200 flex items-center justify-between px-4 text-xs text-slate-500">
        <div class="flex items-center space-x-4">
            <span class="flex items-center space-x-1">
                <kbd class="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border border-slate-200">⌘S</kbd>
                <span>Save</span>
            </span>
            <span class="flex items-center space-x-1">
                <kbd class="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border border-slate-200">Esc</kbd>
                <span>Deselect</span>
            </span>
        </div>
        <div>
            Last saved: {formatDate(lastSaved)}
        </div>
    </footer>
</div>

<!-- Image Picker Modal -->
{#if showImagePicker}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div>
                    <h3 class="text-lg font-semibold text-slate-900">Select Image</h3>
                    <p class="text-sm text-slate-500">Choose from your library or upload a new image</p>
                </div>
                <button 
                    on:click={() => { showImagePicker = false; currentImageElement = null; }}
                    class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                    </svg>
                </button>
            </div>

            <!-- Upload Section -->
            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <label class="relative cursor-pointer block">
                    <div class="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors {isUploadingImage ? 'opacity-50 pointer-events-none' : ''}">
                        {#if isUploadingImage}
                            <div class="flex items-center space-x-2">
                                <svg class="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span class="text-sm text-slate-600">Uploading...</span>
                            </div>
                        {:else}
                            <div class="flex items-center space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" x2="12" y1="3" y2="15"/>
                                </svg>
                                <div class="text-left">
                                    <span class="text-sm font-medium text-primary-600">Upload new image</span>
                                    <p class="text-xs text-slate-500">PNG, JPG, WebP up to 5MB</p>
                                </div>
                            </div>
                        {/if}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        on:change={uploadImage}
                        class="hidden"
                        disabled={isUploadingImage}
                    />
                </label>
            </div>

            <!-- Image Library -->
            <div class="px-6 py-4 overflow-y-auto max-h-[40vh]">
                <h4 class="text-sm font-medium text-slate-700 mb-3">Your Images</h4>
                {#if userAssets.length > 0}
                    <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {#each userAssets as asset}
                            <button
                                on:click={() => selectImage(asset.url)}
                                class="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500 transition-colors focus:outline-none focus:border-primary-500"
                            >
                                <img 
                                    src={asset.url} 
                                    alt={asset.name || 'Asset'} 
                                    class="w-full h-full object-cover"
                                />
                            </button>
                        {/each}
                    </div>
                {:else}
                    <div class="text-center py-8 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2 text-slate-300">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                        <p class="text-sm">No images yet</p>
                        <p class="text-xs text-slate-400">Upload your first image above</p>
                    </div>
                {/if}
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                    on:click={() => { showImagePicker = false; currentImageElement = null; }}
                    class="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Link Editor Modal -->
{#if showLinkEditor}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div>
                    <h3 class="text-lg font-semibold text-slate-900">Edit Link</h3>
                    <p class="text-sm text-slate-500">Change the link destination and text</p>
                </div>
                <button 
                    on:click={() => { showLinkEditor = false; currentLinkElement = null; }}
                    class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                    </svg>
                </button>
            </div>

            <!-- Form -->
            <div class="px-6 py-5 space-y-4">
                <div>
                    <label for="link-text" class="block text-sm font-medium text-slate-700 mb-1.5">Link Text</label>
                    <input
                        id="link-text"
                        type="text"
                        bind:value={linkForm.text}
                        placeholder="Click here"
                        class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                    <p class="text-xs text-slate-500 mt-1">The text that users will see</p>
                </div>
                <div>
                    <label for="link-href" class="block text-sm font-medium text-slate-700 mb-1.5">Link URL</label>
                    <input
                        id="link-href"
                        type="text"
                        bind:value={linkForm.href}
                        placeholder="https://example.com"
                        class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-mono"
                    />
                    <p class="text-xs text-slate-500 mt-1">Where the link will go when clicked</p>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
                <button
                    on:click={() => { showLinkEditor = false; currentLinkElement = null; }}
                    class="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    on:click={saveLinkChanges}
                    class="px-4 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </div>
    </div>
{/if}
