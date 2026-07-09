import Link from "next/link";
import { Coffee, Heart, Timer } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import AnimatedSection from "@/components/home/AnimatedSection";
import { getPopularItems } from "@/lib/menu";
import { getApprovedReviews } from "@/lib/reviews";
import PopularPickCard from "@/components/home/PopularPickCard";
import ReviewsSection from "@/components/ReviewsSection";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: Coffee,
    title: "Fresh Ingredients",
    description: "Every cup and plate is made fresh, right when you order it.",
  },
  {
    icon: Heart,
    title: "Cozy Vibes",
    description: "A warm little hideaway to slow down, study, or catch up with friends.",
  },
  {
    icon: Timer,
    title: "Quick Pickup",
    description: "Order ahead online and skip the wait — just walk in and grab it.",
  },
];

export default async function Home() {
  const popularItems = await getPopularItems(6);
  const reviews = await getApprovedReviews(12);

  return (
    <div className="flex flex-col">
      <HeroSection />

      <AnimatedSection className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-heading text-3xl text-kokoro-900">About Kokoro</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-kokoro-600 sm:text-base">
          Kokoro means &quot;heart&quot; — and that&apos;s exactly what we put into every drink and
          dish. We started this little cafe to be a place where habits are built: your morning
          coffee ritual, your afternoon study break, your evening catch-up with friends. Pull up a
          chair and stay a while.
        </p>
      </AnimatedSection>

      <section className="px-4 py-16">
        <AnimatedSection className="mx-auto max-w-6xl text-center">
          <h2 className="font-heading text-3xl text-kokoro-900">Popular Picks</h2>
          <p className="mt-2 text-sm text-kokoro-600">A few favorites from our menu</p>
        </AnimatedSection>

        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularItems.map((item, i) => (
            <AnimatedSection key={item.id} delay={i * 0.05}>
              <PopularPickCard item={item} />
            </AnimatedSection>
          ))}
          {popularItems.length === 0 && (
            <p className="col-span-full text-center text-sm text-kokoro-500">
              Menu coming soon — check back shortly!
            </p>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/menu"
            className="inline-block rounded-full bg-kokoro-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-kokoro-700"
          >
            See Full Menu
          </Link>
        </div>
      </section>

      <ReviewsSection initialReviews={reviews} />

      <section className="px-4 py-16">
        <AnimatedSection className="mx-auto max-w-6xl text-center">
          <h2 className="font-heading text-3xl text-kokoro-900">Why Kokoro</h2>
        </AnimatedSection>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={i * 0.1}>
              <div className="tile flex h-full flex-col items-center rounded-3xl p-6 text-center">
                <feature.icon className="h-8 w-8 text-kokoro-600" />
                <h3 className="mt-3 font-heading text-lg text-kokoro-800">{feature.title}</h3>
                <p className="mt-2 text-sm text-kokoro-600">{feature.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </div>
  );
}
