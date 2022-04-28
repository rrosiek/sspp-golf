<script lang="ts">
  import { dev } from "$app/env";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";

  const bgImg = dev ? "image_bg.jpg" : "/image_bg.jpg";
</script>

<main>
  <section style="background-image: url('{bgImg}')">
    <Header />
  </section>

  <section class="bg-mr-green text-gray-100">
    <div class="max-w-2xl mx-auto py-6 px-4 lg:py-8 xl:w-2/3">
      <div
        class="mb-6 font-display font-bold tracking-wide text-4xl text-center text-mr-gold uppercase"
      >
        Items for Auction
      </div>

      <div class="text-xl text-center">
        All items are available for auction at the Hamburg Brewing Company
        tournament dinner.
      </div>

      <div class="flex flex-col justify-center item-center text-center">
        <div
          class="mt-4 font-display font-medium tracking-wide text-2xl text-mr-gold"
        >
          Signed Emanual Sanders Bills Jersey
        </div>
        <img
          class="p-2 my-4 border-2 border-mr-gold"
          src="/sanders_signed_jersey.jpg"
          alt="Signed Marv Levy Football"
        />
      </div>

      <div class="flex flex-col justify-center item-center text-center">
        <div
          class="mt-4 font-display font-medium tracking-wide text-2xl text-mr-gold"
        >
          Signed Marv Levy Football
        </div>
        <img
          class="p-2 my-4 border-2 border-mr-gold"
          src="/marv_levy_football.jpg"
          alt="Signed Marv Levy Football"
        />
      </div>

      <div
        class="mt-4 font-display font-medium tracking-wide text-2xl text-mr-gold text-center"
      >
        Other Items Include:
      </div>
      <div class="text-center text-lg">
        Andre reed signed jersey<br />
        Golf for 2 at double diamond golf course in Ellicottville<br />
        $100 to the Grange in Hamburg<br />
        $500 gift card to the Curtis Hotel in downtown Buffalo
      </div>
    </div>
  </section>
</main>

<Footer />

<style>
  section {
    background-size: cover;
    background-repeat: no-repeat;
  }
</style>
