import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children, title = "Quản lý phiếu đề nghị tour" }) {
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Danh sách phiếu" },
    { href: "/create", label: "Tạo phiếu mới" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title ? `${title} | Vietravel` : "Vietravel"}</title>
      </Head>
      <header className="border-b border-blue-900/20 bg-blue-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div>
              <h1 className="text-white font-semibold text-lg leading-tight">Vietravel</h1>
              <p className="text-blue-100 text-xs">Mini system quản lý phiếu tour</p>
            </div>
            <nav className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    router.pathname === item.href
                      ? "bg-white text-blue-800"
                      : "text-blue-50 hover:bg-blue-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-tight">{title}</h2>
        )}
        {children}
      </main>
    </div>
  );
}
