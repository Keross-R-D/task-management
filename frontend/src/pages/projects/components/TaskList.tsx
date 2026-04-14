import Backlog from "./Backlog";
import SearchAndFilter from "./SearchAndFilter";
import Epic from "./Epic";

const TaskList = () => {
  return (
    <div>
      <SearchAndFilter />
      <Epic />
      <Backlog />
    </div>
  );
};

export default TaskList;
