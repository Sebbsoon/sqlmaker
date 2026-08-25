import * as vscode from 'vscode';
import { Pool } from 'pg';

export interface DBConfig {
  id: string;
  name: string;
  type: 'postgres' | 'mysql' | 'sqlite';
  host?: string;
  port?: number;
  database: string;
  user?: string;
}

export class ConnectionManager {
  private activePool: Pool | null = null;
  private activeConfig: DBConfig | null = null;
  private readonly SECRET_PREFIX = 'sqlmaker.db.password.';

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Securely saves DB configuration in global state and password in SecretStorage
   */
  async saveConnection(config: DBConfig, password?: string): Promise<void> {
    const connections = this.context.globalState.get<DBConfig[]>('sqlmaker.connections', []);
    const existingIdx = connections.findIndex(c => c.id === config.id);

    if (existingIdx >= 0) {
      connections[existingIdx] = config;
    } else {
      connections.push(config);
    }

    await this.context.globalState.update('sqlmaker.connections', connections);

    if (password) {
      await this.context.secrets.store(`${this.SECRET_PREFIX}${config.id}`, password);
    }
  }

  /**
   * Connects to a target PostgreSQL database pool
   */
  async connect(config: DBConfig): Promise<void> {
    if (this.activePool) {
      await this.activePool.end();
      this.activePool = null;
      this.activeConfig = null;
    }

    const password = await this.context.secrets.get(`${this.SECRET_PREFIX}${config.id}`);

    if (config.type === 'postgres') {
      const pool = new Pool({
        user: config.user,
        host: config.host || 'localhost',
        database: config.database,
        password: password || undefined,
        port: config.port || 5432,
        ssl: false,
        connectionTimeoutMillis: 5000,
      });

      // Verify connectionhealth
      const client = await pool.connect();
      client.release();

      this.activePool = pool;
      this.activeConfig = config;
      
      vscode.window.showInformationMessage(`SQLmaker: Connected to ${config.name} (${config.database})`);
    } else {
      throw new Error(`Database type '${config.type}' is not yet supported.`);
    }
  }

  getPool(): Pool {
    if (!this.activePool) {
      throw new Error('No active database connection. Please connect to a database first.');
    }
    return this.activePool;
  }

  getActiveConfig(): DBConfig | null {
    return this.activeConfig;
  }

  async disconnect(): Promise<void> {
    if (this.activePool) {
      await this.activePool.end();
      this.activePool = null;
      this.activeConfig = null;
      vscode.window.showInformationMessage('SQLmaker: Disconnected from database.');
    }
  }
}