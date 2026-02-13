import express from "express";
import { z } from "zod";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

export const app = express();
app.use(express.json());

const PROJ_PATH = process.env.PROJ_PATH || "Projects";

/* Handle API requests to create a new student record */
const zBuildRequest = z.object({
  projectId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9.]*$/),
  fileContents: z.string(),
});
app.post("/verso/api/singlepage", (req, res) => {
  const body = zBuildRequest.safeParse(req.body);
  if (!body.success) {
    res.status(400).send({ error: "Poorly-formed request" });
  } else {
    const theLeanFile = join(PROJ_PATH, body.data.projectId, "TheLeanFile.lean");
    writeFileSync(theLeanFile, body.data.fileContents);
    // const subprocess = spawn(LAKE_BIN, ["exe", "mkdoc"], {
    const subprocess = spawn(
      join(import.meta.dirname, "bubblewrap.sh"),
      [join(PROJ_PATH, body.data.projectId)],
      {
        cwd: PROJ_PATH,
        // env: { LAKE: "/no", PATH: process.env.PATH },
      },
    );
    const output: string[] = [];
    subprocess.stdout.on("data", (data) => {
      output.push(`${data}`);
    });
    subprocess.stderr.on("data", (data) => {
      output.push(`${data}`);
    });
    let finished = false;
    subprocess.on("close", (data) => {
      if (finished) return;
      res.send({
        result: `${data}`,
        output: output,
        href: "/verso/view",
      });
    });
    subprocess.on("error", (data) => {
      finished = true;
      res.send({
        success: false,
        result: `${data}`,
        output: output,
      });
    });
  }
});

app.use("/verso/view", express.static(join(PROJ_PATH, "_out", "html-single")));
