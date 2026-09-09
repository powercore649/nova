import { createClient } from '@libsql/client';

const db = createClient({
  url:       process.env.TURSO_DATABASE_URL || 'libsql://turso-db-create-nova-repos-bumpify.aws-ap-northeast-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN  || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg5NTU1NDgsImlkIjoiMDFhMDg2MGUtYTgwMS03OTBhLThmY2ItM2YxYmE4MmViNzg1Iiwia2lkIjoiVVZTeEVJZ2J3bFJhSlJtUDlWZTFJZDg2clJVSHAwVWFRQW9Bb3hSa1dfUSIsInJpZCI6IjcyYjgyNTMxLTU2ZTktNGVlNS1hYmRlLTdiODJkMjdhZjg0YSJ9.VaNLgoZN83bDx-v_jd1tUzLMIo9VCiegO2RLZ33xm-vYJk6xuRWM86rAn6vzkhcKi-5EB4xl_oQ2q371YkuFDQ',
});

export default db;

export async function initRepoTables() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS repos (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT DEFAULT '',
      owner_name  TEXT NOT NULL,
      owner_id    TEXT NOT NULL,
      visibility  TEXT NOT NULL DEFAULT 'public',
      readme      TEXT DEFAULT '',
      stars       INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now')),
      UNIQUE(owner_name, name)
    );

    CREATE TABLE IF NOT EXISTS repo_files (
      id             TEXT PRIMARY KEY,
      repo_id        TEXT NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
      path           TEXT NOT NULL,
      name           TEXT NOT NULL,
      folder         TEXT DEFAULT '',
      content        TEXT NOT NULL,
      size           INTEGER DEFAULT 0,
      mime_type      TEXT DEFAULT 'application/octet-stream',
      is_text        INTEGER DEFAULT 0,
      commit_message TEXT DEFAULT 'Add file',
      uploader_name  TEXT DEFAULT 'Anonymous',
      uploader_id    TEXT DEFAULT '',
      created_at     TEXT DEFAULT (datetime('now')),
      updated_at     TEXT DEFAULT (datetime('now')),
      UNIQUE(repo_id, path)
    );

    CREATE TABLE IF NOT EXISTS repo_commits (
      id              TEXT PRIMARY KEY,
      repo_id         TEXT NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
      message         TEXT NOT NULL,
      uploader_name   TEXT DEFAULT 'Anonymous',
      uploader_id     TEXT DEFAULT '',
      files_changed   TEXT DEFAULT '[]',
      files_added     INTEGER DEFAULT 0,
      files_modified  INTEGER DEFAULT 0,
      files_deleted   INTEGER DEFAULT 0,
      sha             TEXT NOT NULL,
      created_at      TEXT DEFAULT (datetime('now'))
    );
  `);
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export { genId };

export function rowToRepo(r: Record<string, any>) {
  return {
    _id: r.id, id: r.id, name: r.name,
    description: r.description, ownerName: r.owner_name,
    ownerId: r.owner_id, visibility: r.visibility,
    readme: r.readme, stars: r.stars ?? 0, defaultBranch: 'main',
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function rowToFile(r: Record<string, any>) {
  return {
    _id: r.id, id: r.id, repoId: r.repo_id, path: r.path,
    name: r.name, folder: r.folder, content: r.content,
    size: r.size ?? 0, mimeType: r.mime_type, isText: Boolean(r.is_text),
    commitMessage: r.commit_message, uploaderName: r.uploader_name,
    uploaderId: r.uploader_id, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function rowToCommit(r: Record<string, any>) {
  let filesChanged: string[] = [];
  try { filesChanged = JSON.parse(r.files_changed || '[]'); } catch {}
  return {
    _id: r.id, id: r.id, repoId: r.repo_id, message: r.message,
    uploaderName: r.uploader_name, uploaderId: r.uploader_id,
    filesChanged, filesAdded: r.files_added ?? 0,
    filesModified: r.files_modified ?? 0, filesDeleted: r.files_deleted ?? 0,
    sha: r.sha, createdAt: r.created_at,
  };
}
