
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const app = express();

// Allow Express to recognize HTTPS behind Render's proxy
app.set("trust proxy", 1);

const origins = (process.env.CLIENT_ORIGINS || "")
  .split(",").map(value => value.trim()).filter(Boolean);
app.use(cors({ origin: origins }));
app.use(express.json());

app.get("/", (req, res) => {
  const base = `${req.protocol}://${req.get("host")}`;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const routes = [
    ["GET", "/", "API guide"], ["GET", "/health", "Health and database check"],
    ["GET", "/api/records", "Get all proposals"], ["GET", "/api/records/:id", "Get one proposal"],
    ["POST", "/api/records", "Create a proposal"], ["PUT", "/api/records/:id", "Update a proposal"],
    ["DELETE", "/api/records/:id", "Delete a proposal"]
  ];
  const rows = routes.map(([method, path, description]) => `<tr><td>${method}</td><td><code>${path}</code></td><td>${description}</td></tr>`).join("");
  res.type("html").send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MU EventHub API</title><style>body{font:16px Arial,sans-serif;color:#192f49;background:#f5f8fd;max-width:850px;margin:40px auto;padding:0 20px;line-height:1.6}h1{color:#071b38}table{border-collapse:collapse;width:100%;background:white}th,td{border:1px solid #ccd9e6;padding:10px;text-align:left}th{background:#071b38;color:white}pre{background:#e8f3ff;padding:16px;overflow:auto}a{color:#086dcc}</style></head><body><h1>MU EventHub API</h1><p><strong>Project:</strong> Student Event Proposals System</p><p><strong>Student number:</strong> ${esc(process.env.STUDENT_NUMBER || "202404379")}</p><p>This independent Node.js API stores and manages fictional student event proposals using a PostgreSQL database.</p><p><strong>Base URL:</strong> <code>${esc(base)}</code></p><p><a href="/health">Health check</a> · <a href="/api/records">View all records</a></p><h2>Available routes</h2><table><thead><tr><th>Method</th><th>Route</th><th>Purpose</th></tr></thead><tbody>${rows}</tbody></table><h2>Record format</h2><p>Send all four editable string fields in POST and PUT: title (3–80 characters), category (2–40), description (5–300), and status (exactly Pending, In progress, or Completed). The database generates the positive integer id; do not send it.</p><pre>${esc(JSON.stringify({title:"Campus Coding Workshop",category:"Academic",description:"A practical workshop for students to learn basic coding skills.",status:"Pending"},null,2))}</pre><h2>Response codes</h2><p>200: successful GET, PUT or DELETE; 201: created; 400: invalid input or malformed JSON; 404: missing record or route; 500: unexpected server error; 503: database health check failed.</p><p>When the service has been idle, the first request may take time to start.</p></body></html>`);
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ message: "Server and database are working." });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({ message: "Database unavailable." });
  }
});

app.use("/api/records", require("./routes/records"));
app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Malformed JSON request body." });
  }
  console.error("Unexpected error:", error);
  res.status(500).json({ message: "Unexpected server error." });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
