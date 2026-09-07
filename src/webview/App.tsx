import { useEffect, useState } from "react";
import HeaderMenu from "./components/HeaderMenu";
import { DBType, Views } from "./types/enums";
import QueryComponent from "./views/QueryView";
import ConnectionComponent from "./views/ConnectionView";

declare const acquireVsCodeApi: () => {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const vscode = acquireVsCodeApi();

export default function App() {
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("5432");
  const [type, setType] = useState<DBType>(DBType.POSTGRES);
  const [dbName, setDbName] = useState("ring20_db");
  const [dbUser, setDbUser] = useState("postgres");
  const [dbPass, setDbPass] = useState("");
  const [prompt, setPrompt] = useState("");
  const [connStatus, setConnStatus] = useState("Not connected");
  const [schemaInfo, setSchemaInfo] = useState("No schema loaded");
  const [output, setOutput] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<Views>(Views.CONNECTION);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case "CONNECT_SUCCESS":
          setConnStatus(`Connected to ${message.payload}`);
          break;
        case "SCHEMA_RESULT":
          setSchemaInfo(`Loaded ${message.payload.length} table(s).`);
          break;
        case "SQL_RESULT":
          setOutput(message.payload);
          break;
        case "QUERY_RESULTS":
          setOutput("Query executed successfully.");
          break;
        case "ERROR":
          setOutput(`Error: ${message.payload}`);
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const connect = () => {
    vscode.postMessage({
      type: "CONNECT_DB",
      config: {
        id: `${host}:${dbName}:${dbUser}`,
        name: dbName,
        type: type,
        host: host,
        port: Number(port) || 5432,
        database: dbName,
        user: dbUser,
      },
      password: dbPass,
    });
  };

  const fetchSchema = () => vscode.postMessage({ type: "GET_SCHEMA" });
  const generate = () => {
    if (prompt.trim()) {
      vscode.postMessage({ type: "GENERATE_SQL", prompt });
    }
  };
  const runQuery = (sql: string) => {
    vscode.postMessage({ type: "EXECUTE_QUERY", sql });
  };

  return (
    <>
      <HeaderMenu currentView={currentView} setCurrentView={setCurrentView} />
      {currentView === Views.CONNECTION && (
        <ConnectionComponent
          connStatus={connStatus}
          host={host}
          setHost={setHost}
          port={port}
          setPort={setPort}
          dbName={dbName}
          setDbName={setDbName}
          dbUser={dbUser}
          setDbUser={setDbUser}
          dbPass={dbPass}
          setDbPass={setDbPass}
          connect={connect}
          fetchSchema={fetchSchema}
          schemaInfo={schemaInfo}
          type={type}
          setType={setType}
        />
      )}
      {currentView === Views.QUERY && (
        <QueryComponent
          prompt={prompt}
          setPrompt={setPrompt}
          output={output}
          generate={generate}
          runQuery={runQuery}
        />
      )}
    </>
  );
}
