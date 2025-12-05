export default function ManageOrders() {
  return (
    <div className="min-h-screen bg-app text-text-primary">
      {/* Header */}
      <header
        className="
          flex justify-between items-center
          p-6 bg-white border-b border-border shadow-sm
        "
      >
        <h1 className="text-2xl font-bold">Manage Orders</h1>
      </header>

      {/* Main Section */}
      <main className="p-6 max-w-5xl mx-auto">
        <div
          className="
            bg-white border border-border rounded-2xl
            shadow-card p-6 text-text-muted
          "
        >
          <p>Order management page. Add list/table here.</p>
        </div>
      </main>
    </div>
  );
}
