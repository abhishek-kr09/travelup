import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    country: "",
    category: "Rooms"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/listings", form);
      navigate("/listings");
    } catch (err) {
      alert("Failed to create listing");
    }
  };

  return (
    <div>
      <h2>Create Listing</h2>

      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} />
        <input name="description" placeholder="Description" onChange={handleChange} />
        <input name="price" placeholder="Price" onChange={handleChange} />
        <input name="location" placeholder="Location" onChange={handleChange} />
        <input name="country" placeholder="Country" onChange={handleChange} />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}
