import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    country: "",
    category: "Rooms",
    image: null,
  });

  useEffect(() => {
    fetchListing();
  }, []);

  const fetchListing = async () => {
    const res = await API.get(`/listings/${id}`);
    const data = res.data.data;

    // 🔥 Keep preview separate
    setPreview(data.image?.url || "");

    // 🔥 Only keep editable fields
    setForm({
      title: data.title || "",
      description: data.description || "",
      price: data.price || "",
      location: data.location || "",
      country: data.country || "",
      category: data.category || "Rooms",
      image: null, // always reset
    });
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

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("location", form.location);
      formData.append("country", form.country);
      formData.append("category", form.category);

      // 🔥 Only send file if new image selected
      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      await API.put(`/listings/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/listings/${id}`);
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
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

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl mb-4"
          />
        )}

        {/* File Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setForm({ ...form, image: file });
              setPreview(URL.createObjectURL(file));
            }
          }}
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
