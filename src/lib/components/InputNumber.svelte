<script lang="ts">
  export let disabled = false;
  export let error = "";
  export let label = "";
  export let maxlength = 255;
  export let name = "";
  export let value = "";
</script>

<div class="mb-2 rounded-sm shadow-sm">
  <input
    bind:value
    id={name}
    {name}
    {disabled}
    {maxlength}
    type="number"
    class="text-gray-800 form-input px-2 py-3 block w-full border rounded-sm text-lg focus:border-mr-gold transition duration-150 ease-in-out"
  />
</div>
<label
  for={name}
  class="block ml-2 text-white text-lg opacity-75 leading-5 uppercase"
>
  {label}
</label>
<div class="ml-2 text-red-500 text-sm {error ? 'block' : 'hidden'}">
  {error}
</div>
