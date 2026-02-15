import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function CreateListing() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    country: "",
    category: "Rooms"
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (image) {
      formData.append("image", image);
    }

    try {
      await API.post("/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/listings");
    } catch (err) {
      alert("Failed to create listing");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 w-full max-w-2xl p-8 rounded-2xl shadow-xl space-y-6"
      >
        <h2 className="text-3xl font-semibold text-center">
          Create New Listing
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <input
            name="title"
            placeholder="Title"
            onChange={handleChange}
            className="input"
          />

          <input
            name="price"
            type="number"
            placeholder="Price per night"
            onChange={handleChange}
            className="input"
          />

          <input
            name="location"
            placeholder="Location"
            onChange={handleChange}
            className="input"
          />

          <input
            name="country"
            placeholder="Country"
            onChange={handleChange}
            className="input"
          />

        </div>

        <textarea
          name="description"
          placeholder="Description"
          rows="4"
          onChange={handleChange}
          className="input w-full"
        />

        <select
          name="category"
          onChange={handleChange}
          className="input w-full"
        >
          <option value="Rooms">Rooms</option>
          <option value="Mountains">Mountains</option>
          <option value="Castles">Castles</option>
          <option value="Amazing pools">Amazing pools</option>
          <option value="Camping">Camping</option>
          <option value="Farms">Farms</option>
          <option value="Iconic cities">Iconic cities</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-xl hover:opacity-90 transition"
        >
          Create Listing
        </button>
      </form>
    </div>
  );
}
