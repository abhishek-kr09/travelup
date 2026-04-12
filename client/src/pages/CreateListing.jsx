import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function CreateListing() {
  const navigate = useNavigate();
  const TONE_OPTIONS = [
    { label: "Warm & Premium", value: "warm, premium, and trustworthy" },
    { label: "Family Friendly", value: "friendly, welcoming, and family-oriented" },
    { label: "Luxury", value: "luxurious, elegant, and sophisticated" },
    { label: "Budget Friendly", value: "practical, affordable, and clear" },
  ];

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    country: "",
    category: "Rooms"
  });

  const [image, setImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiTone, setAiTone] = useState(TONE_OPTIONS[0].value);
  const [aiDrafts, setAiDrafts] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
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

    if (submitting) return;

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (image) {
      formData.append("image", image);
    }

    try {
      setSubmitting(true);
      await API.post("/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Listing created successfully");
      navigate("/listings");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
      <form
        onSubmit={handleSubmit}
        className="surface-card w-full max-w-2xl p-5 sm:p-8 space-y-6"
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
            placeholder="Description"
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
          className="w-full text-sm text-zinc-600 dark:text-zinc-300"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {submitting && (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {submitting ? "Creating listing..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
