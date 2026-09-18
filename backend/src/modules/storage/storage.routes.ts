import { digest, validPdf, validOffice, verifiedBytes } from "./integrity.js";
import { writeAudit } from "../audit/audit.service.js";
import { Router } from "express";
import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { db } from "../../config/db.js";
import { requireAuthentication } from "../../middleware/authentication.js";
import { requirePermission } from "../../middleware/authorization.js";
const HERE = path.dirname(fileURLToPath(import.meta.url)),
  ROOT = process.env.UPLOAD_ROOT
    ? path.resolve(process.env.UPLOAD_ROOT)
    : path.resolve(HERE, "../../../../storage/uploads"),
  PHOTO_DIR = path.join(ROOT, "photos"),
  DOC_DIR = path.join(ROOT, "documents");
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]),
  documentTypes = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});
export const storageRouter = Router();
storageRouter.use(requireAuthentication);
function ext(m: string) {
  return (
    {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "application/pdf": ".pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
    } as Record<string, string>
  )[m];
}
function signature(f: Express.Multer.File) {
  const b = f.buffer,
    m = f.mimetype;
  if (m === "image/jpeg")
    return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (m === "image/png")
    return b
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (m === "image/webp")
    return (
      b.subarray(0, 4).toString() === "RIFF" &&
      b.subarray(8, 12).toString() === "WEBP"
    );
  if (m === "application/pdf") return b.subarray(0, 5).toString() === "%PDF-";
  return b[0] === 0x50 && b[1] === 0x4b;
}
async function save(dir: string, f: Express.Multer.File) {
  await fs.mkdir(dir, { recursive: true });
  const n = crypto.randomUUID() + ext(f.mimetype);
  await fs.writeFile(path.join(dir, n), f.buffer, { flag: "wx" });
  return n;
}
function full(rel: string) {
  const p = path.resolve(ROOT, rel);
  return p.startsWith(ROOT + path.sep) ? p : null;
}
function sendFileStatus(e: Error & { statusCode?: number }) {
  return e.statusCode === 404 ? 404 : 500;
}
storageRouter.post(
  "/students/:studentId/photo",
  requirePermission("students.manage"),
  upload.single("file"),
  async (req, res, next) => {
    let saved: string | undefined;
    let committed = false;
    let old: string | null = null;
    try {
      const id = Number(req.params.studentId);
      if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        !req.file ||
        !imageTypes.has(req.file.mimetype) ||
        !ext(req.file.mimetype) ||
        !signature(req.file)
      ) {
        res.status(400).json({ error: "INVALID_PHOTO" });
        return;
      }
      if (req.file.size > 5 * 1024 * 1024) {
        res.status(413).json({ error: "PHOTO_TOO_LARGE" });
        return;
      }
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        const [rows]: any = await conn.query(
          `SELECT photo_path FROM students WHERE id=? LIMIT 1 FOR UPDATE`,
          [id],
        );
        if (!rows[0]) {
          await conn.rollback();
          res.status(404).json({ error: "STUDENT_NOT_FOUND" });
          return;
        }
        old = rows[0].photo_path;
        const n = await save(PHOTO_DIR, req.file);
        saved = `photos/${n}`;
        const sha256 = digest(req.file.buffer);
        await conn.execute(
          `UPDATE students SET photo_path=?,photo_sha256=? WHERE id=?`,
          [saved, sha256, id],
        );
        await writeAudit(
          req,
          {
            action: "STUDENT.PHOTO_UPDATED",
            entityType: "student",
            entityId: id,
            metadata: { sha256, fileSize: req.file.size },
          },
          conn,
        );
        await conn.commit();
        committed = true;
        res.status(201).json({ photo: true });
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
      if (old && old !== saved) {
        const p = full(old);
        if (p) await fs.unlink(p).catch(() => {});
      }
    } catch (e) {
      if (saved && !committed) {
        const p = full(saved);
        if (p) await fs.unlink(p).catch(() => {});
      }
      next(e);
    }
  },
);
storageRouter.post(
  "/documents",
  requirePermission("documents.manage"),
  upload.single("file"),
  async (req, res, next) => {
    let saved: string | undefined;
    let committed = false;
    try {
      if (
        !req.file ||
        !documentTypes.has(req.file.mimetype) ||
        !ext(req.file.mimetype) ||
        !(req.file.mimetype === "application/pdf"
          ? await validPdf(req.file.buffer)
          : await validOffice(
              req.file.buffer,
              req.file.mimetype.includes("wordprocessing") ? "word" : "xl",
            ))
      ) {
        res.status(400).json({ error: "INVALID_DOCUMENT" });
        return;
      }
      const { category, title, description = "", audience = "ALL" } = req.body;
      if (
        ![
          "MATERI",
          "BUKU_KERJA_GURU",
          "BUKU_SANTRI",
          "PERATURAN_GURU",
          "SILABUS",
          "SOAL",
          "LAINNYA",
        ].includes(category) ||
        !["ALL", "SUPER_ADMIN", "ADMIN", "GURU", "SANTRI"].includes(audience) ||
        typeof title !== "string" ||
        !title.trim() ||
        title.length > 255 ||
        typeof description !== "string" ||
        description.length > 3000 ||
        (audience === "SUPER_ADMIN" && req.auth!.role !== "SUPER_ADMIN")
      ) {
        res.status(400).json({ error: "INVALID_DOCUMENT_METADATA" });
        return;
      }
      const n = await save(DOC_DIR, req.file);
      saved = `documents/${n}`;
      const sha256 = digest(req.file.buffer);
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        const [r]: any = await conn.execute(
          `INSERT INTO documents(category,title,description,file_path,mime_type,file_size,audience,published,uploaded_by,sha256) VALUES(?,?,?,?,?,?,?,0,?,?)`,
          [
            category,
            title.trim(),
            description,
            saved,
            req.file.mimetype,
            req.file.size,
            audience,
            req.auth!.userId,
            sha256,
          ],
        );
        await writeAudit(
          req,
          {
            action: "DOCUMENT.CREATED",
            entityType: "document",
            entityId: r.insertId,
            metadata: { category, audience, sha256, fileSize: req.file.size },
          },
          conn,
        );
        await conn.commit();
        committed = true;
        res.status(201).json({ id: r.insertId });
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    } catch (e) {
      if (saved && !committed) {
        const p = full(saved);
        if (p) await fs.unlink(p).catch(() => {});
      }
      next(e);
    }
  },
);
storageRouter.patch(
  "/documents/:id/publish",
  requirePermission("documents.manage"),
  async (req, res, next) => {
    const conn = await db.getConnection();
    try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({ error: "INVALID_DOCUMENT_ID" });
        return;
      }
      await conn.beginTransaction();
      const [rows]: any = await conn.query(
        `SELECT id,title,audience,published FROM documents WHERE id=? LIMIT 1 FOR UPDATE`,
        [id],
      );
      const document = rows[0];
      if (!document) {
        await conn.rollback();
        res.status(404).json({ error: "DOCUMENT_NOT_FOUND" });
        return;
      }
      if (
        document.audience === "SUPER_ADMIN" &&
        req.auth!.role !== "SUPER_ADMIN"
      ) {
        await conn.rollback();
        res.status(403).json({ error: "DOCUMENT_FORBIDDEN" });
        return;
      }
      if (!document.published) {
        await conn.execute(`UPDATE documents SET published=1 WHERE id=?`, [id]);
        await writeAudit(
          req,
          {
            action: "DOCUMENT.PUBLISHED",
            entityType: "document",
            entityId: id,
            metadata: { title: document.title, audience: document.audience },
          },
          conn,
        );
      }
      await conn.commit();
      res.status(204).end();
    } catch (e) {
      await conn.rollback();
      next(e);
    } finally {
      conn.release();
    }
  },
);
storageRouter.get("/documents/:id/file", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ error: "INVALID_DOCUMENT_ID" });
      return;
    }
    const [rows]: any = await db.query(
        `SELECT file_path,mime_type,title,audience,published,sha256,file_size,uploaded_by FROM documents WHERE id=? LIMIT 1`,
        [id],
      ),
      d = rows[0];
    if (
      !d ||
      (!d.published && !req.auth!.permissions.includes("documents.manage"))
    ) {
      res.status(404).json({ error: "DOCUMENT_NOT_FOUND" });
      return;
    }
    const managesDocuments = req.auth!.permissions.includes("documents.manage");
    const allowed =
      d.audience === "ALL" ||
      d.audience === req.auth!.role ||
      req.auth!.role === "SUPER_ADMIN" ||
      (req.auth!.role === "ADMIN" &&
        managesDocuments &&
        d.audience !== "SUPER_ADMIN");
    if (!allowed) {
      res.status(403).json({ error: "DOCUMENT_FORBIDDEN" });
      return;
    }
    const p = full(d.file_path);
    if (!p) {
      res.status(500).json({ error: "INVALID_STORAGE_PATH" });
      return;
    }
    const bytes = await verifiedBytes(p, d.sha256, Number(d.file_size));
    res.setHeader("Cache-Control", "private, no-store");
    res.type(d.mime_type);
    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(d.title + ext(d.mime_type))}`,
    );
    res.send(bytes);
  } catch (e: any) {
    if (e?.status) {
      res.status(e.status).json({ error: e.message });
      return;
    }
    next(e);
  }
});
storageRouter.get("/students/:studentId/photo", async (req, res, next) => {
  try {
    const id = Number(req.params.studentId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).end();
      return;
    }
    let allowed =
      req.auth!.role === "ADMIN" ||
      req.auth!.role === "SUPER_ADMIN" ||
      req.auth!.studentId === id;
    if (req.auth!.role === "GURU" && req.auth!.teacherId) {
      const [s]: any = await db.query(
        `SELECT 1 FROM student_enrollments se JOIN academic_years ay ON ay.id=se.academic_year_id AND ay.is_active=1 WHERE se.student_id=? AND se.status='ACTIVE' AND (EXISTS(SELECT 1 FROM teaching_assignments ta WHERE ta.teacher_id=? AND ta.class_id=se.class_id AND ta.academic_year_id=se.academic_year_id AND ta.active=1) OR EXISTS(SELECT 1 FROM homeroom_assignments ha WHERE ha.teacher_id=? AND ha.class_id=se.class_id AND ha.academic_year_id=se.academic_year_id AND ha.active=1)) LIMIT 1`,
        [id, req.auth!.teacherId, req.auth!.teacherId],
      );
      allowed = !!s[0];
    }
    if (!allowed) {
      res.status(403).end();
      return;
    }
    const [rows]: any = await db.query(
      `SELECT photo_path,photo_sha256 FROM students WHERE id=? LIMIT 1`,
      [id],
    );
    if (!rows[0]?.photo_path) {
      res.status(404).end();
      return;
    }
    const p = full(rows[0].photo_path);
    if (!p) {
      res.status(500).end();
      return;
    }
    res.setHeader("Cache-Control", "private, no-store");
    res.type(path.extname(p));
    res.send(await verifiedBytes(p, rows[0].photo_sha256));
  } catch (e: any) {
    if (e?.status) {
      res.status(e.status).json({ error: e.message });
      return;
    }
    next(e);
  }
});
