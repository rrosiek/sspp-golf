<script lang="ts">
  import { type InferType, ValidationError } from "yup";
  import type { TypedSchema } from "yup/lib/util/types";

  import type { AnyObject } from "$lib/types";
  import Notification from "$lib/components/Notification.svelte";

  export let asyncSubmit: Function;
  export let validate: (formData: AnyObject) => Promise<InferType<TypedSchema>>;

  let errors: Record<string, string> = {};
  let inError = false;
  let loading = false;

  const handleSubmit = async (event: SubmitEvent) => {
    const formEl = event.currentTarget as HTMLFormElement;

    errors = {};
    inError = false;
    loading = true;

    const formData = buildFormData(formEl.elements);

    try {
      const schema: InferType<TypedSchema> = await validate(formData);
      await asyncSubmit(schema);
    } catch (err) {
      console.log(err);
      if (err instanceof ValidationError) {
        inError = true;

        errors = err.inner.reduce(
          (errors, e) => ({ ...errors, [e.path as string]: e.message }),
          {}
        );
      }
    } finally {
      loading = false;
    }
  };

  const buildFormData = (elements: HTMLFormControlsCollection): AnyObject => {
    const data: AnyObject = {};

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLInputElement;

      if (el.type === "file") {
        data[el.name] = el.files;
      } else {
        data[el.name] = el.value;
      }
    }

    return data;
  };
</script>

<form on:submit|preventDefault={handleSubmit}>
  <slot {errors} {loading} />
  {#if inError}
    <Notification on:close={() => (inError = false)} failure>
      <slot name="errorMsg">There was a problem submitting the form.</slot>
    </Notification>
  {/if}
</form>
