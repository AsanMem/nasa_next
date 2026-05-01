export default function LoadingLibrary() {
  const cards = Array.from({ length: 6 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-16">
        <header className="flex flex-col gap-4">
          <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="h-12 w-full max-w-2xl animate-pulse rounded-2xl bg-white/10" />
          <div className="h-5 w-full max-w-3xl animate-pulse rounded-full bg-white/10" />
        </header>

        <section className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10"
            >
              <div className="h-60 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
              <div className="h-7 w-3/4 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
