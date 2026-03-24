import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const [country, setCountry] = useState("");
  const navigate = useNavigate();

  return (
    <div className="search-bar">
      <input
        placeholder="Enter country name"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />
      <button onClick={() => navigate(`/country/${encodeURIComponent(country.trim())}`)}>
        Search
      </button>
    </div>
  );
}

export default SearchBar;
