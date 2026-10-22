const BoardList = ({ list }: { list: any[] }) => {
  return (
    <div className="board-list-item">
      <ul>
        {list.map((item: any) => (
          <li key={item.id}>
            <h2 className="text-4xl">{item.name}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoardList;
