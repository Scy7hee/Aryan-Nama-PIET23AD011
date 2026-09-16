function Header({ activePage, setActivePage }) {
  return (
    <header className="header">
      <div>
        <h1>{activePage}</h1>

        <p>
          Manage your AV equipment efficiently.
        </p>
      </div>

      <button
        className="header-button"
        onClick={() => setActivePage("Borrow")}
      >
        + New Borrowing
      </button>
    </header>
  );
}

export default Header;