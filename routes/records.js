const router = require("express").Router();
const pool = require("../db");

const fields = ["title", "category", "description", "status"];
const validStatuses = ["Pending", "In progress", "Completed"];

function validateRecord(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { message: "A JSON object is required." };
  }
  const record = {};
  const limits = { title: [3, 80], category: [2, 40], description: [5, 300] };
  for (const field of fields) {
    if (typeof input[field] !== "string") {
      return { message: `${field} must be a string.` };
    }
    record[field] = input[field].trim();
  }
  for (const [field, [min, max]] of Object.entries(limits)) {
    if (record[field].length < min || record[field].length > max) {
      return { message: `${field[0].toUpperCase() + field.slice(1)} must have ${min} to ${max} characters.` };
    }
  }
  if (!validStatuses.includes(record.status)) {
    return { message: "Status must be Pending, In progress, or Completed." };
  }
  return { record };
}

function parseId(req, res) {
  const raw = req.params.id;
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) > 2147483647) {
    res.status(400).json({ message: "ID must be a positive whole number." });
    return null;
  }
  return Number(raw);
}

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, title, category, description, status FROM records ORDER BY id");
    res.status(200).json(result.rows);
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  const id = parseId(req, res);
  if (id === null) return;
  try {
    const result = await pool.query("SELECT id, title, category, description, status FROM records WHERE id = $1", [id]);
    if (!result.rowCount) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  const { record, message } = validateRecord(req.body);
  if (message) return res.status(400).json({ message });
  try {
    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) VALUES ($1, $2, $3, $4) RETURNING id, title, category, description, status",
      [record.title, record.category, record.description, record.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  const id = parseId(req, res);
  if (id === null) return;
  const { record, message } = validateRecord(req.body);
  if (message) return res.status(400).json({ message });
  try {
    const result = await pool.query(
      "UPDATE records SET title=$1, category=$2, description=$3, status=$4 WHERE id=$5 RETURNING id, title, category, description, status",
      [record.title, record.category, record.description, record.status, id]
    );
    if (!result.rowCount) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  const id = parseId(req, res);
  if (id === null) return;
  try {
    const result = await pool.query("DELETE FROM records WHERE id=$1 RETURNING id", [id]);
    if (!result.rowCount) return res.status(404).json({ message: "Record not found." });
    res.status(200).json({ message: "Record deleted." });
  } catch (error) { next(error); }
});

module.exports = router;
