import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import CustomSelect from "../components/CustomSelect";
import HeaderTitle from "../components/HeaderTitle";
import { DBType } from "../types/enums";

type ConnectionViewProps = {
  connStatus: string | null;
  host: string;
  setHost: React.Dispatch<React.SetStateAction<string>>;
  port: string;
  setPort: React.Dispatch<React.SetStateAction<string>>;
  dbName: string;
  setDbName: React.Dispatch<React.SetStateAction<string>>;
  dbUser: string;
  setDbUser: React.Dispatch<React.SetStateAction<string>>;
  dbPass: string;
  setDbPass: React.Dispatch<React.SetStateAction<string>>;
  connect: () => void;
  fetchSchema: () => void;
  schemaInfo: string | null;
  type: DBType;
  setType: React.Dispatch<React.SetStateAction<DBType>>;
};

const ConnectionView = ({
  connStatus,
  host,
  setHost,
  port,
  setPort,
  dbName,
  setDbName,
  dbUser,
  setDbUser,
  dbPass,
  setDbPass,
  connect,
  fetchSchema,
  schemaInfo,
  type,
  setType,
}: ConnectionViewProps) => {
  return (
    <div>
      <HeaderTitle title="Database Connection" />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <CustomInput
          value={host}
          onChange={(value) => setHost(value)}
          label="Host"
        />
        <CustomInput
          value={port}
          onChange={(value) => setPort(value)}
          label="Port"
          type="number"
        />
        <CustomSelect
          options={Object.values(DBType)}
          value={type}
          onChange={(value) => setType(value as DBType)}
          label="Database Type"
        />
        <CustomInput
          value={dbName}
          onChange={(value) => setDbName(value)}
          label="Database Name"
        />
        <CustomInput
          value={dbUser}
          onChange={(value) => setDbUser(value)}
          label="User"
        />
        <CustomInput
          value={dbPass}
          onChange={(value) => setDbPass(value)}
          label="Password"
          type="password"
        />

        <CustomButton onClick={connect} label="Save & Connect" />
        <div>{connStatus}</div>

        <CustomButton onClick={fetchSchema} label="Load / Inspect Schema" />
        <div>{schemaInfo}</div>
      </div>
    </div>
  );
};

export default ConnectionView;
