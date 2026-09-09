import { sql } from '@vercel/postgres';

export { sql };

/**
 * Initialize repo tables if they don't exist yet.
 * Call this at the top of any repo API route.
 */
export async function initRepoTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS repos (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name        TEXT NOT NULL,
      description TEXT DEFAULT '',
      owner_name  TEXT NOT NULL,
      owner_id    TEXT NOT NULL,
      visibility  TEXT NOT NULL DEFAULT 'public',
      readme      TEXT DEFAULT '',
      stars       INTEGER DEFAULT 0,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(owner_name, name)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS repo_files (
      id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      repo_id        TEXT NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
      path           TEXT NOT NULL,
      name           TEXT NOT NULL,
      folder         TEXT DEFAULT '',
      content        TEXT NOT NULL,
      size           INTEGER DEFAULT 0,
      mime_type      TEXT DEFAULT 'application/octet-stream',
      is_text        BOOLEAN DEFAULT false,
      commit_message TEXT DEFAULT 'Add file',
      uploader_name  TEXT DEFAULT 'Anonymous',
      uploader_id    TEXT DEFAULT '',
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(repo_id, path)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS repo_commits (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      repo_id         TEXT NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
      message         TEXT NOT NULL,
      uploader_name   TEXT DEFAULT 'Anonymous',
      uploader_id     TEXT DEFAULT '',
      files_changed   TEXT[] DEFAULT '{}',
      files_added     INTEGER DEFAULT 0,
      files_modified  INTEGER DEFAULT 0,
      files_deleted   INTEGER DEFAULT 0,
      sha             TEXT NOT NULL,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

/** Convert snake_case row to camelCase object */
export function rowToRepo(r: any) {
  return {
    _id: r.id,
    id: r.id,
    name: r.name,
    description: r.description,
    ownerName: r.owner_name,
    ownerId: r.owner_id,
    visibility: r.visibility,
    readme: r.readme,
    stars: r.stars,
    defaultBranch: 'main',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function rowToFile(r: any) {
  return {
    _id: r.id,
    id: r.id,
    repoId: r.repo_id,
    path: r.path,
    name: r.name,
    folder: r.folder,
    content: r.content,
    size: r.size,
    mimeType: r.mime_type,
    isText: r.is_text,
    commitMessage: r.commit_message,
    uploaderName: r.uploader_name,
    uploaderId: r.uploader_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function rowToCommit(r: any) {
  return {
    _id: r.id,
    id: r.id,
    repoId: r.repo_id,
    message: r.message,
    uploaderName: r.uploader_name,
    uploaderId: r.uploader_id,
    filesChanged: r.files_changed || [],
    filesAdded: r.files_added,
    filesModified: r.files_modified,
    filesDeleted: r.files_deleted,
    sha: r.sha,
    createdAt: r.created_at,
  };
}
