const stylesheet = `
  .header-title {
    margin: 0;
  }
`;

const HeaderTitle = ({ title }: { title: string }) => {
  return (
    <>
      <style>{stylesheet}</style>
      <h3 className="header-title">{title}</h3>
    </>
  );
};

export default HeaderTitle;