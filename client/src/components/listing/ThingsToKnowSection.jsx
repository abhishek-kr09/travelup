export default function ThingsToKnowSection({ listing }) {
  const maxGuests = listing?.maxGuests || 4;

  return (
    <section className="pt-8 border-t border-stone-200 dark:border-zinc-800 space-y-8">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">Things to know</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        <div className="space-y-3">
          <div className="w-8 h-8 text-zinc-800 dark:text-zinc-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M8 2v4M16 2v4M3 10h18M8 14l8 8M16 14l-8 8" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold">Cancellation policy</h3>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed">
            Reservation charges are generally non-refundable after payment confirmation.
            Please review the full policy before booking.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-8 h-8 text-zinc-800 dark:text-zinc-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
              <circle cx="10" cy="10" r="4.5" />
              <path d="M14 14l7 7" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold">House rules</h3>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed">
            Check-in: 12:00 pm to 9:00 pm
            <br />
            Checkout before 11:00 am
            <br />
            {maxGuests} guests maximum
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-8 h-8 text-zinc-800 dark:text-zinc-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
              <path d="M12 2l7 3v6c0 5-3.4 8.9-7 11-3.6-2.1-7-6-7-11V5l7-3z" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold">Safety & property</h3>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed">
            Carbon monoxide alarm not reported
            <br />
            Smoke alarm not reported
            <br />
            Exterior security cameras on property
          </p>
        </div>
      </div>
    </section>
  );
}
