const BoardList = ({ list }: { list: any[] }) => {
  return (
    <div className="board-list-item">
      {list.map((item: any) => (
        <h2 className="text-4xl">{item.name}</h2>
      ))}
    </div>
  );
};

export default BoardList;
