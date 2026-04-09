export default function ConfirmDialog({
  open,
  title = "Please confirm",
  message,
  onConfirm,
  onCancel,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md surface-card p-6 sm:p-7">
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>

        {message && (
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">{message}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-stone-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
