import UpdatePassword from "./UpdatePassword";

export const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Welcome Back!</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select an option from the menu or update your credentials below.
        </p>
      </div>
      <UpdatePassword />
    </div>
  );
};