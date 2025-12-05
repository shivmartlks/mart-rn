export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-app text-text-primary">
      {/* Header */}
      <header
        className="
          flex justify-between items-center
          p-6 bg-white border-b border-border shadow-sm
        "
      >
        <h1 className="text-2xl font-bold">Admin Home</h1>
      </header>

      {/* Main Section (empty for now) */}
      <main className="p-6 max-w-5xl mx-auto">
        <div
          className="
            bg-white border border-border rounded-2xl 
            shadow-card p-6 text-text-muted
          "
        >
          <p>Welcome to the admin dashboard. Add widgets here.</p>
        </div>
      </main>
    </div>
  );
}
