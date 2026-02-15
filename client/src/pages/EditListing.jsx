import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    country: "",
    category: "Rooms",
    image: null, // 👈 add image field
  });

  useEffect(() => {
    fetchListing();
  }, []);

  const fetchListing = async () => {
    const res = await API.get(`/listings/${id}`);
    setForm(res.data.data);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      await API.put(`/listings/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/listings/${id}`);
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-2xl space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Edit Listing</h2>

        {/* ✅ Show existing image preview */}
        {form.image?.url && (
          <img
            src={form.image.url}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl mb-4"
          />
        )}

        {/* ✅ File input for new image */}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) =>
            setForm({ ...form, image: e.target.files[0] })
          }
          className="w-full p-3 border rounded-lg"
        />

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        <input
          name="country"
          value={form.country}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        <button className="w-full bg-black text-white py-3 rounded-lg">
          Update Listing
        </button>
      </form>
    </div>
  );
}