import { Sidebar } from '~root/components/Sidebar';

export const DashboardPage = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <main className="flex-1 p-8">
        <h1 className="mb-4 text-2xl font-semibold text-slate-900">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {['Tổng quan', 'Hoạt động', 'Thông báo'].map((title) => (
            <div key={title} className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-2 text-lg font-medium text-slate-900">{title}</h2>
              <p className="text-sm text-slate-500">Nội dung sẽ được cập nhật sau.</p>
            </div>
          ))}
        </div>
      </main>
      <Sidebar />
    </div>
  );
};
