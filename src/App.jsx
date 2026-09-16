import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Equipment from "./pages/Equipment";
import Borrow from "./pages/Borrow";
import Availability from "./pages/Availability";
import Returns from "./pages/Returns";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Equipment":
        return <Equipment />;
      case "Borrow":
        return <Borrow />;
      case "Availability":
        return <Availability />;
      case "Returns":
        return <Returns />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <section className="content">
          {renderPage()}
        </section>
      </main>
    </div>
  );
}

export default App;