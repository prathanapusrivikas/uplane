import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

type Result = {
  id: string;
  processedUrl: string;
};

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error" | "deleting">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const buttonLabel = useMemo(() => {
    if (status === "uploading") return "Processing...";
    if (status === "deleting") return "Deleting...";
    return "Transform Image";
  }, [status]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(nextFile);
    setResult(null);
    setError(null);
    setCopied(false);
    if (nextFile) {
      setPreviewUrl(URL.createObjectURL(nextFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Choose an image to upload.");
      return;
    }

    setStatus("uploading");
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${apiBase}/api/images`, {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { id?: string; processedUrl?: string; message?: string };
      if (!response.ok || !payload.id || !payload.processedUrl) {
        throw new Error(payload.message || "Upload failed.");
      }

      setResult({ id: payload.id, processedUrl: payload.processedUrl });
      setStatus("error");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
      setStatus("error");
    }
  };

  const onCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.processedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard access denied. Copy the link manually.");
    }
  };

  const onDelete = async () => {
    if (!result) return;
    setStatus("deleting");
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/images/${result.id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 204) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message || "Delete failed.");
      }
      setResult(null);
      setStatus("idle");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed.";
      setError(message);
      setStatus("success");
    }
  };

  return (
    <div className="page">
      <div className="orb orb-one" aria-hidden="true" />
      <div className="orb orb-two" aria-hidden="true" />

      <header className="hero">
        <span className="eyebrow">Image Transformation Service</span>
        <h1>Erase the backdrop. Flip the frame. Share the link.</h1>
        <p>
          Upload one image and get a transparent, horizontally flipped version hosted online. We keep the
          original so you can clean everything up later.
        </p>
      </header>

      <main className="grid">
        <section className="card">
          <form className="form" onSubmit={onSubmit}>
            <label className="dropzone">
              <input type="file" accept="image/*" onChange={onFileChange} />
              <div>
                <h2>Upload your image</h2>
                <p>PNG, JPG, or WebP. Max 10MB.</p>
              </div>
              {previewUrl ? (
                <img src={previewUrl} alt="Selected preview" className="preview" />
              ) : (
                <div className="preview placeholder">Drop or browse</div>
              )}
            </label>

            <button className="primary" type="submit" disabled={status === "uploading" || status === "deleting"}>
              {buttonLabel}
            </button>
            {status === "uploading" && (
              <div className="status">
                <span className="spinner" aria-hidden="true" />
                <span>Removing background and flipping…</span>
              </div>
            )}
            {error && <div className="status error">{error}</div>}
          </form>
        </section>

        <section className="card result-card">
          <div className="result-header">
            <h2>Processed output</h2>
            <p>The transformed image is hosted and ready to share.</p>
          </div>

          {!result && (
            <div className="empty-state">
              <span>Once you process an image, the preview appears here.</span>
            </div>
          )}

          {result && (
            <div className="result-body">
              <img src={result.processedUrl} alt="Processed output" />
              <div className="link-row">
                <input type="text" value={result.processedUrl} readOnly />
                <button className="ghost" type="button" onClick={onCopy}>
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
              <button className="danger" type="button" onClick={onDelete} disabled={status === "deleting"}>
                Delete from storage
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
