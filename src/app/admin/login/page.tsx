import { Suspense } from "react";
import AdminLoginClient from "./login-client";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      }>
        <AdminLoginClient />
      </Suspense>
    </div>
  );
}