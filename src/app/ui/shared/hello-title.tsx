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

      <p className="max-w-3xl text-center text-sm font-medium tracking-[0.08em] text-white/65 sm:text-base sm:leading-7">
        {supportiveText}
      </p>

    </header>
  );
}
