import { randomUUID } from "crypto";
import { query } from "./db";
import type { Note } from "./types";

export type { Note };

type NoteRow = {
  id: string;
  title: string;
  body: string;
  created_at: Date;
  updated_at: Date;
};

function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export async function listNotes(userId: string): Promise<Note[]> {
  const result = await query<NoteRow>(
    `SELECT id, title, body, created_at, updated_at
     FROM notes
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId],
  );
  return result.rows.map(mapNote);
}

export async function getNote(
  userId: string,
  id: string,
): Promise<Note | null> {
  const result = await query<NoteRow>(
    `SELECT id, title, body, created_at, updated_at
     FROM notes
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  const row = result.rows[0];
  return row ? mapNote(row) : null;
}

export async function createNote(
  userId: string,
  input?: {
    title?: string;
    body?: string;
  },
): Promise<Note> {
  const id = randomUUID();
  const title = input?.title ?? "";
  const body = input?.body ?? "";
  const result = await query<NoteRow>(
    `INSERT INTO notes (id, user_id, title, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, body, created_at, updated_at`,
    [id, userId, title, body],
  );
  return mapNote(result.rows[0]);
}

export async function updateNote(
  userId: string,
  id: string,
  input: { title: string; body: string },
): Promise<Note | null> {
  const result = await query<NoteRow>(
    `UPDATE notes
     SET title = $3,
         body = $4,
         updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id, title, body, created_at, updated_at`,
    [id, userId, input.title, input.body],
  );
  const row = result.rows[0];
  return row ? mapNote(row) : null;
}

export async function deleteNote(userId: string, id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM notes WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return (result.rowCount ?? 0) > 0;
}
