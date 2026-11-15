import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./ManageTables.css";

const ManageTables = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    tableNumber: "",
    capacity: "",
  });

  const fetchTables = async () => {
    try {
      const res = await API.get(`/tables/${restaurantId}/my-tables`);
      setTables(res.data.tables || []);
      setRestaurant(res.data.restaurant || null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [restaurantId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTable = async (e) => {
    e.preventDefault();

    if (Number(formData.tableNumber) < 1 || Number(formData.capacity) < 1) {
      alert("Table number and capacity must be at least 1");
      return;
    }

    try {
      setSaving(true);

      await API.post(`/tables/${restaurantId}`, {
        tableNumber: Number(formData.tableNumber),
        capacity: Number(formData.capacity),
      });

      setFormData({ tableNumber: "", capacity: "" });
      fetchTables();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add table");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (table) => {
    try {
      await API.patch(`/tables/${restaurantId}/${table._id}`, {
        isActive: !table.isActive,
      });
      fetchTables();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update table");
    }
  };

  const deleteTable = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;

    try {
      await API.delete(`/tables/${restaurantId}/${id}`);
      fetchTables();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete table");
    }
  };

  const activeCount = tables.filter((t) => t.isActive).length;
  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);

  return (
    <>
      <Navbar />

      <main className="tables-page">
        <section className="tables-hero">
          <button
            className="tables-back-btn"
            onClick={() => navigate("/owner/restaurants")}
          >
            ← Back to My Restaurants
          </button>

          <span>TABLE MANAGEMENT</span>
          <h1>{restaurant?.name || "Manage Tables"}</h1>
          <p>Add tables, set their capacity and control availability.</p>
        </section>

        <section className="tables-container">
          <div className="tables-stats">
            <div className="tables-stat">
              <h3>{tables.length}</h3>
              <p>Total Tables</p>
            </div>

            <div className="tables-stat">
              <h3>{activeCount}</h3>
              <p>Active Tables</p>
            </div>

            <div className="tables-stat">
              <h3>{totalSeats}</h3>
              <p>Total Seats</p>
            </div>
          </div>

          <div className="tables-layout">
            <form className="add-table-card" onSubmit={handleAddTable}>
              <h2>Add New Table</h2>
              <p>Enter table details below.</p>

              <label>Table Number</label>
              <input
                type="number"
                name="tableNumber"
                min="1"
                placeholder="e.g. 1"
                value={formData.tableNumber}
                onChange={handleChange}
                required
              />

              <label>Capacity (Seats)</label>
              <input
                type="number"
                name="capacity"
                min="1"
                placeholder="e.g. 4"
                value={formData.capacity}
                onChange={handleChange}
                required
              />

              <button type="submit" disabled={saving}>
                {saving ? "Adding..." : "+ Add Table"}
              </button>
            </form>

            <div className="tables-list-section">
              <div className="tables-list-heading">
                <h2>Your Tables</h2>
                <p>{tables.length} tables in this restaurant</p>
              </div>

              {loading ? (
                <p className="tables-message">Loading tables...</p>
              ) : tables.length === 0 ? (
                <div className="tables-empty">
                  <h3>No Tables Yet</h3>
                  <p>Add your first table using the form to start getting bookings.</p>
                </div>
              ) : (
                <div className="tables-grid">
                  {tables.map((table) => (
                    <div className="table-card" key={table._id}>
                      <div className="table-card-top">
                        <div className="table-icon">🍽️</div>

                        <span
                          className={`table-status ${
                            table.isActive ? "active" : "inactive"
                          }`}
                        >
                          {table.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <h3>Table {table.tableNumber}</h3>
                      <p>Capacity: {table.capacity} people</p>

                      <div className="table-actions">
                        <button
                          className="toggle-table-btn"
                          onClick={() => toggleStatus(table)}
                        >
                          {table.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          className="delete-table-btn"
                          onClick={() => deleteTable(table._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ManageTables;