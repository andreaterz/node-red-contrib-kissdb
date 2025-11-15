[![Node-RED](https://img.shields.io/badge/Node--RED-Module-red.svg)](https://nodered.org)
![npm version](https://img.shields.io/npm/v/node-red-contrib-kissdb)
![license](https://img.shields.io/npm/l/node-red-contrib-kissdb)

# node-red-contrib-kissdb
A lightweight JSON-based database node for Node-RED

# 💾 KISSDB — Keep It Simple, Structured Database

**KISSDB** is a lightweight, file-backed JSON database designed for Node-RED and JavaScript environments.  
It offers elegant in-memory CRUD operations, field manipulation, time series aggregation, and export utilities — all through a single `function` node driven by `msg.action`.

## Installation
Run the following command in your Node-RED user directory:

```bash
npm install node-red-contrib-kissdb
```


---

## 📦 Database Structure

Each **KISSDB** database is a plain JSON object with two keys:

```json
{
  "lastID": 27,
  "records": [
    {
      "ID": 1,
      "Title": "This is the title 2",
      "Cathegory": "This is the cathegory",
      "Status": "Done",
      "DueDate": "2025-10-11",
      "Notes": "check a, b and c"
    }
  ]
}
```

## 🚀 Basic Usage

A `msg` with the command and the parameters is sent to the KISSDB node. KISSBD will return the full dataset updated as per command if an update is necessary. In case of a query a second node will answer to the query. The format of the answer depends to the command requested: normally it is a JSON, but can be a CSV formatted string or a simple answer (string or number).

As an example, to insert a new record into your KISSDB database, send a message to the function node with the following structure:

```js
msg.data = {
  Title: "This is the title 2",
  Cathegory: "This is the cathegory",
  Status: "Done",
  DueDate: "2025-10-11",
  Notes: "check a, b and c",
};
msg.DBFile = "/data/KissDBTest.json";
msg.action = "INSERT";
return msg;
```

## 🔗 Using KISSDB with `readFile` and `writeFile` Nodes

The **KISSDB** node is designed to work seamlessly with Node-RED’s built-in `readFile` and `writeFile` nodes to manage a lightweight JSON-based database. This setup allows you to persist data across flows and perform CRUD operations directly on a file. You just need to pay attention that the `writeFile` node needs to owerwrite completely the file in the filesystem: full rewrite is needed and not append.
This clearly puts a limit to the dimension of the dababase: it has to reside in memory and ideally, everytime a change is made, the full database is written to disk, tush reducing the performance.

---

### 🧭 Typical Flow Structure

```text
[Command Node] → [readFile] → [KISSDB] → [writeFile]
```

Normal functioning is through the command nodes that communicate the name of the .json file containing the database in the `msg.DBFile` field. The read node reads the dabatase and places it in the `msg.payload` field completeing the dataset that the node **KISSDB** receives.
**KISSDB** exports two outputs. On `Output 1`, the new complete database to be saved/written and on `Output 2` the status message to inform about the activities performed and the results.
**KISSDB** exports once again the name of the file in the field `msg.DBFile`: the write node have to overwrite at this point completely the file on the disk.

This architecture is simple and modular, this allows the user to decide if and when the database has to be written on a file or kept in memory.
An example with some support nodes, manages the database in memory and flushes it to the disk ony as a "backup".

Furthermore, passing the filename in the messages everythime, while increasing slightly the programming burden, it allows the flexibilty to manage multiple files in the same flow. This allows to simulate multiple tables (one per file) instead of having one single file that becomes big, or too big.

The model is simple: all the database is read and kept in memory (under `msg.payload`) and completely written back to the file every time. This is clearly possible with small databases:**KISSBD** is not suited for big data (or growing over time data).

An alternative approach is possible, where the DB is stored in a `flow` variable and a `dirty` wariable is set; then, on scheduled (every minute) timeframe, the database is also stored in the filesystem with a `writeFile` node.
This reduces the number of accesses and write operation to disk, but it complicats slightly the management of multiple tables (multiple JSON files).

## 📚 Available Commands

| `msg.action`               | Description                                               | Required Parameters                                                                                                            |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `CREATE`                   | Initialize an empty database                              | —                                                                                                                              |
| `INSERT`                   | Add a new record                                          | `data`                                                                                                                         |
| `UPDATE`                   | Update a record by ID                                     | `ID`, `update`                                                                                                                 |
| `DELETE`                   | Delete a record by ID                                     | `ID`                                                                                                                           |
| `FIND`                     | Search records by query                                   | `query`                                                                                                                        |
| `COUNT`                    | Count records containing a given field                    | `count.field`                                                                                                                  |
| `COUNTBYGROUP`             | Count records grouped by a field                          | `group`                                                                                                                        |
| `RENAME`                   | Rename a field                                            | `rename.from`, `rename.to`                                                                                                     |
| `REMOVE`                   | Remove a field                                            | `remove.field`                                                                                                                 |
| `ADD`                      | Add a field with a fixed value                            | `add.field`, `add.value`                                                                                                       |
| `REORDERFIELDS`            | Reorder fields in each record                             | `order`                                                                                                                        |
| `KEEPONLYFIELDS`           | Keep only selected fields (auto-keeps `ID`)               | `fields`                                                                                                                       |
| `MERGEFIELDS`              | Merge multiple fields into one                            | `merge.fields`, `merge.newField`                                                                                               |
| `SPLITFIELD`               | Split a field into multiple parts                         | `split.field`, `split.format`, `split.into`                                                                                    |
| `BEAUTIFYFIELD`            | Transform field values (e.g. trim, capitalize)            | `beautify.field`, `beautify.operation`, `beautify.options`                                                                     |
| `CONVERTTODATE`            | Create a new field with Date object                       | `field`                                                                                                                        |
| `GETUNIQUEVALUES`          | Return unique values of a field                           | `field`                                                                                                                        |
| `SORT`                     | Sort records by field                                     | `sort.field`, `sort.order`                                                                                                     |
| `FILTERBYDATERANGE`        | Filter records within a date range                        | `filter.field`, `filter.from`, `filter.to`                                                                                     |
| `SUMBYDATERANGE`           | Sum values in a date range                                | `sum.dateField`, `sum.from`, `sum.to`, `sum.valueField`                                                                        |
| `AVGBYDATERANGE`           | Average values in a date range                            | `avg.dateField`, `avg.from`, `avg.to`, `avg.valueField`                                                                        |
| `MAXBYDATERANGE`           | Max value in a date range                                 | `max.dateField`, `max.from`, `max.to`, `max.valueField`                                                                        |
| `MINBYDATERANGE`           | Min value in a date range                                 | `min.dateField`, `min.from`, `min.to`, `min.valueField`                                                                        |
| `COUNTBYDATERANGE`         | Count records in a date range                             | `count.dateField`, `count.from`, `count.to`                                                                                    |
| `TIMESERIESBYDATERANGE`    | Time series aggregation                                   | `timeseries.dateField`, `timeseries.from`, `timeseries.to`, `timeseries.valueField`, `timeseries.groupBy`, `timeseries.method` |
| `TIMESERIESCSVBYDATERANGE` | Export time series as CSV                                 | Same as above                                                                                                                  |
| `EXPORTFIELDS`             | Export **exactly two fields** from all records            | `fields` (array of 2)                                                                                                          |
| `EXPORTJSONBYDATERANGE`    | Export **exactly two fields** in JSON within a date range | `export.fields` (array of 2), `export.dateField`, `export.from`, `export.to`                                                   |
| `EXPORTCSV`                | Export **exactly two fields** to CSV                      | `fields` (array of 2)                                                                                                          |
| `EXPORTCSVBYDATERANGE`     | Export **exactly two fields** to CSV in a date range      | `export.fields` (array of 2), `export.dateField`, `export.from`, `export.to`                                                   |
| `VALIDATE`                 | Check for missing required fields                         | `requiredFields` (optional, defaults to `["ID","titolo","stato"]`)                                                             |
| `HELP`                     | List all available commands                               | —                                                                                                                              |

---

## 🛠️ Command: CREATE

Initializes a new, empty database with no records.  
This is typically used at the beginning of a flow or to reset the database file.

---

### 📦 Message Format

```js
msg.action = "CREATE";
msg.DBFile = "/data/KissDBTest.json";
return msg;
```

✅ Tip: this command has no checks: it overwrites completely the database and initialize it to zero. Be careful using it: once created the file on the filesystem the first time, my recommendation is to detatch (or even remove) the node "CREATE" from the flow in order to avoid mistakes and destroy everything.

## ➕ Command: INSERT

Adds a new record to the database.  
The `ID` is automatically assigned, and a `createdAt` timestamp is added.

---

### 📦 Message Format

```js
msg.data = {
  Title: "This is the title",
  Cathegory: "This is the cathegory",
  Status: "Done",
  DueDate: "2025-10-11",
  Notes: "check a, b and c",
};
msg.DBFile = "/data/KissDBTest.json";
msg.action = "INSERT";
return msg;
```

## ✏️ Command: UPDATE

Updates an existing record by its `ID`.  
You can modify one or more fields, and an `updatedAt` timestamp will be added automatically.

---

### 📦 Message Format

```js
msg.ID = 1;
msg.update = {
  Status: "In Progress",
  Notes: "Updated notes with new checklist",
};
msg.DBFile = "/data/KissDBTest.json";
msg.action = "UPDATE";
return msg;
```

## 🗑️ Command: DELETE

Removes a record from the database by its unique `ID`.  
This operation is permanent — once deleted, the record cannot be recovered.

---

### 📦 Message Format

```js
msg.ID = 1;
msg.DBFile = "/data/KissDBTest.json";
msg.action = "DELETE";
return msg;
```

## 🔍 Command: FIND

Searches the database for records that match a given query.  
Matching is case-insensitive and partial — useful for filtering by keywords or status.
Multiple conditions can be used in the query part: **KISSDB** interprets them as logical AND. The querying capability of KISSBD is clearly not the one of a normal database but it allows for simple queries:

---

### 📦 Message Format

```js
msg.query = {
  Status: "done",
  Cathegory: "cathegory",
};
msg.DBFile = "/data/KissDBTest.json";
msg.action = "FIND";
return msg;
```

Rusult: FIND retuns an array of records:

```js
[
  {
    ID: 1,
    Title: "This is the title 2",
    Cathegory: "This is the cathegory",
    Status: "Done",
    DueDate: "2025-10-11",
    Notes: "check a, b and c",
    createdAt: "2025-10-25T20:00:00.000Z",
  },
];
```

## 🔢 Command: COUNT

Returns the total number of records currently stored in the database that contains a certain field. If you want to count the total number of records just count `ID` field.  
Useful for monitoring database size or validating insert/delete operations.

---

### 📦 Message Format

```js
msg.count = { field: "ID" };
msg.action = "COUNT";
msg.DBFile = "/data/KissDBTest.json";
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Scans all records and checks if the given field exists.
- Returns the total number of records containing that field in `msg.payload`.
- If you want the total number of records in the database, use `field: "ID"`.

```js
msg.payload = 7;
```

## 📊 Command: COUNTBYGROUP

Counts how many records share the same value in a specified field.  
Useful for generating summaries, dashboards, or visualizations of categorical data.

---

### 🧩 Parameters

- `msg.group`: The name of the field to group by (e.g. `"Status"`, `"Category"`).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"COUNTBYGROUP"` to trigger the operation.

---

### 📦 Example

```js
msg.group = "Status";
msg.DBFile = "/data/KissDBTest.json";
msg.action = "COUNTBYGROUP";
return msg;
```

### 🧾 Behavior

- Scans all records and groups them by the value of `msg.group`.
- Returns an object in `msg.payload` where each key is a unique field value and each value is the count.

```json
{
  "Done": 5,
  "In Progress": 3,
  "Pending": 2
}
```

## ✏️ Command: RENAME

Renames a field across all records in the database.  
Useful for correcting typos, updating schema, or aligning field names with external systems.

---

### 📦 Message Format

```js
msg.action = "RENAME";
msg.DBFile = "/data/KissDBTest.json";
msg.rename = {
  from: "ExpectedDate",
  to: "ExpectedDateNew",
};
return msg;
```

## 🧹 Command: REMOVE

Deletes a specific field from all records in the database.  
Useful for cleaning up unused fields or simplifying the data structure.

---

### 📦 Message Format

```js
msg.action = "REMOVE";
msg.DBFile = "/data/KissDBTest.json";
msg.remove = {
  field: "ExpectedDateNew",
};
return msg;
```

## ➕ Command: ADD

Adds a new field to all records in the database.  
If the field already exists in a record, it will be left unchanged.  
Useful for initializing a new column or tagging all records with a default value.

---

### 📦 Message Format

```js
msg.add = { field: "Author", value: "ADDED BY NODERED" };
msg.action = "ADD";
msg.DBFile = "/data/KissDBTest.json";
return msg;
```

## 🔀 Command: REORDERFIELDS

Reorders the fields in each record according to a specified sequence.  
Useful for customizing column order before exporting or displaying data.

---

### 🧩 Parameters

- `msg.order`: An array of field names defining the desired order (e.g. `["Title", "DueDate", "Status"]`).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"REORDERFIELDS"` to trigger the operation.

---

### 📦 Example

```js
msg.order = ["Title", "DueDate", "Status"];
msg.DBFile = "/data/KissDBTest.json";
msg.action = "REORDERFIELDS";
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Reorders the fields in each record to match the sequence in `msg.order`.
- Fields not listed in `msg.order` will be omitted.
- The result is returned in `msg.payload` as an array of reordered records.

```js
[
  {
    Title: "Prepare report",
    DueDate: "2025-10-11",
    Status: "Done",
  },
  {
    Title: "Submit budget",
    DueDate: "2025-10-25",
    Status: "Pending",
  },
];
```

> ✅ **Tip:** Use `REORDERFIELDS` before `EXPORTCSV` to control column layout in the final CSV output.

## 🧼 Command: KEEPONLYFIELDS

Keeps only the specified fields in each record and removes all others.  
This is useful for slimming down the dataset before exporting or visualizing.

---

### 📦 Message Format

```js
msg.fields = ["Title", "DueDate", "Status"];
msg.DBFile = "/data/KissDBTest.json";
msg.action = "KEEPONLYFIELDS";
return msg;
```

### 🧾 Behavior

- Only the fields listed in `msg.fields` will be kept.
- The `"ID"` field is always preserved automatically, even if not listed.
- All other fields will be removed from each record.

## 🔗 Command: MERGEFIELDS

Combines multiple fields into a single new field across all records.  
Useful for creating summary fields, labels, or concatenated strings for export or display.

---

### 📦 Message Format

```js
msg.action = "MERGEFIELDS";
msg.DBFile = "/data/KissDBTest.json";
msg.merge = {
  fields: ["Title", "Category"],
  newField: "CompleteTile",
  separator: " - ",
};
return msg;
```

### 🧩 Parameters

- `merge.fields`: An array of field names to merge (e.g. `"Title"`, `"Status"`).
- `merge.newField`: The name of the new field that will contain the merged result.
- `separator`: Optional string to insert between merged values (default is a single space `" "`).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"MERGEFIELDS"` to trigger the operation.

---

### 🧾 Behavior

- The values of the listed fields are concatenated using the specified `separator`.
- If a field is missing in a record, it is skipped in that record’s merge.
- The new field is added to each record with the combined value.

## ✂️ Command: SPLITFIELD

Splits the value of a single field into multiple new fields based on a defined format.  
Useful for breaking apart compound strings like dates, names, or tags.

---

### 📦 Message Format

```js
msg.split = {
  field: "DueDate",
  format: "YYYY-MM-DD",
  into: ["Year", "Month", "Day"],
};
msg.DBFile = "/data/KissDBTest.json";
msg.action = "SPLITFIELD";
return msg;
```

### 🧩 Parameters

- `split.field`: The name of the field to split (e.g. `"DueDate"`).
- `split.format`: The format of the original value (e.g. `"YYYY-MM-DD"`, `"Name - Status"`).
- `split.into`: An array of new field names to hold the split parts.
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"SPLITFIELD"` to trigger the operation.

---

### 🧾 Behavior

- The field value is split using the format as a guide.
- The split parts are assigned to the new fields listed in `split.into`.
- If the format doesn't match or the value is missing, the new fields will be empty.
- Original field is preserved unless removed with a `REMOVE` command.

```json
{
  "DueDate": "2025-10-11",
  "Year": "2025",
  "Month": "10",
  "Day": "11"
}
```

## 🎨 Command: BEAUTIFYFIELD

Applies a transformation to a specific field across all records.  
Useful for cleaning up text, formatting values, or standardizing data before export or filtering.

---

### 📦 Message Format

```js
msg.beautify = {
  field: "Title",
  operation: "capitalize",
  options: {},
};
msg.DBFile = "/data/KissDBTest.json";
msg.action = "BEAUTIFYFIELD";
return msg;
```

### 🧩 Parameters

- `beautify.field`: The name of the field to transform (e.g. `"Title"`, `"Status"`).
- `beautify.operation`: The type of transformation to apply. Supported operations include:
  - `"trim"`: Removes leading/trailing whitespace.
  - `"lowercase"`: Converts text to lowercase.
  - `"uppercase"`: Converts text to uppercase.
  - `"capitalize"`: Capitalizes the first letter of each word.
  - `"replace"`: Replaces substrings (requires `options.from` and `options.to`).
- `beautify.options`: Optional parameters for operations like `replace`.
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"BEAUTIFYFIELD"` to trigger the transformation.

---

### 🧾 Behavior

- The specified operation is applied to the field in every record.
- If the field is missing in a record, it is skipped.
- Original values are overwritten with the transformed result.

Exemples:

#### round

```js
msg.action = "BEAUTIFYFIELD";
msg.DBFile = "/data/KissDBTest.json";
msg.beautify = {
  field: "Umidity",
  operation: "round",
};
return msg;
```

#### multiply

```js
msg.action = "BEAUTIFYFIELD";
msg.DBFile = "/data/KissDBTest.json";
msg.beautify = {
  field: "Price",
  operation: "multiply",
  options: { factor: 1.2 },
};
return msg;
```

#### abs (absolute value)

```js
msg.action = "BEAUTIFYFIELD";
msg.DBFile = "/data/KissDBTest.json";
msg.beautify = {
  field: "Umidity",
  operation: "abs",
};
return msg;
```

#### lowercase

```js
msg.action = "BEAUTIFYFIELD";
msg.DBFile = "/data/KissDBTest.json";
msg.beautify = {
  field: "Status",
  operation: "lowercase",
};
return msg;
```

#### uppercase

```js
msg.action = "BEAUTIFYFIELD";
msg.DBFile = "/data/KissDBTest.json";
msg.beautify = {
  field: "Status",
  operation: "uppercase",
};
return msg;
```

#### capitalize

```js
msg.action = "BEAUTIFYFIELD";
msg.DBFile = "/data/KissDBTest.json";
msg.beautify = {
  field: "Status",
  operation: "capitalize",
};
return msg;
```

#### trim

```js
msg.action = "BEAUTIFYFIELD";
msg.DBFile = "/data/KissDBTest.json";
msg.beautify = {
  field: "Notes",
  operation: "trim",
};
return msg;
```

#### replace

```js
msg.action = "BEAUTIFYFIELD";
msg.DBFile = "/data/KissDBTest.json";
msg.beautify = {
  field: "Status",
  operation: "replace",
  options: { from: "TO DO", to: "To Do!" },
};
return msg;
```

#### dateformat (example 1)

```js
msg.action = "BEAUTIFYFIELD";
msg.DBFile = "/data/KissDBTest.json";
msg.beautify = {
  field: "DueDate",
  operation: "dateformat",
  options: { format: "DD/MM/YYYY" },
};
return msg;
```

#### dateformat (example 2)

```js
msg.action = "BEAUTIFYFIELD";
msg.DBFile = "/data/KissDBTest.json";
msg.beautify = {
  field: "DueDate",
  operation: "dateformat",
  options: { format: "YYYY-MM-DD" },
};
return msg;
```

## 📅 Command: CONVERTTODATE

Creates a new field containing a JavaScript `Date` object based on an existing string field.  
Useful for enabling date-based filtering, sorting, and time series operations.

---

### 📦 Message Format

```js
msg.field = "DueDate";
msg.DBFile = "/data/KissDBTest.json";
msg.action = "CONVERTTODATE";
return msg;
```

### 🧩 Parameters

- `field`: The name of the field containing a date string (e.g. `"DueDate"`).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"CONVERTTODATE"` to trigger the conversion.

---

### 🧾 Behavior

- The specified field is parsed into a JavaScript `Date` object.
- A new field named `field + "Obj"` is added to each record (e.g. `"DueDateObj"`).
- If the original value is invalid or missing, the new field will be `null`.

## 🧮 Command: GETUNIQUEVALUES

Retrieves all unique values found in a specified field across the database.  
Useful for building dropdowns, filters, or understanding the range of categories in your data.

---

### 📦 Message Format

```js
msg.action = "GETUNIQUEVALUES";
msg.DBFile = "/data/KissDBTest.json";
msg.field = "Status";
return msg;
```

### 🧩 Parameters

- `unique.field`: The name of the field to scan for unique values (e.g. `"Status"`, `"Category"`).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"GETUNIQUEVALUES"` to trigger the operation.

---

### 🧾 Behavior

- Scans all records and collects distinct values from the specified field.
- Returns an array of unique values in `msg.payload`.
- If the field is missing in all records, the result will be an empty array.

```json
["Done", "In Progress", "Pending"]
```

## 🔃 Command: SORT

This command allows for massive interventions in the .json file.
the aim is to organize the records based on some criteria.
This simplifies readibility if you want to access directly the .json file in the filesystem for any reason,
This command sorts all records in the database by a specified field.  
Supports both ascending (`asc`) and descending (`desc`) order.  
Works with numeric, string, and date fields.

---

### 📦 Message Format

```js
msg.sort = {
  field: "DueDate",
  order: "asc",
};
msg.DBFile = "/data/KissDBTest.json";
msg.action = "SORT";
return msg;
```

### 🧾 Behavior

- Records missing the sort field are ignored during comparison.
- Sorting is case-insensitive for strings.
- Numeric and date fields are sorted by value.

✅ Tip: Use `SORT` before exporting or visualizing data to ensure consistent order.

## 📆 Command: FILTERBYDATERANGE

Filters records based on whether a date field falls within a specified start and end range.  
Useful for extracting time-based subsets of your data, such as upcoming tasks or historical logs.

---

### 📦 Message Format

```js
msg.action = "FILTERBYDATERANGE";
msg.DBFile = "/data/KissDBTest.json";
msg.filter = {
  field: "DueDateObj",
  from: "2025-10-01",
  to: "2025-10-31",
};
return msg;
```

### 🧩 Parameters

- `filter.field`: The name of the field containing a JavaScript `Date` object (e.g. `"DueDateObj"`).
- `filter.from`: Start of the date range (inclusive), in ISO format (`YYYY-MM-DD`).
- `filter.to`: End of the date range (inclusive), in ISO format (`YYYY-MM-DD`).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"FILTERBYDATERANGE"` to trigger the operation.

---

### 🧾 Behavior

- Only records where the specified field is a valid `Date` and falls within the range are kept.
- Records with missing or invalid date values are excluded.
- The result is returned in `msg.payload` as an array of matching records.

```json
[
  {
    "ID": 1,
    "Title": "Prepare report",
    "DueDate": "2025-10-11",
    "DueDateObj": "2025-10-11T00:00:00.000Z"
  },
  {
    "ID": 2,
    "Title": "Submit budget",
    "DueDate": "2025-10-25",
    "DueDateObj": "2025-10-25T00:00:00.000Z"
  }
]
```

## ➕ Command: SUMBYDATERANGE

Calculates the total sum of a numeric field across all records within a specified date range.  
Useful for aggregating values like expenses, hours, or quantities over time.

---

### 🧩 Parameters

- `msg.field`: The name of the numeric field to sum (e.g. `"Amount"`, `"Hours"`).
- `msg.datefield`: The name of the date field to filter by (e.g. `"DueDate"`).
- `msg.start`: Start date in `YYYY-MM-DD` format (inclusive).
- `msg.end`: End date in `YYYY-MM-DD` format (inclusive).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"SUMBYDATERANGE"` to trigger the operation.

---

### 📦 Example

```js
msg.action = "SUMBYDATERANGE";
msg.DBFile = "/data/KissDBTest.json";
msg.sum = {
  dateField: "DueDate",
  from: "2025-11-01",
  to: "2025-12-31",
  valueField: "Amount",
};
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Filters records where `msg.datefield` falls between `msg.start` and `msg.end` (inclusive).
- Sums the values of `msg.field` across all matching records.
- Returns the result in `msg.payload` as a number.
- If no records match, the result will be `0`.

```js
msg.payload = 1250.75;
```

> ✅ **Tip:** Use `SUMBYDATERANGE` to generate monthly totals, budget rollups, or time-based summaries.

## 📈 Command: AVGBYDATERANGE

Calculates the average value of a numeric field across all records within a specified date range.  
Useful for analyzing trends, performance metrics, or normalized totals over time.

---

### 🧩 Parameters

- `msg.field`: The name of the numeric field to average (e.g. `"Amount"`, `"Hours"`).
- `msg.datefield`: The name of the date field to filter by (e.g. `"DueDate"`).
- `msg.start`: Start date in `YYYY-MM-DD` format (inclusive).
- `msg.end`: End date in `YYYY-MM-DD` format (inclusive).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"AVGBYDATERANGE"` to trigger the operation.

---

### 📦 Example

```js
msg.action = "AVGBYDATERANGE";
msg.DBFile = "/data/KissDBTest.json";
msg.avg = {
  dateField: "DueDate",
  from: "2025-10-01",
  to: "2025-10-31",
  valueField: "Hours",
};
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Filters records where `msg.datefield` falls between `msg.start` and `msg.end` (inclusive).
- Averages the values of `msg.field` across all matching records.
- Returns the result in `msg.payload` as a number.
- If no records match, the result will be `0`.

```js
msg.payload = 7.25;
```

> ✅ **Tip:** Use `AVGBYDATERANGE` to monitor weekly workloads, average expenses, or normalized KPIs.

## 📊 Command: MAXBYDATERANGE

Finds the maximum value of a numeric field across all records within a specified date range.  
Useful for identifying peak values like highest expense, longest duration, or max output over time.

---

### 🧩 Parameters

- `msg.field`: The name of the numeric field to evaluate (e.g. `"Amount"`, `"Hours"`).
- `msg.datefield`: The name of the date field to filter by (e.g. `"DueDate"`).
- `msg.start`: Start date in `YYYY-MM-DD` format (inclusive).
- `msg.end`: End date in `YYYY-MM-DD` format (inclusive).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"MAXBYDATERANGE"` to trigger the operation.

---

### 📦 Example

```js
msg.action = "MAXBYDATERANGE";
msg.DBFile = "/data/KissDBTest.json";
msg.max = {
  dateField: "DueDate",
  from: "2025-10-01",
  to: "2025-10-31",
  valueField: "Amount",
};
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Filters records where `msg.datefield` falls between `msg.start` and `msg.end` (inclusive).
- Finds the highest value of `msg.field` across all matching records.
- Returns the result in `msg.payload` as a number.
- If no records match, the result will be `0`.

```js
msg.payload = 980.0;
```

> ✅ **Tip:** Use `MAXBYDATERANGE` to detect peak usage, highest cost, or longest task duration within a time window.

## 📉 Command: MINBYDATERANGE

Finds the minimum value of a numeric field across all records within a specified date range.  
Useful for identifying lowest values like minimum expense, shortest duration, or least output over time.

---

### 🧩 Parameters

- `msg.field`: The name of the numeric field to evaluate (e.g. `"Amount"`, `"Hours"`).
- `msg.datefield`: The name of the date field to filter by (e.g. `"DueDate"`).
- `msg.start`: Start date in `YYYY-MM-DD` format (inclusive).
- `msg.end`: End date in `YYYY-MM-DD` format (inclusive).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"MINBYDATERANGE"` to trigger the operation.

---

### 📦 Example

```js
msg.action = "MINBYDATERANGE";
msg.DBFile = "/data/KissDBTest.json";
msg.min = {
  dateField: "DueDate",
  from: "2025-10-01",
  to: "2025-10-31",
  valueField: "Amount",
};
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Filters records where `msg.datefield` falls between `msg.start` and `msg.end` (inclusive).
- Finds the lowest value of `msg.field` across all matching records.
- Returns the result in `msg.payload` as a number.
- If no records match, the result will be `0`.

```json
msg.payload = 1.5
```

> ✅ **Tip:** Use `MINBYDATERANGE` to detect minimum effort, lowest cost, or shortest task duration within a time window.

## 🔢 Command: COUNTBYDATERANGE

Counts how many records fall within a specified date range.  
Useful for tracking activity volume, task frequency, or event density over time.

---

### 🧩 Parameters

- `msg.datefield`: The name of the date field to filter by (e.g. `"DueDate"`).
- `msg.start`: Start date in `YYYY-MM-DD` format (inclusive).
- `msg.end`: End date in `YYYY-MM-DD` format (inclusive).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"COUNTBYDATERANGE"` to trigger the operation.

---

### 📦 Example

```js
msg.action = "COUNTBYDATERANGE";
msg.DBFile = "/data/KissDBTest.json";
msg.count = {
  dateField: "DueDate",
  from: "2025-10-01",
  to: "2025-10-31",
};
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Filters records where `msg.datefield` falls between `msg.start` and `msg.end` (inclusive).
- Counts how many records match the criteria.
- Returns the result in `msg.payload` as a number.
- If no records match, the result will be `0`.

```js
msg.payload = 12;
```

✅ **Tip:** Use `COUNTBYDATERANGE` to measure task volume, submission frequency, or event density across time windows.

## 📈 Command: TIMESERIESBYDATERANGE

Generates a time series count of records grouped by day, week, or month within a specified date range.  
Useful for visualizing trends, activity spikes, or historical distributions.

---

### 📦 Message Format

```js
msg.timeseries = {
  field: "DueDateObj",
  from: "2025-10-01",
  to: "2025-10-31",
  interval: "day",
};
msg.DBFile = "/data/KissDBTest.json";
msg.action = "TIMESERIESBYDATERANGE";
return msg;
```

### 🧩 Parameters

- `timeseries.field`: The name of the field containing a JavaScript `Date` object (e.g. `"DueDateObj"`).
- `timeseries.from`: Start of the date range (inclusive), in ISO format (`YYYY-MM-DD`).
- `timeseries.to`: End of the date range (inclusive), in ISO format (`YYYY-MM-DD`).
- `timeseries.interval`: Granularity of grouping — `"day"`, `"week"`, or `"month"`.
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"TIMESERIESBYDATERANGE"` to trigger the operation.

---

### 🧾 Behavior

- Records are filtered by the specified date range.
- Matching records are grouped by the selected interval.
- Returns an object in `msg.payload` with keys as time buckets and values as counts.

```json
{
  "2025-10-01": 2,
  "2025-10-11": 1,
  "2025-10-25": 3
}
```

## 📆 Command: TIMESERIESCSVBYDATERANGE

Generates a time series CSV file by aggregating values of a numeric field across a date range.  
Each row represents a single day and its corresponding total.  
Useful for plotting trends, generating reports, or feeding external dashboards.

---

### 🧩 Parameters

- `msg.field`: The name of the numeric field to aggregate (e.g. `"Amount"`, `"Hours"`).
- `msg.datefield`: The name of the date field to group by (e.g. `"DueDate"`).
- `msg.start`: Start date in `YYYY-MM-DD` format (inclusive).
- `msg.end`: End date in `YYYY-MM-DD` format (inclusive).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"TIMESERIESCSVBYDATERANGE"` to trigger the operation.

---

### 📦 Example

```js
msg.field = "Amount";
msg.datefield = "DueDate";
msg.start = "2025-10-01";
msg.end = "2025-10-07";
msg.DBFile = "/data/KissDBTest.json";
msg.action = "TIMESERIESCSVBYDATERANGE";
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Filters records where `msg.datefield` falls between `msg.start` and `msg.end` (inclusive).
- Aggregates the values of `msg.field` for each day in the range.
- Returns a CSV-formatted string in `msg.payload`, with two columns: `Date` and `Total`.
- If no records match a given day, that day will still appear with a total of `0`.

```csv
Date,Total
2025-10-01,250
2025-10-02,0
2025-10-03,180
2025-10-04,90
2025-10-05,0
2025-10-06,60
2025-10-07,0
```

✅ Tip: Use TIMESERIESCSVBYDATERANGE to feed charting tools, generate daily reports, or visualize trends.

## 📤 Command: EXPORTFIELDS

Exports **exactly two fields** from all records into a simplified array.  
Useful for extracting paired columns for reporting, filtering, or external processing.

---

### 🧩 Parameters

- `msg.fields`: An array with **exactly two field names** to export (e.g. `["Title", "Status"]`).
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"EXPORTFIELDS"` to trigger the operation.

---

### 📦 Example

```js
msg.fields = ["Title", "Status"];
msg.DBFile = "/data/KissDBTest.json";
msg.action = "EXPORTFIELDS";
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Extracts only the fields listed in `msg.fields` from each record.
- Returns the result in `msg.payload` as an array of simplified objects.
- If a field is missing in a record, it will be omitted from that object.

```json
[
  {
    "Title": "Prepare report",
    "Status": "Done"
  },
  {
    "Title": "Submit budget",
    "Status": "Pending"
  }
]
```

✅ **Tip:** Use `EXPORTFIELDS` before `EXPORTCSV` to limit which columns appear in the final CSV

## 📤 Command: EXPORTJSONBYDATERANGE

Exports **exactly two fields** from all records within a specified date range into a JSON array.  
Useful for archiving or transferring filtered datasets with only the required columns.

---

### 📦 Message Format

```js
msg.action = "EXPORTJSONBYDATERANGE";
msg.DBFile = "/data/KissDBTest.json";
msg.export = {
  fields: ["ID", "Title"], // exactly two fields
  dateField: "DueDate",
  from: "2025-10-01",
  to: "2025-10-31",
};
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Filters records where `msg.datefield` falls between `msg.start` and `msg.end`.
- Returns only the two requested fields in `msg.payload` as an array of objects.
- Records missing either field are skipped.

```json
[
  { "ID": 5, "Title": "Prepare report" },
  { "ID": 7, "Title": "Submit budget" }
]
```

✅ **Tip:** Use `EXPORTJSONBYDATERANGE` to archive filtered records, share datasets, or feed external APIs.

## 📤 Command: EXPORTCSV

Generates a CSV string from the database using a custom separator and optional field selection.  
Useful for exporting structured data to spreadsheets or external systems.

---

### 🧩 Parameters

- `export.datafields`: _(Optional)_ An array of field names to include in the CSV output (e.g. `["Title", "DueDate"]`).
- `export.separator`: _(Optional)_ A string used to separate columns in the CSV (e.g. `","`, `";"`, `"|"`). Defaults to comma if not specified.
- `msg.DBFile`: Path to the JSON file where the database is stored.
- `msg.action`: Must be `"EXPORTCSV"` to trigger the operation.

---

### 📦 Example

```js
msg.export = {
  datafields: ["Title", "DueDate"],
  separator: ";",
};
msg.DBFile = "/data/KissDBTest.json";
msg.action = "EXPORTCSV";
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Generates a CSV string using the chosen separator.
- If `export.datafields` is provided, only those fields are included as columns.
- If `export.datafields` is omitted, all fields from the first record are used.
- The result is returned in `msg.payload` as a plain-text CSV.
- If the database is empty, the result will be an empty string.

```csv
Title;DueDate
Prepare report;2025-10-11
Submit budget;2025-10-25
```

✅ **Tip:** Use `SORT` or `FILTERBYDATERANGE` before exporting if you want to refine the dataset, but note that `EXPORTCSV` always reads directly from the full database file.

## 📤 Command: EXPORTCSVBYDATERANGE

Exports **exactly two fields** from all records within a specified date range into a CSV string.  
Useful for generating filtered CSV reports for Excel, Google Sheets, or BI dashboards.

---

### 📦 Message Format

```js
msg.action = "EXPORTCSVBYDATERANGE";
msg.DBFile = "/data/KissDBTest.json";
msg.export = {
  fields: ["ID", "Status"], // exactly two fields
  dateField: "DueDate",
  from: "2025-10-01",
  to: "2025-10-31",
};
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- Filters records where `msg.datefield` falls between `msg.start` and `msg.end` (inclusive).
- Converts the matching records into CSV format, including headers.
- Returns the result in `msg.payload` as a CSV-formatted string.
- If no records match, the result will be a CSV string with only headers.

```csv
ID,Status
5,Done
7,Pending
```

## ✅ Command: VALIDATE

Checks the integrity of the database by verifying that required fields exist in each record.  
Useful for debugging and ensuring consistency.

---

### 📦 Message Format

```js
msg.action = "VALIDATE";
msg.DBFile = "/data/KissDBTest.json";
msg.requiredFields = ["ID", "Title", "Status"];
return msg;
```

### 🧾 Behavior

- Reads the full database from the specified file.
- For each record, checks whether all required fields are present.
- Returns an array of objects in `msg.payload`, each containing:
  - `ID`: the record ID
  - `missing`: an array of missing field names
- If all records are valid, the result is an empty array.

### 📊 Example Output

```json
[
  { "ID": 3, "missing": ["Status"] },
  { "ID": 7, "missing": ["Title"] }
]
```

in case of success this is the ouput:

```json
{
  "payload": [],
  "info": "Command VALIDATE: 0 incomplete records"
}
```

✅ **Tip:** Use `VALIDATE` after manual edits or migrations to ensure the database remains consistent and error-free.

