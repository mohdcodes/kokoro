/** Branded loading indicator: a cup that fills with purple "coffee" plus gentle steam. Pure CSS. */
export default function CoffeeCupLoader({
  label = "Brewing…",
  fullscreen = false,
}: {
  label?: string;
  fullscreen?: boolean;
}) {
  const content = (
    <div className="flex flex-col items-center gap-5">
      {/* Steam */}
      <div className="flex h-6 gap-2">
        <span className="kokoro-steam h-6 w-1 rounded-full bg-kokoro-300/70" />
        <span className="kokoro-steam kokoro-steam-2 h-6 w-1 rounded-full bg-kokoro-300/70" />
        <span className="kokoro-steam kokoro-steam-3 h-6 w-1 rounded-full bg-kokoro-300/70" />
      </div>

      {/* Cup */}
      <div className="relative flex items-end">
        <div className="relative h-16 w-20 overflow-hidden rounded-b-3xl rounded-t-md border-4 border-kokoro-500 bg-white/70">
          <div
            className="kokoro-cup-liquid absolute inset-x-0 bottom-0 bg-gradient-to-t from-kokoro-700 to-kokoro-400"
            style={{ height: "8%" }}
          />
        </div>
        {/* Handle */}
        <div className="mb-2 ml-[-2px] h-8 w-6 rounded-r-full border-4 border-l-0 border-kokoro-500" />
      </div>

      {/* Saucer */}
      <div className="h-1.5 w-24 rounded-full bg-kokoro-300/70" />

      {label && <p className="font-heading text-sm text-kokoro-600">{label}</p>}
    </div>
  );

  if (fullscreen) {
    return <div className="flex min-h-[60vh] w-full items-center justify-center">{content}</div>;
  }
  return content;
}
