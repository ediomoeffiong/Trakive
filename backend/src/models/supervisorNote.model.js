const { query } = require('../config/db');

const mapNote = (row) => ({
  id: row.id,
  internId: row.intern_user_id,
  supervisorId: row.supervisor_user_id,
  title: row.title,
  content: row.content,
  category: row.category,
  color: row.color,
  isPinned: row.is_pinned,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const SupervisorNoteModel = {
  async findByIntern(internUserId, supervisorUserId) {
    const result = await query(
      `SELECT *
       FROM supervisor_intern_notes
       WHERE intern_user_id = $1 AND supervisor_user_id = $2
       ORDER BY is_pinned DESC, updated_at DESC`,
      [internUserId, supervisorUserId],
    );
    return result.rows.map(mapNote);
  },

  async upsert(internUserId, supervisorUserId, note) {
    if (note.id) {
      const result = await query(
        `UPDATE supervisor_intern_notes
         SET title = $4,
             content = $5,
             category = $6,
             color = $7,
             updated_at = NOW()
         WHERE id = $1 AND intern_user_id = $2 AND supervisor_user_id = $3
         RETURNING *`,
        [
          note.id,
          internUserId,
          supervisorUserId,
          note.title,
          note.content,
          note.category || 'General',
          note.color || 'blue',
        ],
      );
      return result.rows[0] ? mapNote(result.rows[0]) : null;
    }

    const result = await query(
      `INSERT INTO supervisor_intern_notes
         (intern_user_id, supervisor_user_id, title, content, category, color)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        internUserId,
        supervisorUserId,
        note.title,
        note.content,
        note.category || 'General',
        note.color || 'blue',
      ],
    );
    return mapNote(result.rows[0]);
  },

  async delete(internUserId, supervisorUserId, noteId) {
    const result = await query(
      `DELETE FROM supervisor_intern_notes
       WHERE id = $1 AND intern_user_id = $2 AND supervisor_user_id = $3
       RETURNING id`,
      [noteId, internUserId, supervisorUserId],
    );
    return result.rows[0] || null;
  },

  async togglePin(internUserId, supervisorUserId, noteId) {
    const result = await query(
      `UPDATE supervisor_intern_notes
       SET is_pinned = NOT is_pinned,
           updated_at = NOW()
       WHERE id = $1 AND intern_user_id = $2 AND supervisor_user_id = $3
       RETURNING *`,
      [noteId, internUserId, supervisorUserId],
    );
    return result.rows[0] ? mapNote(result.rows[0]) : null;
  },
};

module.exports = SupervisorNoteModel;
