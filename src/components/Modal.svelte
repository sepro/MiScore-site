<script>
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    
    export let isVisible = false;
    export let imgSrc = '';
    export let onClose;

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
      <button 
        class="close" 
        on:click={onClose}
        aria-label="Close modal"
        type="button"
      >
        &times;
      </button>
      <div class="screenshot-wrapper">
        <img src={imgSrc} alt="Screenshot" class="screenshot" />
      </div>
    </div>
  </div>
  {/if}
  
  <style>
    .modal {
      /* Force positioning relative to viewport */
      position: fixed;
      inset: 0; /* Shorthand for top: 0, right: 0, bottom: 0, left: 0 */
      z-index: 10000;
      
      /* Full viewport coverage */
      width: 100vw;
      height: 100vh;
      
      /* Center the content */
      display: flex;
      justify-content: center;
      align-items: center;
      
      /* Styling */
      background-color: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(4px);
      
      /* Prevent scrolling issues */
      overflow: auto;
      
      /* Animation */
      animation: modalFadeIn 0.2s ease-out;
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .modal-content {
      background: var(--surface);
      padding: var(--spacing-xl);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border);
      max-width: min(95vw, 1200px);
      max-height: 90vh;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: auto;
      animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .close {
      position: absolute;
      top: var(--spacing-md);
      right: var(--spacing-md);
      color: var(--text-secondary);
      font-size: 2rem;
      font-weight: bold;
      cursor: pointer;
      z-index: 10;
      background: var(--surface-light);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      border: 1px solid var(--border);
    }

    .close:hover,
    .close:focus {
      color: var(--text-primary);
      background: var(--primary-color);
      transform: scale(1.1);
      box-shadow: var(--shadow-glow);
    }

    .screenshot-wrapper {
      display: flex;
      justify-content: center;
    }

    .screenshot {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .modal-content {
        width: 100%;
        height: 100%;
        max-height: 100vh;
        border-radius: 0;
        padding: var(--spacing-lg);
      }

      .close {
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        font-size: 1.5rem;
        width: 36px;
        height: 36px;
      }
    }
  </style>
  