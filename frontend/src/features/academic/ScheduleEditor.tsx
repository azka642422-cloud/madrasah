import { FormEvent, useEffect, useState } from "react";
import { api } from "../../services/api";
type Y = { id: number; name: string; is_active: number };
type A = {
  id: number;
  class_code: string;
  subject_name: string;
  teacher_name: string;
};
export default function ScheduleEditor() {
  const [years, setYears] = useState<Y[]>([]),
    [year, setYear] = useState(0),
    [sem, setSem] = useState<"GANJIL" | "GENAP">("GANJIL"),
    [assign, setAssign] = useState<A[]>([]),
    [rows, setRows] = useState<any[]>([]),
    [msg, setMsg] = useState(""),
    [removing, setRemoving] = useState<number | null>(null),
    [busy, setBusy] = useState(false);
  async function refresh() {
    const r = await api<any>("/schedules/admin");
    setRows(r.schedules);
  }
  useEffect(() => {
    api<{ academicYears: Y[] }>("/academic-years").then((r) => {
      setYears(r.academicYears);
      const x = r.academicYears.find((v) => v.is_active) || r.academicYears[0];
      if (x) setYear(x.id);
    });
    refresh().catch(() => setMsg("Gagal memuat jadwal."));
  }, []);
  useEffect(() => {
    if (year)
      api<{ assignments: A[] }>(
        `/assignments?academicYearId=${year}&semester=${sem}`,
      )
        .then((r) => setAssign(r.assignments))
        .catch(() => setAssign([]));
  }, [year, sem]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await api("/schedules", {
        method: "POST",
        body: JSON.stringify({
          teachingAssignmentId: Number(f.get("assignment")),
          dayOfWeek: f.get("day"),
          startsAt: f.get("start"),
          endsAt: f.get("end"),
          roomName: f.get("room") || null,
        }),
      });
      setMsg("Jadwal tersimpan.");
      await refresh();
    } catch (e: any) {
      setMsg(
        e.code === "SCHEDULE_CONFLICT"
          ? "Bentrok: Guru atau kelas sudah memiliki jadwal pada waktu tersebut."
          : (e.code ?? "Gagal menyimpan jadwal."),
      );
    }
  }
  async function remove(id: number) {
    setBusy(true);
    try {
      await api(`/schedules/${id}`, { method: "DELETE" });
      setMsg("Jadwal dinonaktifkan.");
      setRemoving(null);
      await refresh();
    } catch (e: any) {
      setMsg(e.code ?? "Gagal menghapus jadwal.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card">
      <form className="filters" onSubmit={submit}>
        <label>
          Tahun
          <select value={year} onChange={(e) => setYear(+e.target.value)}>
            {years.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Semester
          <select value={sem} onChange={(e) => setSem(e.target.value as any)}>
            <option>GANJIL</option>
            <option>GENAP</option>
          </select>
        </label>
        <label>
          Penugasan
          <select name="assignment" required>
            {assign.map((x) => (
              <option key={x.id} value={x.id}>
                {x.class_code} · {x.subject_name} · {x.teacher_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Hari
          <select name="day">
            {[
              "SENIN",
              "SELASA",
              "RABU",
              "KAMIS",
              "JUMAT",
              "SABTU",
              "MINGGU",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Mulai
          <input name="start" type="time" required />
        </label>
        <label>
          Selesai
          <input name="end" type="time" required />
        </label>
        <label>
          Ruang
          <input name="room" maxLength={100} />
        </label>
        <button disabled={!assign.length}>Tambah Jadwal</button>
      </form>
      {msg && <p>{msg}</p>}
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Hari</th>
              <th>Jam</th>
              <th>Kelas</th>
              <th>Pelajaran</th>
              <th>Guru</th>
              <th>Ruang</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.day_of_week}</td>
                <td>
                  {String(r.starts_at).slice(0, 5)}–
                  {String(r.ends_at).slice(0, 5)}
                </td>
                <td>{r.class_code}</td>
                <td>{r.subject_name}</td>
                <td>{r.teacher_name}</td>
                <td>{r.room_name ?? "—"}</td>
                <td>
                  <button type="button" onClick={() => setRemoving(r.id)}>
                    Nonaktifkan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p>Belum ada jadwal aktif.</p>}
      </div>
      {removing !== null && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="schedule-delete-title">
            <h3 id="schedule-delete-title">Nonaktifkan jadwal?</h3>
            <p>Jadwal tidak lagi ditampilkan sebagai jadwal aktif.</p>
            <p>
              <button disabled={busy} onClick={() => remove(removing)}>
                {busy ? "Memproses…" : "Ya, nonaktifkan"}
              </button>{" "}
              <button type="button" disabled={busy} onClick={() => setRemoving(null)}>
                Batal
              </button>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
