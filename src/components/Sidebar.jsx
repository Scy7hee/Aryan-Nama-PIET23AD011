function Sidebar({ activePage, setActivePage }) {
  const pages = [
    "Dashboard",
    "Equipment",
    "Borrow",
    "Availability",
    "Returns",
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>AVGear</h2>
        <span>College AV Room</span>
      </div>

      <nav className="sidebar-nav">
        {pages.map((page) => (
          <button
            key={page}
            className={`nav-item ${
              activePage === page ? "active" : ""
            }`}
            onClick={() => setActivePage(page)}
          >
            {page}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;