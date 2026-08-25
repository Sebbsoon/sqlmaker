import { Pool } from "pg";

export interface ColumnMeta {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  foreignTable?: string;
  foreignColumn?: string;
}

export interface TableMeta {
  tableName: string;
  columns: ColumnMeta[];
}

export class PostgresExtractor {
  private schemaCache: TableMeta[] | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minute cache TTL

  /**
   * Fetches schema metadata from the database, utilizing an in-memory cache.
   */
  async getSchema(
    pool: Pool,
    forceRefresh: boolean = false,
  ): Promise<TableMeta[]> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.schemaCache &&
      now - this.lastFetchTime < this.CACHE_TTL_MS
    ) {
      return this.schemaCache;
    }

    const query = `
      SELECT 
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN TRUE ELSE FALSE END AS is_primary_key,
        kcu2.table_name AS foreign_table,
        kcu2.column_name AS foreign_column
      FROM information_schema.columns c
      LEFT JOIN information_schema.key_column_usage kcu
        ON c.table_schema = kcu.table_schema
        AND c.table_name = kcu.table_name
        AND c.column_name = kcu.column_name
      LEFT JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
        AND kcu.table_schema = tc.table_schema
        AND tc.constraint_type = 'PRIMARY KEY'
      LEFT JOIN information_schema.referential_constraints rc
        ON kcu.constraint_name = rc.constraint_name
      LEFT JOIN information_schema.key_column_usage kcu2
        ON rc.unique_constraint_name = kcu2.constraint_name
        AND kcu.ordinal_position = kcu2.ordinal_position
      WHERE c.table_schema = 'public'
      ORDER BY c.table_name, c.ordinal_position;
    `;

    const { rows } = await pool.query(query);
    this.schemaCache = this.groupMetadataByTable(rows);
    this.lastFetchTime = now;
    return this.schemaCache;
  }

  /**
   * Transforms raw SQL information_schema rows into structured TableMeta objects.
   */
  private groupMetadataByTable(rows: any[]): TableMeta[] {
    const tablesMap = new Map<string, ColumnMeta[]>();

    for (const row of rows) {
      if (!tablesMap.has(row.table_name)) {
        tablesMap.set(row.table_name, []);
      }

      const cols = tablesMap.get(row.table_name)!;
      // Prevent duplicate column entries caused by multiple constraints
      if (!cols.some((c) => c.columnName === row.column_name)) {
        cols.push({
          columnName: row.column_name,
          dataType: row.data_type,
          isNullable: row.is_nullable === "YES",
          isPrimaryKey: Boolean(row.is_primary_key),
          foreignTable: row.foreign_table || undefined,
          foreignColumn: row.foreign_column || undefined,
        });
      }
    }

    return Array.from(tablesMap.entries()).map(([tableName, columns]) => ({
      tableName,
      columns,
    }));
  }

  /**
   * Compresses schema into a minimal token-efficient DDL string.
   * Example output:
   * CREATE TABLE users (id integer PK, email varchar, dept_id integer FK->departments.id);
   */
  formatAsCompactDDL(tables: TableMeta[]): string {
    return tables
      .map((table) => {
        const colDefs = table.columns
          .map((col) => {
            let def = `${col.columnName} ${col.dataType}`;
            if (col.isPrimaryKey) {
              def += " PK";
            }
            if (col.foreignTable && col.foreignColumn) {
              def += ` FK->${col.foreignTable}.${col.foreignColumn}`;
            }
            return def;
          })
          .join(", ");

        return `CREATE TABLE ${table.tableName} (${colDefs});`;
      })
      .join("\n");
  }

  /**
   * Clears in-memory cache when database switches or disconnects.
   */
  clearCache(): void {
    this.schemaCache = null;
    this.lastFetchTime = 0;
  }
}
