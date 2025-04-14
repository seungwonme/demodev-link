import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-gray-600">
          요청하신 페이지를 찾을 수 없습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
