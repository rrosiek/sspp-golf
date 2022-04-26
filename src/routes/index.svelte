<script lang="ts">
  import { dev } from "$app/env";
  import { getFirebaseApp } from "$lib/firebase";
  import EventDetail from "$lib/components/EventDetail.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import Payment from "$lib/components/Payment.svelte";
  import ThankYou from "$lib/components/ThankYou.svelte";

  const app = getFirebaseApp();
  const bgImg = dev ? "image_bg.jpg" : "/image_bg.jpg";

  let paymentEmail: string | null = null;

  const handlePaymentComplete = (event: CustomEvent) =>
    (paymentEmail = event.detail.email);
</script>

<main>
  <section style="background-image: url('{bgImg}')">
    <Header />
    <EventDetail />
  </section>

  {#if app && !paymentEmail}
    <Payment on:paymentComplete={handlePaymentComplete} />
  {:else if paymentEmail}
    <ThankYou email={paymentEmail} />
  {/if}
</main>

<Footer />

<style>
  section {
    background-size: cover;
    background-repeat: no-repeat;
  }
</style>
