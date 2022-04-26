<script lang="ts">
  import { fly } from "svelte/transition";
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  export let title = "";
  export let success = false;
  export let failure = false;

  onMount(() => {
    setTimeout(() => {
      dispatch("close");
    }, 5000);
  });
</script>

<div
  class="fixed inset-0 flex items-end justify-center px-4 py-6
      pointer-events-none sm:p-6 sm:items-start sm:justify-end z-20"
  transition:fly={{ x: 80, duration: 500 }}
>
  <div
    class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto"
  >
    <div class="rounded-lg shadow-xs overflow-hidden">
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            {#if success}
              <svg
                class="h-6 w-6 text-green-400"
                fill="currentColor"
                viewBox="0 0 512 512"
                stroke="none"
              >
                <path
                  d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224
                      224-100.3 224-224S379.7 32 256 32zm114.9 149.1L231.8
                      359.6c-1.1 1.1-2.9 3.5-5.1 3.5-2.3
                      0-3.8-1.6-5.1-2.9-1.3-1.3-78.9-75.9-78.9-75.9l-1.5-1.5c-.6-.9-1.1-2-1.1-3.2
                      0-1.2.5-2.3 1.1-3.2.4-.4.7-.7 1.1-1.2 7.7-8.1 23.3-24.5
                      24.3-25.5 1.3-1.3 2.4-3 4.8-3 2.5 0 4.1 2.1 5.3 3.3 1.2 1.2 45
                      43.3 45 43.3l111.3-143c1-.8 2.2-1.4 3.5-1.4 1.3 0 2.5.5 3.5
                      1.3l30.6 24.1c.8 1 1.3 2.2 1.3 3.5.1 1.3-.4 2.4-1 3.3z"
                />
              </svg>
            {:else if failure}
              <svg
                class="h-6 w-6 text-red-400"
                fill="currentColor"
                viewBox="0 0 512 512"
                stroke="none"
              >
                <path
                  d="M256 48C141.6 48 48 141.601 48 256s93.6 208 208 208
                      208-93.601 208-208S370.4 48 256 48zm24
                      312h-48v-40h48v40zm0-88h-48V144h48v128z"
                />
              </svg>
            {:else}
              <svg
                class="h-6 w-6 text-blue-400"
                fill="currentColor"
                viewBox="0 0 512 512"
                stroke="none"
              >
                <path
                  d="M480 253C478.3 129.3 376.7 30.4 253 32S30.4 135.3 32
                      259c1.7 123.7 103.3 222.6 227 221 123.7-1.7 222.7-103.3
                      221-227zM256 111.9c17.7 0 32 14.3 32 32s-14.3 32-32
                      32-32-14.3-32-32 14.3-32 32-32zM300
                      395h-88v-11h22V224h-22v-12h66v172h22v11z"
                />
              </svg>
            {/if}
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            {#if title}
              <p class="mb-1 text-sm leading-5 font-semibold text-gray-900">
                {title}
              </p>
            {/if}
            <p class="text-sm leading-5 text-gray-700">
              <slot />
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              on:click={() => dispatch("close")}
              type="button"
              class="inline-flex text-gray-400 focus:outline-none
                  focus:text-gray-500 transition ease-in-out duration-150"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0
                      111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10
                      11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293
                      5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
