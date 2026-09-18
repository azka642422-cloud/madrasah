import OperationsPage from "../features/admin/OperationsPage";
import AccountsPage from "../features/admin/AccountsPage";
import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../services/api";
import ProductionPage from "../features/production/ProductionPage";
import AcademicPage from "../features/academic/AcademicPage";
import AcademicEditor from "../features/academic/AcademicEditor";
import ScheduleEditor from "../features/academic/ScheduleEditor";
import ReportPage from "../features/reports/ReportPage";
import ReportSignatureManager from "../features/reports/ReportSignatureManager";
import CertificatePage from "../features/certificates/CertificatePage";
import StudentImportReview from "../features/production/StudentImportReview";
import DocumentsPage from "../features/production/DocumentsPage";
import "./app.css";
type Role = "SUPER_ADMIN" | "ADMIN" | "GURU" | "SANTRI";
type User = { username: string; role: Role; mustChangePassword: boolean };
const roles: Role[] = ["SUPER_ADMIN", "ADMIN", "GURU", "SANTRI"];
function validUser(v: any): v is User {
  return (
    !!v &&
    typeof v.username === "string" &&
    roles.includes(v.role) &&
    typeof v.mustChangePassword === "boolean"
  );
}
const academic = new Set(["Jadwal", "Absensi", "Nilai", "Muhafadloh"]),
  editable = new Set(["Absensi", "Nilai", "Muhafadloh"]);
const nav: Record<Role, string[]> = {
  SUPER_ADMIN: [
    "Dashboard",
    "Santri",
    "Rekonsiliasi Import",
    "Guru",
    "Kelas",
    "Jadwal",
    "Absensi",
    "Nilai",
    "Muhafadloh",
    "Raport",
    "Tanda Tangan Raport",
    "Ijazah",
    "Kalender",
    "Dokumen",
    "Pengumuman",
    "Notifikasi",
    "Akun",
    "Pengaturan",
  ],
  ADMIN: [
    "Dashboard",
    "Santri",
    "Rekonsiliasi Import",
    "Guru",
    "Kelas",
    "Jadwal",
    "Absensi",
    "Nilai",
    "Muhafadloh",
    "Raport",
    "Tanda Tangan Raport",
    "Ijazah",
    "Kalender",
    "Dokumen",
    "Pengumuman",
    "Notifikasi",
    "Akun",
    "Pengaturan",
  ],
  GURU: [
    "Dashboard",
    "Santri Kelas",
    "Jadwal",
    "Absensi",
    "Nilai",
    "Muhafadloh",
    "Raport",
    "Kalender",
    "Dokumen",
    "Pengumuman",
    "Notifikasi",
    "Kritik & Saran",
  ],
  SANTRI: [
    "Dashboard",
    "Profil",
    "Jadwal",
    "Absensi",
    "Nilai",
    "Muhafadloh",
    "Raport",
    "Ijazah",
    "Kalender",
    "Dokumen",
    "Pengumuman",
    "Notifikasi",
  ],
};
export default function App() {
  const [user, setUser] = useState<User | null | undefined>(),
    [page, setPage] = useState("Dashboard"),
    [error, setError] = useState("");
  useEffect(() => {
    api<{ user: unknown }>("/auth/me")
      .then((x) => setUser(validUser(x.user) ? x.user : null))
      .catch(() => setUser(null));
  }, []);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await api<{ user: unknown }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: f.get("username"),
          password: f.get("password"),
        }),
      });
      if (!validUser(r.user)) {
        setError("Respons akun tidak valid.");
        return;
      }
      setUser(r.user);
      setPage("Dashboard");
    } catch (e) {
      setError(
        e instanceof ApiError && (e.status === 400 || e.status === 401)
          ? "Username atau password tidak sesuai."
          : "Layanan login sedang bermasalah.",
      );
    }
  }
  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget),
      a = String(f.get("newPassword") ?? ""),
      b = String(f.get("confirmPassword") ?? "");
    if (a !== b) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: f.get("currentPassword"),
          newPassword: a,
        }),
      });
      setUser(null);
      setError("");
    } catch (e) {
      setError(
        e instanceof ApiError && e.code === "CURRENT_PASSWORD_INVALID"
          ? "Password saat ini tidak sesuai."
          : e instanceof ApiError && e.code === "PASSWORD_UNCHANGED"
            ? "Password baru harus berbeda."
            : "Password baru minimal 12 karakter dan harus valid.",
      );
    }
  }
  if (user === undefined) return <main className="center">Memuat…</main>;
  if (!user)
    return (
      <main className="login">
        <form onSubmit={login}>
          <h1>Madrasah Diniyah</h1>
          <p>Sistem Administrasi Akademik</p>
          <label>
            Username
            <input name="username" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button>Masuk</button>
        </form>
      </main>
    );
  if (user.mustChangePassword)
    return (
      <main className="login">
        <form onSubmit={changePassword}>
          <h1>Ganti Password</h1>
          <p>Password wajib diganti sebelum mengakses sistem.</p>
          <label>
            Password saat ini
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            Password baru
            <input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </label>
          <label>
            Ulangi password baru
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button>Ganti Password</button>
          <button
            type="button"
            onClick={async () => {
              await api("/auth/logout", { method: "POST" });
              setUser(null);
            }}
          >
            Keluar
          </button>
        </form>
      </main>
    );
  let content;
  if (page === "Dashboard")
    content = (
      <section className="card">
        <h2>Dashboard</h2>
        <p>Selamat datang, {user.username}. Data mengikuti hak akses akun.</p>
      </section>
    );
  else if (
    page === "Akun" &&
    (user.role === "ADMIN" || user.role === "SUPER_ADMIN")
  )
    content = <AccountsPage role={user.role} />;
  else if (
    ["Guru", "Kelas", "Pengaturan"].includes(page) &&
    (user.role === "ADMIN" || user.role === "SUPER_ADMIN")
  )
    content = (
      <OperationsPage
        key={page}
        initial={
          page === "Guru" ? "teachers" : page === "Kelas" ? "classes" : "years"
        }
      />
    );
  else if (
    page === "Rekonsiliasi Import" &&
    (user.role === "ADMIN" || user.role === "SUPER_ADMIN")
  )
    content = <StudentImportReview />;
  else if (page === "Dokumen") content = <DocumentsPage role={user.role} />;
  else if (page === "Raport") content = <ReportPage role={user.role} />;
  else if (page === "Ijazah") content = <CertificatePage role={user.role} />;
  else if (
    page === "Tanda Tangan Raport" &&
    (user.role === "ADMIN" || user.role === "SUPER_ADMIN")
  )
    content = <ReportSignatureManager />;
  else if (
    page === "Jadwal" &&
    (user.role === "ADMIN" || user.role === "SUPER_ADMIN")
  )
    content = <ScheduleEditor />;
  else if (editable.has(page) && user.role !== "SANTRI")
    content = <AcademicEditor key={page} page={page} role={user.role} />;
  else if (academic.has(page))
    content = <AcademicPage key={page} page={page} role={user.role} />;
  else content = <ProductionPage key={page} page={page} role={user.role} />;
  return (
    <div className="shell">
      <aside>
        <h2>Madrasah Diniyah</h2>
        <small>
          {user.username} · {user.role.replace("_", " ")}
        </small>
        <nav>
          {nav[user.role].map((n) => (
            <button
              className={page === n ? "active" : ""}
              key={n}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
        </nav>
        <button
          onClick={async () => {
            await api("/auth/logout", { method: "POST" });
            setUser(null);
          }}
        >
          Keluar
        </button>
      </aside>
      <main>
        <header>
          <h1>{page}</h1>
        </header>
        {content}
      </main>
    </div>
  );
}
