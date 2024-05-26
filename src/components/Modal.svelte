<script>
    export let isVisible = false;
    export let imgSrc = '';
    export let onClose;
  </script>
  
  {#if isVisible}
  <div class="modal">
    <div class="modal-content">
      <span class="close" on:click={onClose} on:keydown={onClose}>&times;</span>
      <img src={imgSrc} alt="Screenshot">
    </div>
  </div>
  {/if}
  
  <style>
        .modal {
        position: fixed; /* Stay in place */
        z-index: 1000; /* Sit on top */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
        display: flex;
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
        }

        .modal-content {
        background-color: #fefefe;
        margin: auto;
        padding: 20px;
        border: 1px solid #888;
        width: 90%; /* Could be more or less, depending on screen size */
        max-width: 1000px; /* Maximum width */
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
        }

        .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        }

        .close:hover,
        .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
        }

        /* Style for the image to make it responsive */
        .modal-content img {
        width: max-content;
        max-width: 100%;
        height: auto;
        }

  </style>
  