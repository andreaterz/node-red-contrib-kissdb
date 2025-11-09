module.exports = function(RED) {
  function KissDBNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', function(msg) {
      // Your KISSDB logic here
      // Use msg.action, msg.DBFile, etc.
      
      
/**************************************************************
 *                                                            *
 *  ██      ██  ██  ██████   ██████    ████████  ████████     *
 *  ██     ██   ██ ██    ██ ██    ██   ██     ██ ██     ██    *
 *  ██    ██    ██ ██       ██         ██     ██ ██     ██    *
 *  ██  ██      ██  ██████   ██████    ██     ██ ████████     *
 *  ████        ██       ██       ██   ██     ██ ██     ██    *
 *  ██  ████    ██       ██       ██   ██     ██ ██     ██    *
 *  ██     ██   ██ ██    ██ ██    ██   ██     ██ ██     ██    *
 *  ██       ██ ██  ██████   ██████    ████████  ████████     *
 *                                                            *
 *                                                            *
 *         Keep It Simple, Structured, Database Base          *
 *                                                            * 
 **************************************************************/

/**************************************************************
*                         CRUD Library                        *
**************************************************************/

const lib = {
  parseDB: msg => typeof msg.payload === "string" ? JSON.parse(msg.payload) : msg.payload,
  stringifyDB: db => JSON.stringify(db, null, 2),
  getNextID: db => (db.lastID || 0) + 1,



/**************************************************************
*            CREATE REMOVE UPDATE DELETE RECORDS              *
**************************************************************/




/**************************************************************
*                         CREATE DB                      *
**************************************************************/


  DBCreate: () => ({ lastID: 0, records: [] }),




/**************************************************************
*                         INSERT NEW RECORD                   *
**************************************************************/

  insertRecord: (db, data) => {
    const ID = lib.getNextID(db);
    const record = { ID, ...data, createdAt: new Date().toISOString() };
    db.records.push(record);
    db.lastID = ID;
    return db;
  },



/**************************************************************
*                         UPDATE RECORD                       *
**************************************************************/

  updateRecord: (db, ID, changes) => {
    db.records = db.records.map(record =>
      record.ID === ID ? { ...record, ...changes, updatedAt: new Date().toISOString() } : record
    );
    return db;
  },



/**************************************************************
*                         DELETE RECORD                       *
**************************************************************/




  deleteRecord: (db, ID) => {
    db.records = db.records.filter(record => record.ID !== ID);
    return db;
  },



/**************************************************************
***************************************************************
*                      VARIOUS QUERIES                        *
***************************************************************
**************************************************************/


/**************************************************************
*                         FIND RECORDS                        *
**************************************************************/


  findRecords: (db, query) => db.records.filter(record =>
    Object.entries(query).every(([key, val]) =>
      String(record[key] || "").toLowerCase().includes(String(val).toLowerCase())
    )
  ),



  /**************************************************************
  *                         FILTER BY DATE RANGE                *
  **************************************************************/

  filterByDateRange: (db, field, from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return db.records.filter(record => {
      const value = record[field];
      if (!value) return false;
      const date = new Date(value);
      return date >= fromDate && date <= toDate;
    });
  },





/**************************************************************
*                         COUNT BY GROUP                      *
**************************************************************/

  countByGroup: (db, fieldName) => {
    if (!fieldName) return {};
    const counts = {};
    db.records.forEach(record => {
      const key = record[fieldName];
      if (key !== undefined) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  },


/**************************************************************
*                         SUM BY DATE RANGE                   *
**************************************************************/

  sumByDateRange: (db, dateField, from, to, valueField) => {
    if (!dateField || !from || !to || !valueField) return 0;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    return db.records
      .filter(record => {
        const dateValue = record[dateField];
        if (!dateValue) return false;
        const d = new Date(dateValue);
        return d >= fromDate && d <= toDate;
      })
      .reduce((sum, record) => {
        const value = parseFloat(record[valueField]);
        return !isNaN(value) ? sum + value : sum;
      }, 0);
  },



/**************************************************************
*                         AVERAGE BY DATE RANGE               *
**************************************************************/


avgByDateRange: (db, dateField, from, to, valueField) => {
  if (!dateField || !from || !to || !valueField) return 0;

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const values = db.records
    .filter(record => {
      const dateValue = record[dateField];
      if (!dateValue) return false;
      const d = new Date(dateValue);
      return d >= fromDate && d <= toDate;
    })
    .map(record => parseFloat(record[valueField]))
    .filter(val => !isNaN(val));

  if (values.length === 0) return 0;

  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
},


/**************************************************************
*                         MAX BY DATE RANGE                   *
**************************************************************/


  maxByDateRange: (db, dateField, from, to, valueField) => {
    if (!dateField || !from || !to || !valueField) return null;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const values = db.records
      .filter(record => {
        const dateValue = record[dateField];
        if (!dateValue) return false;
        const d = new Date(dateValue);
        return d >= fromDate && d <= toDate;
      })
      .map(record => parseFloat(record[valueField]))
      .filter(val => !isNaN(val));

    if (values.length === 0) return null;

    return Math.max(...values);
  },


/**************************************************************
*                         MIN BY DATE RANGE                   *
**************************************************************/

minByDateRange: (db, dateField, from, to, valueField) => {
  if (!dateField || !from || !to || !valueField) return null;

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const values = db.records
    .filter(record => {
      const dateValue = record[dateField];
      if (!dateValue) return false;
      const d = new Date(dateValue);
      return d >= fromDate && d <= toDate;
    })
    .map(record => parseFloat(record[valueField]))
    .filter(val => !isNaN(val));

  if (values.length === 0) return null;

  return Math.min(...values);
},

/**************************************************************
*                      TIME SERIES BY DATE RANGE              *
**************************************************************/

  timeseriesByDateRange: (db, dateField, from, to, valueField, groupBy, method) => {
    if (!dateField || !from || !to || !valueField || !groupBy || !method) return [];

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Funzione per formattare la data in base al tipo di raggruppamento
    const formatPeriod = (date) => {
      const d = new Date(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      switch (groupBy) {
        case "day": return `${y}-${m}-${day}`;
        case "month": return `${y}-${m}`;
        case "year": return `${y}`;
        case "week": {
          const tempDate = new Date(date);
          tempDate.setHours(0, 0, 0, 0);
          tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
          const week1 = new Date(tempDate.getFullYear(), 0, 4);
          const diff = tempDate.getTime() - week1.getTime();
          const weekNumber = Math.round((diff / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7) + 1;
          return `${tempDate.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
        }
        default: return "";
      }
    };

    // Funzione per generare tutti i periodi intermedi
    const generatePeriods = () => {
      const periods = [];
      const current = new Date(fromDate);

      while (current <= toDate) {
        periods.push(formatPeriod(current));

        switch (groupBy) {
          case "day":
            current.setDate(current.getDate() + 1);
            break;
          case "week":
            current.setDate(current.getDate() + 7);
            break;
          case "month":
            current.setMonth(current.getMonth() + 1);
            break;
          case "year":
            current.setFullYear(current.getFullYear() + 1);
            break;
        }
      }

      return [...new Set(periods)];
    };

    // Raggruppa i valori per periodo
    const grouped = {};
    db.records.forEach(record => {
      const dateValue = record[dateField];
      const value = record[valueField];
      if (!dateValue || value === undefined) return;

      const d = new Date(dateValue);
      if (d < fromDate || d > toDate) return;

      const period = formatPeriod(d);
      const num = parseFloat(value);
      if (isNaN(num)) return;

      if (!grouped[period]) grouped[period] = [];
      grouped[period].push(num);
    });

    // Calcola il valore aggregato per ogni periodo
    const allPeriods = generatePeriods();
    const result = allPeriods.map(period => {
      const values = grouped[period] || [];
      let value = 0;

      if (values.length > 0) {
        switch (method) {
          case "avg":
            value = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case "max":
            value = Math.max(...values);
            break;
          case "min":
            value = Math.min(...values);
            break;
          case "sum":
            value = values.reduce((a, b) => a + b, 0);
            break;
          case "count":
            value = values.length;
            break;
        }
      }

      return { period, value: Math.round(value * 100) / 100 };
    });

    return result;
  },

/**************************************************************
*                         GET UNIQUE VALUES                   *
**************************************************************/

getUniqueValues: (db, field) => {
  if (!field || !db.records || !Array.isArray(db.records)) return [];

  const values = db.records
    .map(record => record[field])
    .filter(v => v !== undefined && v !== null);

  const unique = [...new Set(values)];
  return unique.sort();
},



/**************************************************************
*                         COUNT BY DATE RANGE                 *
**************************************************************/


countByDateRange: (db, dateField, from, to) => {
  if (!dateField || !from || !to) return 0;

  const fromDate = new Date(from);
  const toDate = new Date(to);

  return db.records.filter(record => {
    const value = record[dateField];
    if (!value) return false;
    const date = new Date(value);
    return date >= fromDate && date <= toDate;
  }).length;
},

/**************************************************************
*                         CHART BY DATE RANGE                 *
**************************************************************/


chartDataByDateRange: (db, dateField, from, to, valueField) => {
  if (!dateField || !from || !to || !valueField) return [];

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const points = db.records
    .filter(record => {
      const dateValue = record[dateField];
      if (!dateValue) return false;
      const d = new Date(dateValue);
      return d >= fromDate && d <= toDate;
    })
    .filter(record => record.hasOwnProperty(valueField))
    .map(record => ({
      x: record[dateField],
      y: parseFloat(record[valueField])
    }))
    .filter(point => !isNaN(point.y));

  return points.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
},
















/**************************************************************
***************************************************************
*                   MANIPULATE FIELDS MASSIVELY               *
***************************************************************
**************************************************************/





/**************************************************************
*                         RENAME FIELD                        *
**************************************************************/


  renameField: (db, fromKey, toKey) => {
    if (fromKey === "ID" || toKey === "ID") return "ID_PROTECTED";
    let count = 0;
    db.records = db.records.map(record => {
      if (record.hasOwnProperty(fromKey)) {
        record[toKey] = record[fromKey];
        delete record[fromKey];
        count++;
      }
      return record;
    });
    db._renameCount = count; // valore temporaneo, utile per msg.info
    return db;
  },



/**************************************************************
*                         REMOVE FIELD                      *
**************************************************************/

  removeField: (db, fieldName) => {
    if (fieldName === "ID") return "ID_PROTECTED";
    db.records = db.records.map(record => {
      delete record[fieldName];
      return record;
    });
    return db;
  },

/**************************************************************
*                         ADD FIELD                           *
**************************************************************/


  addField: (db, fieldName, value) => {
    if (fieldName === "ID") return "ID_PROTECTED";
    db.records = db.records.map(record => {
      if (!record.hasOwnProperty(fieldName)) {
        record[fieldName] = value;
      }
      return record;
    });
    return db;
  },

/**************************************************************
*                         VALIDATE RECORDS                      *
**************************************************************/



validateRecords: (db, requiredFields = ["ID", "titolo", "stato"]) => {
  return db.records
    .filter(record => {
      const missing = requiredFields.filter(f => !record.hasOwnProperty(f));
      return missing.length > 0;
    })
    .map(record => {
      const missing = requiredFields.filter(f => !record.hasOwnProperty(f));
      return { ID: record.ID, missing };
    });
},


/**************************************************************
*                         SORT RECORDS                      *
**************************************************************/

  sortRecords: (db, field, order = "asc") => {
    if (!field || !Array.isArray(db.records)) return db;

    db.records.sort((a, b) => {
      const va = a[field];
      const vb = b[field];

      if (va === undefined || vb === undefined) return 0;

      if (typeof va === "number" && typeof vb === "number") {
        return order === "desc" ? vb - va : va - vb;
      }

      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      return order === "desc" ? sb.localeCompare(sa) : sa.localeCompare(sb);
    });

    return db;
  },



/**************************************************************
*                         MERGE FIELDS                        *
**************************************************************/


  mergeFields: (db, fields, newField, separator = " ") => {
    if (!Array.isArray(fields) || fields.length === 0 || !newField) return db;

    db.records.forEach(record => {
      const parts = fields.map(f => record[f] !== undefined ? String(record[f]) : "").filter(p => p !== "");
      record[newField] = parts.join(separator);
    });

    return db;
  },


/**************************************************************
*                         SPLIT FIELD                         *
**************************************************************/

  splitField: (db, field, format, into) => {
    if (!field || !format || !Array.isArray(into) || into.length === 0) return db;

    db.records.forEach(record => {
      const value = record[field];
      if (typeof value !== "string") return;

      let parts = [];

      if (format === "YYYY-MM-DD") {
        parts = value.split("-");
      } else if (format === "DD/MM/YYYY") {
        parts = value.split("/");
      } else if (format === "custom" && msg.split?.separator) {
        parts = value.split(msg.split.separator);
      }

      into.forEach((key, i) => {
        record[key] = parts[i] || "";
      });
    });

    return db;
  },



/**************************************************************
*                         CONVERT TO DATE WITH SUFFIX         *
**************************************************************/

convertToDateWithSuffix: (db, field) => {
  if (!field || !Array.isArray(db.records)) return db;

  const newField = `${field}_Date`;

  db.records.forEach(record => {
    const value = record[field];
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        record[newField] = d;
      }
    }
  });

  return db;
},





/**************************************************************
*                         REORDER FIELDS                      *
**************************************************************/

reorderFields: (db, order) => {
  if (!Array.isArray(order) || order.length === 0 || !Array.isArray(db.records)) return db;

  db.records = db.records.map(record => {
    const reordered = {};

    // Inserisce prima i campi indicati
    order.forEach(key => {
      if (record.hasOwnProperty(key)) {
        reordered[key] = record[key];
      }
    });

    // Aggiunge tutti gli altri campi non indicati, nell'ordine originale
    Object.keys(record).forEach(key => {
      if (!reordered.hasOwnProperty(key)) {
        reordered[key] = record[key];
      }
    });

    return reordered;
  });

  return db;
},

/**************************************************************
*                         KEEP ONLY FIELDS                      *
**************************************************************/

keepOnlyFields: (db, fields) => {
  if (!Array.isArray(fields) || fields.length === 0 || !Array.isArray(db.records)) return db;

  // Ensure "ID" is preserved
  if (!fields.includes("ID")) {
    fields = ["ID", ...fields];
  }

  db.records = db.records.map(record => {
    const filtered = {};
    fields.forEach(key => {
      if (record.hasOwnProperty(key)) {
        filtered[key] = record[key];
      }
    });
    return filtered;
  });

  return db;
},

/**************************************************************
*                         BEAUTIFY FIELDS                      *
**************************************************************/

  beautifyField: (db, field, operation, options = {}) => {
    if (!field || !operation || !Array.isArray(db.records)) return db;

    db.records.forEach(record => {
      let value = record[field];
      if (value === undefined || value === null) return;

      switch (operation) {
        case "round":
          value = parseFloat(value);
          if (!isNaN(value)) record[field] = Math.round(value);
          break;

        case "abs":
          value = parseFloat(value);
          if (!isNaN(value)) record[field] = Math.abs(value);
          break;

        case "lowercase":
          record[field] = String(value).toLowerCase();
          break;

        case "uppercase":
          record[field] = String(value).toUpperCase();
          break;

        case "trim":
          record[field] = String(value).trim();
          break;

        case "multiply":
          const factor = parseFloat(options.factor);
          value = parseFloat(value);
          if (!isNaN(value) && !isNaN(factor)) {
            record[field] = Math.round(value * factor * 100) / 100;
          }
          break;

        case "replace":
          const from = options.from || "";
          const to = options.to || "";
          record[field] = String(value).replaceAll(from, to);
          break;

        case "dateformat":
          const format = options.format || "DD/MM/YYYY";
          const str = String(value);
          if (format === "DD/MM/YYYY" && /^\d{4}-\d{2}-\d{2}$/.test(str)) {
            const [y, m, d] = str.split("-");
            record[field] = `${d}/${m}/${y}`;
          } else if (format === "YYYY-MM-DD" && /^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split("/");
            record[field] = `${y}-${m}-${d}`;
          }
          break;

        case "capitalize":
          record[field] = String(value)
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
          break;
      }
    });

    return db;
  },








/**************************************************************
***************************************************************
*                      EXPORT VARIOUS FORMATS                 *
***************************************************************
**************************************************************/





/**************************************************************
*                         EXPORT FIELDS                      *
**************************************************************/


  exportFields: (db, fields = []) => {
    if (!Array.isArray(fields) || fields.length !== 2) return [];
    const [f1, f2] = fields;
    return db.records
      .filter(record => record.hasOwnProperty(f1) && record.hasOwnProperty(f2))
      .map(record => ({
        [f1]: record[f1],
        [f2]: record[f2]
      }));
  },

/**************************************************************
*                    EXPORT JSON BY DATE RANGE                *
**************************************************************/


  exportJSONByDateRange: (db, fields = [], dateField = "", from = "", to = "") => {
    if (!Array.isArray(fields) || fields.length !== 2) return [];
    if (!dateField || !from || !to) return [];

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const [f1, f2] = fields;

    return db.records
      .filter(record => {
        const value = record[dateField];
        if (!value) return false;
        const date = new Date(value);
        return date >= fromDate && date <= toDate;
      })
      .filter(record => record.hasOwnProperty(f1) && record.hasOwnProperty(f2))
      .map(record => ({
        [f1]: record[f1],
        [f2]: record[f2]
      }));
  },




/**************************************************************
*               TIME SERIES CSV BY DATE RANGE                 *
**************************************************************/


  timeseriesCSVByDateRange: (db, dateField, from, to, valueField, groupBy, method) => {
    if (!dateField || !from || !to || !valueField || !groupBy || !method) return "";

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const formatPeriod = (date) => {
      const d = new Date(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      switch (groupBy) {
        case "day": return `${y}-${m}-${day}`;
        case "month": return `${y}-${m}`;
        case "year": return `${y}`;
        case "week": {
          const tempDate = new Date(date);
          tempDate.setHours(0, 0, 0, 0);
          tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
          const week1 = new Date(tempDate.getFullYear(), 0, 4);
          const diff = tempDate.getTime() - week1.getTime();
          const weekNumber = Math.round((diff / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7) + 1;
          return `${tempDate.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
        }
        default: return "";
      }
    };

    const generatePeriods = () => {
      const periods = [];
      const current = new Date(fromDate);

      while (current <= toDate) {
        periods.push(formatPeriod(current));
        switch (groupBy) {
          case "day": current.setDate(current.getDate() + 1); break;
          case "week": current.setDate(current.getDate() + 7); break;
          case "month": current.setMonth(current.getMonth() + 1); break;
          case "year": current.setFullYear(current.getFullYear() + 1); break;
        }
      }

      return [...new Set(periods)];
    };

    const grouped = {};
    db.records.forEach(record => {
      const dateValue = record[dateField];
      const value = record[valueField];
      if (!dateValue || value === undefined) return;

      const d = new Date(dateValue);
      if (d < fromDate || d > toDate) return;

      const period = formatPeriod(d);
      const num = parseFloat(value);
      if (isNaN(num)) return;

      if (!grouped[period]) grouped[period] = [];
      grouped[period].push(num);
    });

    const allPeriods = generatePeriods();
    const lines = ["period,value"];

    allPeriods.forEach(period => {
      const values = grouped[period] || [];
      let value = 0;

      if (values.length > 0) {
        switch (method) {
          case "avg": value = values.reduce((a, b) => a + b, 0) / values.length; break;
          case "max": value = Math.max(...values); break;
          case "min": value = Math.min(...values); break;
          case "sum": value = values.reduce((a, b) => a + b, 0); break;
          case "count": value = values.length; break;
        }
      }

      lines.push(`${period},${Math.round(value * 100) / 100}`);
    });

    return lines.join("\n");
  },




/**************************************************************
*                         EXPORT CSV                          *
**************************************************************/


exportCSV: (db, fields = [], separator = ",") => {
    if (!Array.isArray(fields) || fields.length !== 2) {
      return "Errore: servono esattamente 2 campi";
    }
    const [f1, f2] = fields;
    const header = `${f1}${separator}${f2}`;
    const rows = db.records
      .filter(record => record.hasOwnProperty(f1) && record.hasOwnProperty(f2))
      .map(record => `${record[f1]}${separator}${record[f2]}`);
    return [header, ...rows].join("\n");
  },

exportCSVByDateRange: (db, fields = [], dateField = "", from = "", to = "", separator = ",") => {
  if (!Array.isArray(fields) || fields.length !== 2) return "Errore: servono esattamente 2 campi";
  if (!dateField || !from || !to) return "Errore: intervallo data non valido";

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const [f1, f2] = fields;
  const header = `${f1}${separator}${f2}`;

  const rows = db.records
    .filter(record => {
      const dateValue = record[dateField];
      if (!dateValue) return false;
      const d = new Date(dateValue);
      return d >= fromDate && d <= toDate;
    })
    .filter(record => record.hasOwnProperty(f1) && record.hasOwnProperty(f2))
    .map(record => `${record[f1]}${separator}${record[f2]}`);

  return [header, ...rows].join("\n");
},


/**************************************************************
*                         HELP                                *
**************************************************************/


getHelpCommands: () => {
  return [
    { action: "CREATE", description: "Initialize a new empty database", params: [] },
    { action: "INSERT", description: "Add a new record to the database", params: ["data"] },
    { action: "UPDATE", description: "Update an existing record by ID", params: ["ID", "update"] },
    { action: "DELETE", description: "Delete a record by ID", params: ["ID"] },
    { action: "FIND", description: "Search records matching a query", params: ["query"] },
    { action: "COUNT", description: "Return total number of records", params: [] },
    { action: "COUNTBYGROUP", description: "Count records grouped by a field", params: ["group.field"] },
    { action: "RENAME", description: "Rename a field in all records", params: ["rename.from", "rename.to"] },
    { action: "REMOVE", description: "Remove a field from all records", params: ["remove.field"] },
    { action: "ADD", description: "Add a new field with a fixed value", params: ["add.field", "add.value"] },
    { action: "REORDERFIELDS", description: "Prioritize selected fields in record order", params: ["order"] },
    { action: "KEEPONLYFIELDS", description: "Keep only selected fields, remove others", params: ["fields"] },
    { action: "MERGEFIELDS", description: "Merge multiple fields into one", params: ["merge.fields", "merge.newField", "merge.separator"] },
    { action: "SPLITFIELD", description: "Split a field into multiple parts", params: ["split.field", "split.format", "split.into"] },
    { action: "BEAUTIFYFIELD", description: "Transform field values (e.g. round, lowercase, capitalize)", params: ["beautify.field", "beautify.operation", "beautify.options"] },
    { action: "CONVERTTODATE", description: "Create a new field with Date object from ISO string", params: ["field"] },
    { action: "GETUNIQUEVALUES", description: "Return all unique values of a field", params: ["field"] },
    { action: "SORT", description: "Sort records by a field", params: ["sort.field", "sort.order"] },
    { action: "FILTERBYDATERANGE", description: "Filter records within a date range", params: ["dateRange.field", "dateRange.from", "dateRange.to"] },
    { action: "SUMBYDATERANGE", description: "Sum values within a date range", params: ["sum.dateField", "sum.from", "sum.to", "sum.valueField"] },
    { action: "AVGBYDATERANGE", description: "Average values within a date range", params: ["avg.dateField", "avg.from", "avg.to", "avg.valueField"] },
    { action: "MAXBYDATERANGE", description: "Maximum value within a date range", params: ["max.dateField", "max.from", "max.to", "max.valueField"] },
    { action: "MINBYDATERANGE", description: "Minimum value within a date range", params: ["min.dateField", "min.from", "min.to", "min.valueField"] },
    { action: "COUNTBYDATERANGE", description: "Count records within a date range", params: ["count.dateField", "count.from", "count.to"] },
    { action: "TIMESERIESBYDATERANGE", description: "Generate time series aggregation", params: ["timeseries.dateField", "from", "to", "valueField", "groupBy", "method"] },
    { action: "TIMESERIESCSVBYDATERANGE", description: "Generate time series CSV output", params: ["timeseries.dateField", "from", "to", "valueField", "groupBy", "method"] },
    { action: "EXPORTCSV", description: "Export two fields to CSV", params: ["fields"] },
    { action: "EXPORTCSVBYDATERANGE", description: "Export two fields to CSV within date range", params: ["fields", "dateField", "from", "to"] },
    { action: "EXPORTFIELDS", description: "Export two fields from all records", params: ["fields"] },
    { action: "EXPORTJSONBYDATERANGE", description: "Export two fields in JSON within date range", params: ["fields", "dateField", "from", "to"] },
    { action: "HELP", description: "List all available commands", params: [] }
  ];
}

 };

























/**************************************************************
***************************************************************
*                       Initial Parsing                       *
***************************************************************
**************************************************************/


let db = lib.parseDB(msg);
let result = null;
let info = "";
let write = false;


/**************************************************************
***************************************************************
*                         Command Logic                       *
***************************************************************
**************************************************************/

switch ((msg.action || "").toUpperCase()) {
  case "HELP":
    result = lib.getHelpCommands();
    info = `HELP command executed: ${result.length} available actions`;
    write = false;
    break;

  case "INSERT":
    db = lib.insertRecord(db, msg.data);
    result = lib.stringifyDB(db);
    info = "Command INSERT: added record";
    write = true;
    break;

  case "UPDATE":
    db = lib.updateRecord(db, msg.ID, msg.update);
    result = lib.stringifyDB(db);
    info = `Command UPDATE: record ${msg.ID} updated`;
    write = true;
    break;

  case "DELETE":
    db = lib.deleteRecord(db, msg.ID);
    result = lib.stringifyDB(db);
    info = `Command DELETE: record ${msg.ID} removed`;
    write = true;
    break;

  case "FIND":
    const found = lib.findRecords(db, msg.query);
    result = found;
    info = `Command FIND: ${found.length} records found`;
    write = false;
    break;

  case "CREATE":
    result = lib.stringifyDB(lib.DBCreate());
    info = "Command CREATE: empty database created";
    write = true;
    break;

  case "RENAME":
    const renamed = lib.renameField(db, msg.rename.from, msg.rename.to);
    if (renamed === "ID_PROTECTED") {
      result = null;
      info = "Error: field 'ID' is reserved";
      write = false;
    } else {
      db = renamed;
      result = lib.stringifyDB(db);
      info = `Command RENAME: '${msg.rename.from}' renamed as '${msg.rename.to}' on ${db._renameCount} records`;
      delete db._renameCount;
      write = true;
    }
    break;

  case "REORDERFIELDS":
    const reorder = msg.order || [];
    db = lib.reorderFields(db, reorder);
    result = db;
    info = `Command REORDERFIELDS: fields ordered with ${reorder.join(", ")}`;
    write = true;
    break;
  
  case "KEEPONLYFIELDS":
    const keep = msg.fields || [];
    db = lib.keepOnlyFields(db, keep);
    result = db;
    info = `Command KEEPONLYFIELDS: kept only fields ${keep.join(", ")}`;
    write = true;
    break;

  case "CONVERTTODATE":
    const fieldToConvert = msg.field || "";
    db = lib.convertToDateWithSuffix(db, fieldToConvert);
    result = db;
    info = `Command CONVERTTODATE: created field '${fieldToConvert}_Date' with object Date`;
    write = true;
  break;

  case "MERGEFIELDS":
    const merge = msg.merge || {};
    db = lib.mergeFields(db, merge.fields || [], merge.newField || "", merge.separator || " ");
    result = db;
    info = `Command MERGEFIELDS: field '${merge.newField}' creatd from ${merge.fields?.join(", ")}`;
    write = true;
    break;

  case "SPLITFIELD":
    const split = msg.split || {};
    db = lib.splitField(db, split.field || "", split.format || "", split.into || []);
    result = db;
    info = `Command SPLITFIELD: field '${split.field}' split in ${split.into?.join(", ")}`;
    write = true;
    break;

  case "BEAUTIFYFIELD":
    const bf = msg.beautify || {};
    db = lib.beautifyField(db, bf.field || "", bf.operation || "", bf.options || {});
    result = db;
    info = `Command BEAUTIFYFIELD: field '${bf.field}' transformed with '${bf.operation}'`;
    write = true;
    break;

  case "GETUNIQUEVALUES":
    const field = msg.field || "";
    const uniqueValues = lib.getUniqueValues(db, field);
    result = uniqueValues;
    info = `Command GETUNIQUEVALUES: ${uniqueValues.length} distinct entries found for '${field}'`;
    write = false;
  break;

  case "REMOVE":
    const removed = lib.removeField(db, msg.remove.field);
    if (removed === "ID_PROTECTED") {
      result = null;
      info = "Error: field 'ID' is reserved";
      write = false;
    } else {
      db = removed;
      result = lib.stringifyDB(db);
      info = `Command REMOVE: field '${msg.remove.field}' removed`;
      write = true;
    }
    break;

  case "ADD":
    const added = lib.addField(db, msg.add.field, msg.add.value);
    if (added === "ID_PROTECTED") {
      result = null;
      info = "Error: field 'ID' is reserved";
      write = false;
    } else {
      db = added;
      result = lib.stringifyDB(db);
      info = `Command ADD: field '${msg.add.field}' added`;
      write = true;
    }
    break;
      case "SORT":
    db = lib.sortRecords(db, msg.sort.field, msg.sort.order);
    result = lib.stringifyDB(db);
    info = `Command SORT: order by '${msg.sort.field}' (${msg.sort.order})`;
    write = true;
    break;

  case "FILTERBYDATERANGE":
    const filtered = lib.filterByDateRange(db, msg.dateRange.field, msg.dateRange.from, msg.dateRange.to);
    result = filtered;
    info = `Command FILTERBYDATERANGE: ${filtered.length} records found`;
    write = false;
    break;

case "TIMESERIESBYDATERANGE":
  const ts = msg.timeseries || {};
  const tsResult = lib.timeseriesByDateRange(
    db,
    ts.dateField || "",
    ts.from || "",
    ts.to || "",
    ts.valueField || "",
    ts.groupBy || "day",
    ts.method || "avg"
  );
  result = tsResult;
  info = `Command TIMESERIESBYDATERANGE: ${tsResult.length} periods`;
  write = false;
  break;

case "TIMESERIESCSVBYDATERANGE":
  const tscsv = msg.timeseries || {};
  const csvResult = lib.timeseriesCSVByDateRange(
      db,
      tscsv.dateField || "",
      tscsv.from || "",
      tscsv.to || "",
      tscsv.valueField || "",
      tscsv.groupBy || "day",
      tscsv.method || "avg"
    );
  result = csvResult;
  info = `Command TIMESERIESCSVBYDATERANGE: CSV generated with ${csvResult.split("\\n").length - 1} lines`;
  write = false;
  break;


case "MAXBYDATERANGE":
    const maxDateField = msg.max?.dateField || "";
    const maxFrom = msg.max?.from || "";
    const maxTo = msg.max?.to || "";
    const maxValueField = msg.max?.valueField || "";
    const maxResult = lib.maxByDateRange(db, maxDateField, maxFrom, maxTo, maxValueField);
    result = maxResult;
    info = `Command MAXBYDATERANGE: max of '${maxValueField}' from ${maxFrom} to ${maxTo} = ${maxResult}`;
    write = false;
    break;

case "MINBYDATERANGE":
  const minDateField = msg.min?.dateField || "";
  const minFrom = msg.min?.from || "";
  const minTo = msg.min?.to || "";
  const minValueField = msg.min?.valueField || "";
  const minResult = lib.minByDateRange(db, minDateField, minFrom, minTo, minValueField);
  result = minResult;
  info = `Command MINBYDATERANGE: min of '${minValueField}' from ${minFrom} to ${minTo} = ${minResult}`;
  write = false;
  break; 

  case "SUMBYDATERANGE":
    const sumDateField = msg.sum?.dateField || "";
    const sumFrom = msg.sum?.from || "";
    const sumTo = msg.sum?.to || "";
    const sumValueField = msg.sum?.valueField || "";
    const totalSum = lib.sumByDateRange(db, sumDateField, sumFrom, sumTo, sumValueField);
    result = totalSum;
    info = `Command SUMBYDATERANGE: sum of '${sumValueField}' from ${sumFrom} to ${sumTo} = ${totalSum}`;
    write = false;
    break;

case "AVGBYDATERANGE":
  const avgDateField = msg.avg?.dateField || "";
  const avgFrom = msg.avg?.from || "";
  const avgTo = msg.avg?.to || "";
  const avgValueField = msg.avg?.valueField || "";
  const avgResult = lib.avgByDateRange(db, avgDateField, avgFrom, avgTo, avgValueField);
  result = avgResult;
  info = `Command AVGBYDATERANGE: average of '${avgValueField}' from ${avgFrom} to ${avgTo} = ${avgResult.toFixed(2)}`;
  write = false;
  break;

case "COUNTBYDATERANGE":
  const countDateField = msg.count?.dateField || "";
  const countFrom = msg.count?.from || "";
  const countTo = msg.count?.to || "";
  const countResult = lib.countByDateRange(db, countDateField, countFrom, countTo);
  result = countResult;
  info = `Command COUNTBYDATERANGE: ${countResult} records from ${countFrom} to ${countTo}`;
  write = false;
  break;
    
case "COUNT":
  const total = db.records.length;
  result = total;
  info = `Command COUNT: ${total} records found`;
  write = false;
  break;

case "COUNTBYGROUP":
    const groupField = msg.group?.field || "";
    const grouped = lib.countByGroup(db, groupField);
    result = grouped;
    info = `Command COUNTBYGROUP: ${Object.keys(grouped).length} groups found for field '${groupField}'`;
    write = false;
    break;  

case "VALIDATE":
    const invalids = lib.validateRecords(db, msg.validate.required);
    result = invalids;
    info = `Command VALIDATE: ${invalids.length} incomplete records`;
    write = false;
    break;

case "EXPORTCSV":
    const sep = msg.export?.separator || ",";
    const csv = lib.exportCSV(db, msg.export?.fields, sep);
    result = csv;
    info = `Command EXPORTCSV: ${csv.split("\n").length - 1} lines generated with separator '${sep}'`;
    write = false;
    break;

case "EXPORTJSONBYDATERANGE":
    const jsonFields = msg.export?.fields || [];
    const jsonDateField = msg.export?.dateField || "";
    const jsonFrom = msg.export?.from || "";
    const jsonTo = msg.export?.to || "";
    const jsonFiltered = lib.exportJSONByDateRange(db, jsonFields, jsonDateField, jsonFrom, jsonTo);
    result = jsonFiltered;
    info = `Command EXPORTJSONBYDATERANGE: ${jsonFiltered.length} record from ${jsonFrom} to ${jsonTo}`;
    write = false;
    break;

case "CHARTDATABYDATERANGE":
  const chartDateField = msg.chart?.dateField || "";
  const chartFrom = msg.chart?.from || "";
  const chartTo = msg.chart?.to || "";
  const chartValueField = msg.chart?.valueField || "";
  const chartData = lib.chartDataByDateRange(db, chartDateField, chartFrom, chartTo, chartValueField);
  result = chartData;
  info = `Command CHARTDATABYDATERANGE: ${chartData.length} points from ${chartFrom} to ${chartTo}`;
  write = false;
  break;



case "EXPORTCSVBYDATERANGE":
  const fields = msg.export?.fields || [];
  const dateField = msg.export?.dateField || "";
  const fromDate = msg.export?.from || "";
  const toDate = msg.export?.to || "";
  const separator = msg.export?.separator || ",";
  const csvFiltered = lib.exportCSVByDateRange(db, fields, dateField, fromDate, toDate, separator);
  result = csvFiltered;
  info = `Command EXPORTCSVBYDATERANGE: found ${csvFiltered.split("\n").length - 1} record from ${fromDate} to ${toDate}`;
  write = false;
  break;

case "EXPORTJSON":
    const selected = lib.exportFields(db, msg.export?.fields);
    result = selected;
    info = `Command EXPORTJSON : ${selected.length} record with field '${msg.export.fields.join(", ")}'`;
    write = false;
    break;
  default:
    result = null;
    info = "Error - unknown command";
    write = false;
}



/**************************************************************
*                         NODE STATUS                         *
**************************************************************/

node.status({
  fill: write ? "green" : "blue",
  shape: write ? "dot" : "ring",
  text: info.slice(0, 40)
});


/**************************************************************
*                         OUTPUT                              *
**************************************************************/

node.send([
  write ? { payload: result, DBFile: msg.DBFile } : null,
  { payload: result, info }
]);

    });
  }

 RED.nodes.registerType("kissdb", KissDBNode, {
  category: "function",
  defaults: {
    name: { value: "" }
  },
  inputs: 1,
  outputs: 2,
  icon: "file.png"
  });
};


