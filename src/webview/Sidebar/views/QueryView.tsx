import HeaderTitle from "../components/HeaderTitle";
import CustomTextarea from "../components/CustomTextarea";
import CustomButton from "../components/CustomButton";
import QueryOutput from "../components/QueryOutput";

type QueryViewProps = {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  output: string | null;
  generate: () => void;
  runQuery: (sql: string) => void;
};

const QueryView = ({
  prompt,
  setPrompt,
  output,
  generate,
  runQuery,
}: QueryViewProps) => {
  return (
    <div>
      <HeaderTitle title="Query" />

      <CustomTextarea
        value={prompt}
        onChange={setPrompt}
        placeholder="Text here..."
      />

      <CustomButton onClick={generate} label="Generate SQL" />
      <QueryOutput output={output} runQuery={runQuery} />
    </div>
  );
};

export default QueryView;
