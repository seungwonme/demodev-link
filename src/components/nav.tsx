import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold">
            DemoLink
          </Link>
          <div className="flex space-x-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
            >
              홈
            </Link>
            <Link
              href="/analytics"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
            >
              분석
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
