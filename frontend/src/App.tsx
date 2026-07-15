import { RouterProvider, createBrowserRouter } from "react-router";
import routes from "./utils/routes";
import "./App.css";

function App() {
  const router = createBrowserRouter(routes);
  return (
    <div className="app-component">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
