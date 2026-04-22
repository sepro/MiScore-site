<script>
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    
    export let isVisible = false;
    export let imgSrc = '';
    export let onClose;
    export let meta = []; // Array of { label, value } pairs rendered below the image.

    let modalElement;
    let portal;

    // Create portal container that will be appended to body
    onMount(() => {
        portal = document.createElement('div');
        portal.style.position = 'fixed';
        portal.style.top = '0';
        portal.style.left = '0';
        portal.style.zIndex = '9999';
        document.body.appendChild(portal);
    });

    onDestroy(() => {
        // Clean up portal when component is destroyed
        if (portal && portal.parentNode) {
            portal.parentNode.removeChild(portal);
        }
    });

    // Move modal to portal when it becomes visible
    afterUpdate(() => {
        if (isVisible && modalElement && portal && modalElement.parentNode !== portal) {
            portal.appendChild(modalElement);
        } else if (!isVisible && modalElement && modalElement.parentNode === portal) {
            // Move it back to the original location when hidden
            portal.removeChild(modalElement);
        }
    });

    // Handle ESC key to close modal
    function handleKeydown(event) {
        if (event.key === 'Escape' && isVisible) {
            onClose();
        }
    }

    // Handle backdrop click to close modal
    function handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }

    // Handle backdrop keydown for accessibility
    function handleBackdropKeydown(event) {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            onClose();
        }
    }
  </script>
  
  <svelte:window on:keydown={handleKeydown} />
  
  {#if isVisible}
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="modal"
    bind:this={modalElement}
    on:click={handleBackdropClick}
    on:keydown={handleBackdropKeydown}
    role="dialog"
    aria-modal="true"
    aria-label="Screenshot viewer"
    tabindex="0"
  >
    <div class="modal-content">
      <div class="modal-top">
        <span class="modal-ttl">◆ SCREENSHOT VIEWER</span>
        <button
          class="close"
          on:click={onClose}
          aria-label="Close modal"
          type="button"
        >✕</button>
      </div>
      <div class="screenshot-wrapper">
        <img src={imgSrc} alt="Screenshot" class="screenshot" />
      </div>
      {#if meta && meta.length > 0}
        <div class="modal-meta-row">
          {#each meta as item}
            <div class="modal-meta-item">
              <span class="modal-meta-lbl">{item.label}</span>
              <span class="modal-meta-val">{item.value || '—'}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  {/if}
  
  <style>
    .modal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(5px);
      overflow: auto;
      padding: 24px;
      animation: modalFadeIn 0.18s ease both;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .modal-content {
      background: var(--surface);
      border: 1px solid var(--border-hi);
      border-radius: 2px;
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      box-shadow: 0 0 50px rgba(0, 255, 136, 0.12);
      position: relative;
      overflow: auto;
      animation: modalSlideIn 0.2s ease both;
    }

    @keyframes modalSlideIn {
      from { transform: translateY(12px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }

    .modal-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 13px 20px;
      border-bottom: 1px solid var(--border);
      background: rgba(0, 255, 136, 0.05);
    }

    .modal-ttl {
      font-family: var(--font-px);
      font-size: 9px;
      color: var(--neon);
      letter-spacing: 2px;
    }

    .close {
      background: none;
      border: 1px solid var(--border-hi);
      color: var(--muted);
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
      font-family: var(--font-mo);
      transition: all 0.15s;
      padding: 0;
    }

    .close:hover,
    .close:focus {
      border-color: var(--neon);
      color: var(--neon);
      text-shadow: 0 0 6px var(--neon);
      outline: none;
    }

    .screenshot-wrapper {
      display: flex;
      justify-content: center;
      padding: 0;
      background: #040408;
    }

    .screenshot {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
    }

    .modal-meta-row {
      display: flex;
      border-top: 1px solid var(--border);
    }
    .modal-meta-item {
      flex: 1;
      padding: 13px 18px;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .modal-meta-item:last-child { border-right: none; }
    .modal-meta-lbl {
      font-family: var(--font-px);
      font-size: 7px;
      color: var(--muted);
      letter-spacing: 2px;
    }
    .modal-meta-val {
      font-family: var(--font-mo);
      font-size: 13px;
      color: var(--text);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 600px) {
      .modal { padding: 12px; }
      .modal-top { padding: 10px 14px; }
      .modal-ttl { font-size: 8px; }
      .modal-meta-row { flex-wrap: wrap; }
      .modal-meta-item {
        flex: 1 1 50%;
        border-right: none;
        border-bottom: 1px solid var(--border);
      }
      .modal-meta-item:nth-child(odd) { border-right: 1px solid var(--border); }
      .modal-meta-item:nth-last-child(-n+2) { border-bottom: none; }
    }
  </style>
  