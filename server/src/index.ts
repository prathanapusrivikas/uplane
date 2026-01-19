import express from "express";
import cors from "cors";
import { config } from "./config";
import { imagesRouter } from "./routes/images";
import { HttpError } from "./utils/errors";

const app = express();

app.use(
  cors({
    origin: config.corsOrigin
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/images", imagesRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: string }).code;
    if (code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: "file_too_large",
        message: "File is too large. Max size is 10MB."
      });
      return;
    }
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.code || "request_error",
      message: err.message
    });
    return;
  }

  res.status(500).json({
    error: "server_error",
    message: "Unexpected server error."
  });
});

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
