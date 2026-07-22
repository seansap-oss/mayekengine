export default function HowItWorks() {
  return (
    <div className="min-h-screen overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.65)]">
      <div className="relative min-h-[70vh] w-full">
        <img
          src="/assets/photo_journal.jpg"
          alt="Photo journal flow chart and WhatsApp interface for MeiteiRoman by MayekEngine"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Visual Product Journey</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            A photo journal for the MeiteiRoman experience, from flow chart to WhatsApp conversation.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            This page highlights how the app maps standard romanized phrases into a chat-friendly interface and displays the execution path for every message.
          </p>
        </div>
      </div>
    </div>
  );
}
