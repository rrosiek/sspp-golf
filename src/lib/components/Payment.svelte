<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import type { InferType } from "yup";
  import { saveTicketPurchase } from "$lib/firebase";
  import Form from "$lib/components/Form.svelte";
  import InputEmail from "$lib/components/InputEmail.svelte";
  import InputNumber from "$lib/components/InputNumber.svelte";
  import InputPhone from "$lib/components/InputPhone.svelte";
  import InputText from "$lib/components/InputText.svelte";
  import { schema } from "./_TicketFormSchema";
  import states from "$lib/states";
  import type { AnyObject } from "$lib/types";

  const squareAppId: string = import.meta.env.VITE_SQUARE_APP_ID;
  const squareLocationId: string = import.meta.env.VITE_SQUARE_LOCATION_ID;
  const golfTicketCost = 15000;
  const dinnerTicketCost = 5000;
  const foursomeDiscount = 10000;

  const cardStyle = {
    ".input-container": {
      borderColor: "#2D2D2D",
      borderRadius: "2px",
    },
    ".input-container.is-focus": {
      borderColor: "#c39b2d",
    },
    ".input-container.is-error": {
      borderColor: "#ff1600",
    },
    ".message-text": {
      color: "#dadada",
    },
    ".message-icon": {
      color: "#dadada",
    },
    ".message-text.is-error": {
      color: "#ff1600",
    },
    ".message-icon.is-error": {
      color: "#ff1600",
    },
    input: {
      fontFamily: "futura, helvetica neue, sans-serif",
    },
    "input::placeholder": {
      color: "#999999",
    },
    "input.is-error": {
      color: "#ff1600",
    },
  };

  let card: { [key: string]: any } | null = null;
  let cardError = false;
  let ccDonate = false;
  let loading = false;
  let golfers = [0];
  let dinnerCount = 0;

  $: golferCount = golfers.length;

  $: ticketCostTotal =
    golferCount * golfTicketCost +
    dinnerCount * dinnerTicketCost +
    (ccDonate ? 200 : 0) -
    (golferCount === 4 ? foursomeDiscount : 0);

  const validate = async (
    data: AnyObject
  ): Promise<InferType<typeof schema>> => {
    return await schema.validate(data, { abortEarly: false });
  };

  const dispatch = createEventDispatcher();

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  const initPayment = async () => {
    const payments = (window as any).Square.payments(
      squareAppId,
      squareLocationId
    );

    card = await payments.card({ style: cardStyle });
    await card!.attach("#sq-card");
  };

  const tokenize = async (paymentMethod: { [key: string]: any }) => {
    const tokenResult = await paymentMethod.tokenize();

    if (tokenResult.status === "OK") {
      return tokenResult.token;
    } else {
      let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;

      if (tokenResult.errors) {
        errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
      }

      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (payload: AnyObject) => {
    loading = true;

    const token = await tokenize(card!);
    const golfers = [...Array(golferCount)].map((_empty, i) => ({
      golferName: payload[`golferName${i + 1}`],
      golferContact: payload[`golferContact${i + 1}`],
    }));

    await saveTicketPurchase({
      golfers,
      extraDinners: +dinnerCount,
      name: payload.name,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      zipCode: payload.zipCode,
      email: payload.email,
      phone: payload.phone,
      ccDonate,
      squarePurchase: { sourceId: token, locationId: squareLocationId },
    });

    dispatch("paymentComplete", payload);
    loading = false;
  };

  const handleGolferIncrease = () => {
    if (golferCount < 4) golfers = Array(golferCount + 1);
  };

  const handleGolferDecrease = () => {
    if (golferCount > 1) golfers = Array(golferCount - 1);
  };

  const handleDinnerIncrease = () => {
    if (dinnerCount < 10) dinnerCount = dinnerCount + 1;
  };

  const handleDinnerDecrease = () => {
    if (dinnerCount > 0) dinnerCount = dinnerCount - 1;
  };

  onMount(async () => {
    if (!(window as any).Square) {
      throw new Error("Square.js failed to load properly");
    }

    await initPayment();
  });
</script>

<section class="bg-mr-green text-gray-100">
  <div class="flex max-w-6xl mx-auto py-6 px-4 lg:py-8 xl:w-2/3">
    <picture class="p-4 grow-0 hidden md:block">
      <source srcset="/18mile_golf.webp 1x" type="image/webp" />
      <source srcset="/18mile_golf.png 1x" type="image/png" />
      <img
        src="/18mile_golf.png"
        alt="18 Mile Golf Course"
        title="18 Mile Golf Logo"
      />
    </picture>

    <div class="grow shrink-1 md:shrink-0">
      <Form asyncSubmit={handleSubmit} {validate} let:errors>
        <div class="max-w-xl mx-auto">
          <div
            class="mb-4 font-display font-bold tracking-wide text-4xl text-center text-mr-gold uppercase"
          >
            Are you ready to play?
          </div>
          <p class="mb-4 text-center">
            Dinner will be held at the Hamburg Brewing Company.
          </p>
          <div class="max-w-xl mx-auto">
            {#each golfers as _golfer, i}
              <div class="my-4">
                <InputText
                  name={`golferName${i + 1}`}
                  label={`Golfer ${i + 1} Name`}
                />
              </div>
              <div class="my-4">
                <InputText
                  name={`golferContact${i + 1}`}
                  label={`Golfer ${i + 1} Email / Phone`}
                />
              </div>
              {#if i > 0}
                <button
                  on:click={handleGolferDecrease}
                  type="button"
                  class="inline-flex items-center justify-center w-full -mt-2 mb-4 px-4 py-2 shadow uppercase bg-mr-gold hover:bg-yellow-500 focus:outline-none focus:border-yellow-600 focus:shadow-outline-red active:bg-yellow-700"
                >
                  Remove Golfer #{i + 1}
                </button>
              {/if}
            {/each}

            {#if golferCount < 4}
              <button
                on:click={handleGolferIncrease}
                type="button"
                class="inline-flex items-center justify-center w-full my-6 px-4 py-3 shadow font-display text-2xl font-semibold uppercase tracking-wider bg-mr-gold hover:bg-yellow-500 focus:outline-none focus:border-yellow-600 focus:shadow-outline-red active:bg-yellow-700 transition ease-in-out duration-150"
              >
                <div>Add Golfer</div>
              </button>
            {/if}

            <div class="flex items-start my-6">
              <button
                on:click={handleDinnerDecrease}
                class="inline-flex justify-center items-center py-3 px-8 bg-mr-gold hover:bg-yellow-500 focus:outline-none focus:border-yellow-700 focus:shadow-outline-indigo active:bg-yellow-700 transition ease-in-out duration-150 rounded-md shadow-md"
                type="button"
              >
                <svg
                  class="w-8 h-8 text-gray-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <div class="flex-1 mx-4 sm:mx-6">
                <div class="mb-2 rounded-sm shadow-sm">
                  <input
                    bind:value={dinnerCount}
                    id="dinnerTicketsPurchased"
                    name="dinnerTicketsPurchased"
                    class="text-center text-3xl text-gray-800 form-input px-2 py-3 block w-full border rounded-sm focus:border-mr-gold transition duration-150 ease-in-out sm:leading-5"
                    type="number"
                    min="0"
                    max="10"
                  />
                </div>
                <label
                  for="dinnerTicketsPurchased"
                  class="block ml-2 text-lg text-center opacity-75 leading-5 uppercase"
                >
                  Extra Dinner Tickets (21+)
                </label>
                <div
                  class="ml-2 text-red-500 text-sm {errors.dinnerTicketsPurchased
                    ? 'block'
                    : 'hidden'}"
                >
                  Please enter a valid number.
                </div>
              </div>
              <button
                on:click={handleDinnerIncrease}
                class="flex-shrink inline-flex justify-center items-center py-3 px-8 bg-mr-gold hover:bg-yellow-500 focus:outline-none focus:border-yellow-700 focus:shadow-outline-green active:bg-yellow-700 transition ease-in-out duration-150 rounded-md shadow-md"
                type="button"
              >
                <svg
                  class="w-8 h-8 text-gray-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
          </div>
          <h3 class="text-white text-2xl opacity-75 leading-5 uppercase">
            Billing
          </h3>
          <div class="my-4">
            <InputText
              name="name"
              label="Name"
              error={errors.name ? "Name is required." : ""}
            />
          </div>
          <div class="my-4">
            <InputText
              name="address"
              label="Mailing Street Address"
              error={errors.address ? "Address is required." : ""}
            />
          </div>
          <div class="my-4 grid grid-cols-6 gap-4">
            <div class="col-span-6 sm:col-span-3">
              <InputText
                name="city"
                label="City"
                error={errors.city ? "Your city is required." : ""}
              />
            </div>
            <div class="col-span-3 sm:col-span-2">
              <div class="mb-2 rounded-sm shadow-sm">
                <select
                  id="state"
                  name="state"
                  class="text-gray-800 form-select px-2 py-3 block w-full border rounded-sm text-lg focus:border-mr-gold transition duration-150 ease-in-out"
                >
                  {#each states as { label, value }}
                    <option {value} selected={value === "NY"}>
                      {label.toUpperCase()}
                    </option>
                  {/each}
                </select>
              </div>
              <label
                for="state"
                class="block ml-2 text-white text-lg opacity-75 leading-5 uppercase"
              >
                State
              </label>
              <div
                class="ml-2 text-red-500 text-sm {errors.state
                  ? 'block'
                  : 'hidden'}"
              >
                State is required.
              </div>
            </div>
            <div class="col-span-3 sm:col-span-1">
              <InputNumber
                name="zipCode"
                label="Zip Code"
                error={errors.zipCode ? "Zip code is required." : ""}
                maxlength={5}
              />
            </div>
          </div>
          <div class="my-4 grid grid-cols-2 gap-4">
            <div class="col-span-2 sm:col-span-1">
              <InputEmail
                name="email"
                label="E-Mail Address"
                error={errors.email ? "Valid e-mail address is required." : ""}
              />
            </div>
            <div class="col-span-2 sm:col-span-1">
              <InputPhone
                name="phone"
                label="Phone Number"
                placeholder=""
                error={errors.phone ? "Valid phone number required." : ""}
              />
            </div>
          </div>
          <div class="flex justify-between items-center mt-8 mb-2 sm:mb-4">
            <div class="text-sm text-white opacity-75">
              Processing by
              <a
                href="https://squareup.com"
                target="_blank"
                class="text-mr-gold hover:text-yellow-500">Square</a
              >
            </div>
          </div>
          <div id="sq-card" />
          <div class="text-red-500 text-sm {cardError ? 'block' : 'hidden'}">
            There was a problem processing your card, please try again.
          </div>
          <div class="flex items-center my-6">
            <input
              bind:checked={ccDonate}
              id="ccDonate"
              name="ccDonate"
              type="checkbox"
              class="form-checkbox h-6 w-6 text-mr-gold transition duration-150 ease-in-out"
            />
            <label
              for="donate"
              class="ml-2 block text-sm sm:text-lg text-white opacity-75"
            >
              Donate
              <span class="font-bold">$2.00</span>
              to help cover credit card processing charges.
            </label>
          </div>
        </div>

        <div class="max-w-lg mx-auto px-2">
          {#if !loading}
            <button
              type="submit"
              class="inline-flex items-center justify-center w-full my-6 px-4 py-3 shadow font-display text-2xl font-semibold uppercase tracking-wider bg-mr-gold hover:bg-yellow-500 focus:outline-none focus:border-yellow-600 focus:shadow-outline-red active:bg-yellow-700 transition ease-in-out duration-150"
            >
              <div>Pay {moneyFormatter.format(ticketCostTotal / 100)}</div>
            </button>
          {:else}
            <div
              class="inline-flex items-center justify-center w-full my-6 px-4 py-3.5 shadow font-display text-2xl font-semibold bg-mr-gold hover:bg-yellow-600 uppercase tracking-wider focus:outline-none focus:border-yellow-700 focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150"
            >
              <svg class="animate-spin h-8 w-8" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          {/if}
        </div>
      </Form>
    </div>

    <picture class="p-4 grow-0 hidden md:block">
      <source srcset="/hamburg_brewing.webp 1x" type="image/webp" />
      <source srcset="/hamburg_brewing.png 1x" type="image/png" />
      <img
        src="/hamburg_brewing.png"
        alt="Hamburg Brewing Company"
        title="Hamburg Brewing Logo"
      />
    </picture>
  </div>
</section>
