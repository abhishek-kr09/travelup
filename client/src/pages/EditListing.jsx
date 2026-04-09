import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const TONE_OPTIONS = [
    { label: "Warm & Premium", value: "warm, premium, and trustworthy" },
    { label: "Family Friendly", value: "friendly, welcoming, and family-oriented" },
    { label: "Luxury", value: "luxurious, elegant, and sophisticated" },
    { label: "Budget Friendly", value: "practical, affordable, and clear" },
  ];

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
  const [generating, setGenerating] = useState(false);
  const [aiTone, setAiTone] = useState(TONE_OPTIONS[0].value);
  const [aiDrafts, setAiDrafts] = useState([]);

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

  const handleGenerateDescription = async () => {
    try {
      setGenerating(true);
      const res = await API.post("/ai/generate-description", {
        title: form.title,
        location: form.location,
        country: form.country,
        category: form.category,
        price: form.price,
        tone: aiTone,
      });

      const generated = res.data?.data?.description;
      if (!generated) {
        toast.error("Could not generate description right now");
        return;
      }

      setForm((prev) => ({ ...prev, description: generated }));
      setAiDrafts((prev) => {
        const next = [generated, ...prev.filter((d) => d !== generated)];
        return next.slice(0, 3);
      });
      toast.success("Description generated with AI");
    } catch (err) {
      toast.error(err?.response?.data?.message || "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyDraft = async (draft) => {
    try {
      await navigator.clipboard.writeText(draft);
      toast.success("Draft copied");
    } catch {
      toast.error("Could not copy draft");
    }
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
      toast.error(err?.response?.data?.message || "Failed to edit");
    }
  };

  return (
    <div className="flex justify-center items-center py-4 sm:py-8 px-2 sm:px-4">
      <form
        onSubmit={handleSubmit}
        className="surface-card p-5 sm:p-8 w-full max-w-2xl space-y-4"
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
          className="w-full p-3 border border-stone-300 dark:border-zinc-700 rounded-lg bg-stone-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-300"
        />

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="input"
        />

        <div>
          <label className="block text-sm mb-2 text-zinc-600 dark:text-zinc-400">
            AI tone
          </label>
          <select
            value={aiTone}
            onChange={(e) => setAiTone(e.target.value)}
            className="input w-full"
          >
            {TONE_OPTIONS.map((tone) => (
              <option key={tone.value} value={tone.value}>
                {tone.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <textarea
            name="description"
            rows="5"
            value={form.description}
            onChange={handleChange}
            className="input w-full pr-36"
          />

          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={generating}
            className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition disabled:opacity-50"
          >
            {generating && (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {generating ? "Generating" : form.description ? "Regenerate with AI" : "Generate with AI"}
            {generating && <span className="animate-pulse">...</span>}
          </button>
        </div>

        {aiDrafts.length > 0 && (
          <div className="rounded-xl border border-stone-300 dark:border-zinc-700 p-3 sm:p-4 bg-stone-100 dark:bg-zinc-800 space-y-3">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recent AI drafts</p>
            <div className="space-y-2">
              {aiDrafts.map((draft, idx) => (
                <div
                  key={`${draft.slice(0, 24)}-${idx}`}
                  className="w-full text-left text-xs sm:text-sm rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900 px-3 py-2 transition"
                >
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, description: draft }))}
                    className="w-full text-left hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    {draft.slice(0, 110)}...
                  </button>

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopyDraft(draft)}
                      className="text-[11px] sm:text-xs px-2 py-1 rounded-md border border-stone-300 dark:border-zinc-600 hover:bg-stone-200 dark:hover:bg-zinc-800 transition"
                    >
                      Copy draft
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          className="input"
        />

        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          className="input"
        />

        <input
          name="country"
          value={form.country}
          onChange={handleChange}
          className="input"
        />

        <button className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg">
          Update Listing
        </button>
      </form>
    </div>
  );
}
