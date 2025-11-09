## 📦 Example Flows

The [`examples/`](./examples) folder contains two demonstration flows for the `kissdb` node, showcasing both persistent file-based usage and volatile in-memory operation.

### 🔹 `KISSDB-BASIC.json`

This flow demonstrates all supported operations on a persistent JSON file (`/data/KissDBTest.json`):

- `CREATE`: initialize the database
- `INSERT`: add a record
- `FIND`, `UPDATE`, `DELETE`: standard CRUD operations
- `COUNT`, `ADD`, `RENAME`, `REMOVE`: structural manipulation
- `VALIDATE`: enforce required fields
- `EXPORTJSON`, `EXPORTCSV`: selective export
- `FILTERBYDATERANGE`, `COUNTBYGROUP`, `SUMBYDATERANGE`: time-based filtering and aggregation

📌 Ideal for functional testing and file system integration.

---

### 🔹 `KISSDB_in_Memory.json`

This flow uses `kissdb` in **volatile mode**, without direct disk writes:

- The database is created and stored in `flow.KISSDB`
- Changes are monitored and written to file only when needed
- Uses `flow.set`, `flow.get`, and `change` nodes to manage state

📌 Useful for temporary environments, lightweight testing, or simulations.

---

### 📥 How to Import

To import an example into Node-RED:

1. Open the Node-RED editor
2. Go to **Menu → Import → Clipboard**
3. Paste the contents of the `.json` file
4. Click **Import**

---

### 📁 File Structure

```bash
examples/
├── KISSDB-BASIC.json
└── KISSDB_in_Memory.json
