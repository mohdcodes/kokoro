import { Coffee, Heart, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20">
      <div className="glass-strong rounded-3xl p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-kokoro-100 text-3xl">
          🐨
        </div>
        <h1 className="text-center font-heading text-3xl text-kokoro-900">About Kokoro</h1>

        <p className="mt-6 text-sm leading-relaxed text-kokoro-700 sm:text-base">
          Kokoro means &quot;heart&quot; in Japanese — and that&apos;s the spirit behind everything
          we serve. We&apos;re a small neighborhood cafe built around one idea: good habits start
          with a good place to build them.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-kokoro-700 sm:text-base">
          Whether it&apos;s your morning coffee ritual, an afternoon study session, or an evening
          mojito with friends, Kokoro is your little hideaway. Every drink is made fresh to order,
          and our menu is designed to have something for every mood — hot or cold coffee, mojitos,
          smoothies, shakes, iced teas, sundaes, and quick bites.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Coffee, title: "Made Fresh", text: "Every order, right when you order it." },
            { icon: Heart, title: "Cozy Vibes", text: "A warm place to slow down." },
            { icon: Sparkles, title: "For Every Mood", text: "Hot, cold, sweet or savory." },
          ].map((f) => (
            <div key={f.title} className="tile rounded-2xl p-4 text-center">
              <f.icon className="mx-auto h-6 w-6 text-kokoro-600" />
              <p className="mt-2 font-heading text-sm text-kokoro-800">{f.title}</p>
              <p className="mt-1 text-xs text-kokoro-500">{f.text}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm font-medium text-kokoro-700">
          Thank you for being a part of our little hideaway.
        </p>
      </div>
    </div>
  );
}
