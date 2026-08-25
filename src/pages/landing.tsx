import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Integrations } from "@/components/landing/integrations";
import { Privacy } from "@/components/landing/privacy";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";

export function Landing() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Integrations />
      <Privacy />
      <Pricing />
      <Faq />
      <Cta />
    </>
  );
}
