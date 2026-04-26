export default function HelloTitle({
  mainText,
  supportiveText,
}: {
  mainText: string | JSX.Element;
  supportiveText: string;
}) {
  return (
    <header className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
      <p className="text-sm uppercase tracking-[0.6em] text-white/50">
        Explore
      </p>

      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
        {mainText}
      </h1>

      <p className="text-readable max-w-3xl text-center text-sm font-medium text-white/65 sm:text-base">
        {supportiveText}
      </p>

    </header>
  );
}
