export default function Home() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div
        className="
          bg-white border border-border shadow-card 
          rounded-2xl px-8 py-10 text-center
        "
      >
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome to Shiv Mart 🛍️
        </h1>

        <p className="mt-2 text-text-muted">
          Your one-stop store for everything!
        </p>
      </div>
    </div>
  );
}
