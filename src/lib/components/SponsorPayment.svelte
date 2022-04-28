<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import type { InferType } from "yup";
  import { saveSponsorPurchase } from "$lib/firebase";
  import Form from "$lib/components/Form.svelte";
  import InputEmail from "$lib/components/InputEmail.svelte";
  import InputNumber from "$lib/components/InputNumber.svelte";
  import InputPhone from "$lib/components/InputPhone.svelte";
  import InputText from "$lib/components/InputText.svelte";
  import { schema } from "./_SponsorFormSchema";
  import states from "$lib/states";
  import type { AnyObject, Sponsorship } from "$lib/types";

  const squareAppId: string = import.meta.env.VITE_SQUARE_APP_ID;
  const squareLocationId: string = import.meta.env.VITE_SQUARE_LOCATION_ID;
  const sponsorOptions: Sponsorship[] = [
    { id: "sponsor_memory", name: "In Memory", price: 5000 },
    { id: "sponsor_hole", name: "Hole Sponsor", price: 15000 },
    { id: "sponsor_birdie", name: "Birdie Sponsor", price: 50000 },
    { id: "sponsor_eagle", name: "Eagle Sponsor", price: 75000 },
    { id: "sponsor_ace", name: "Ace Sponsor", price: 150000 },
    { id: "sponsor_presenting", name: "Presenting Sponsor", price: 250000 },
  ];

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
  let loading = false;
  let sponsorSelected = "sponsor_memory";

  $: sponsorCostTotal = sponsorOptions.find(
    (opt) => opt.id === sponsorSelected
  )?.price;

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
    const sponsor: Sponsorship | undefined = sponsorOptions.find(
      (sponsor) => sponsor.id === sponsorSelected
    );

    await saveSponsorPurchase({
      sponsorId: sponsor!.id,
      sponsorName: sponsor!.name,
      sponsorPrice: +sponsor!.price,
      name: payload.name,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      zipCode: payload.zipCode,
      email: payload.email,
      phone: payload.phone,
      squarePurchase: { sourceId: token, locationId: squareLocationId },
    });

    dispatch("paymentComplete", payload);
    loading = false;
  };

  onMount(async () => {
    if (!(window as any).Square) {
      throw new Error("Square.js failed to load properly");
    }

    await initPayment();
  });
</script>

<section class="bg-mr-green text-gray-100">
  <div class="max-w-xl mx-auto py-6 px-4 lg:py-8 xl:w-2/3">
    <Form asyncSubmit={handleSubmit} {validate} let:errors>
      <div
        class="mb-6 font-display font-bold tracking-wide text-4xl text-center text-mr-gold uppercase"
      >
        Sponsorships Available
      </div>
      <div class="font-display font-medium tracking-wide text-2xl text-mr-gold">
        Presenting Sponsor (limited to 2): $2500
      </div>
      <ul class="list-disc list-inside ml-4 mb-4 lg:mb-6">
        <li>Signage at the tees of our contest holes</li>
        <li>Banner displayed on the course and at dinner</li>
        <li>Large listing on the Sponsor Recognition Board</li>
        <li>
          Prominent company branding and link on event website and program
        </li>
        <li>Branding on golfer's gifts</li>
        <li>Golf and dinner for 8</li>
        <li>2 additional dinner tickets</li>
      </ul>
      <div class="font-display font-medium tracking-wide text-2xl text-mr-gold">
        Ace Sponsor: $1500
      </div>
      <ul class="list-disc list-inside ml-4 mb-4 lg:mb-6">
        <li>Signage at putting green</li>
        <li>
          Prominent company branding and link on event website and program
        </li>
        <li>Listing on the Sponsorship Recognition Board</li>
        <li>Golf and dinner for 4 (1 foursome)</li>
        <li>2 additional dinner tickets</li>
      </ul>
      <div class="font-display font-medium tracking-wide text-2xl text-mr-gold">
        Eagle Sponsor: $750
      </div>
      <ul class="list-disc list-inside ml-4 mb-4 lg:mb-6">
        <li>Signage at the registration table of golf and dinner</li>
        <li>Company branding and link on event website and program</li>
        <li>Golf and dinner for two</li>
      </ul>
      <div class="font-display font-medium tracking-wide text-2xl text-mr-gold">
        Birdie Sponsor: $500
      </div>
      <ul class="list-disc list-inside ml-4 mb-4 lg:mb-6">
        <li>Signage at registration</li>
        <li>Listing on the Sponsor Recognition Board</li>
        <li>Company branding and link on event website and program</li>
      </ul>
      <div class="font-display font-medium tracking-wide text-2xl text-mr-gold">
        Hole Sponsor: $150
      </div>
      <ul class="list-disc list-inside ml-4 mb-4 lg:mb-6">
        <li>One hole sponsor sign located on the course</li>
        <li>Company branding and link on the event website and program</li>
      </ul>
      <div class="font-display font-medium tracking-wide text-2xl text-mr-gold">
        In Memory: $50
      </div>
      <ul class="list-disc list-inside ml-4 mb-4 lg:mb-6">
        <li>One In Memory Sponsor sign located on course</li>
      </ul>

      <div class="py-6">
        <div class="mb-2 rounded-sm shadow-sm">
          <select
            bind:value={sponsorSelected}
            id="sponsorSelected"
            name="sponsorSelected"
            class="text-gray-800 form-select px-2 py-3 block w-full border rounded-sm text-lg focus:border-mr-gold transition duration-150 ease-in-out"
          >
            {#each sponsorOptions as sponsor}
              <option value={sponsor.id}>
                {sponsor.name} - ${sponsor.price / 100}
              </option>
            {/each}
          </select>
        </div>
        <label
          for="state"
          class="block text-center text-white text-lg opacity-75 leading-5 uppercase"
        >
          Sponsorship Option
        </label>
        <div
          class="ml-2 text-red-500 text-sm {errors.state ? 'block' : 'hidden'}"
        >
          State is required.
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

      <div class="max-w-lg mx-auto px-2">
        {#if !loading}
          <button
            type="submit"
            class="inline-flex items-center justify-center w-full my-6 px-4 py-3 shadow font-display text-2xl font-semibold uppercase tracking-wider bg-mr-gold hover:bg-yellow-500 focus:outline-none focus:border-yellow-600 focus:shadow-outline-red active:bg-yellow-700 transition ease-in-out duration-150"
          >
            <div>
              Pay {moneyFormatter.format((sponsorCostTotal || 1) / 100)}
            </div>
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
</section>
