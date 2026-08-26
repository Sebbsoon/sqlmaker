# SQLmaker — AI PostgreSQL DBA Assistant

**SQLmaker** brings natural language-to-SQL translation, schema-aware query generation, and execution directly into VS Code. Powered by a dual AI engine, SQLmaker uses native VS Code Language Models (GitHub Copilot) or direct OpenAI integrations to generate accurate, context-aware PostgreSQL queries in seconds.

---

## Features

* **Schema-Aware Generation**: Automatically extracts and compresses active database schema DDL to supply high-precision context to the AI.
* **Dual AI Engine**:
  * **Native VS Code Language Models**: Works out-of-the-box with active GitHub Copilot logins.
  * **Direct OpenAI Fallback**: Use your own API key stored securely in VS Code `SecretStorage`.
* **Sidebar Assistant Pane**: Connect to databases, view schema metadata, generate queries from natural language prompts, and execute results in a unified panel.
* **Inline Comment Translation**: Translate comments in `.sql` files directly into valid SQL queries using quick commands.
* **Chat Participant (`@sqlmaker`)**: Interact directly inside the VS Code Chat panel to generate or explain complex queries.

---

## Quick Start

### 1. Install & Open SQLmaker
Open the SQLmaker icon in the VS Code Activity Bar (Sidebar) to open the assistant panel.

### 2. Configure Database Connection
Enter your PostgreSQL credentials directly in the **Database Connection** panel:
* **Host**: `localhost` (or server address)
* **Port**: `5432`
* **Database**: `your_database_name`
* **User**: `postgres`
* **Password**: `your_password`

Click **Save & Connect**. Credentials are stored securely using VS Code's native keytar integration.

### 3. Generate & Run Queries
1. Click **Load / Inspect Schema** to index table structures.
2. Type your request in natural language (e.g., *"Show top 5 users by total orders with active status"*).
3. Click **Generate SQL**.
4. Review the generated query and click **Run Query** to view tabular results.

---

## Commands

Access these commands from the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

| Command | Description |
| :--- | :--- |
| `SQLmaker: Set OpenAI API Key` | Save your OpenAI API Key into secure storage (fallback mode). |
| `SQLmaker: Add Database Connection` | Configure connection parameters via command prompts. |
| `SQLmaker: Fetch Database Schema` | Trigger a manual schema extraction and refresh cache. |
| `SQLmaker: Translate Inline Comment to SQL` | Converts highlighted comment text in an active editor into SQL. |
| `SQLmaker: Check Connected Language Models` | Verifies available `vscode.lm` models. |

---

## Chat Participant Usage

If GitHub Copilot or Language Model access is enabled, invoke SQLmaker directly in the VS Code Chat drawer:

* `@sqlmaker /generate Show all workouts completed in the last 30 days`
* `@sqlmaker /explain` (with an active query selected in your editor)

---

## Requirements

* **VS Code**: `v1.85.0` or higher.
* **Database**: PostgreSQL 12+.
* **AI Access**: Active GitHub Copilot subscription **OR** an OpenAI API Key.

---

## Security & Privacy

* **Schema Context Only**: SQLmaker extracts table names, column names, and data types to construct compact DDL prompts. **Your actual database rows are never sent to AI models.**
* **Local Processing**: Database credentials are saved using VS Code's encrypted secret storage and never leaves your environment.