import express from "express";
import { z } from "zod";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "child_process";

export const app = express();
app.use(express.json());

const PROJ_PATH = process.env.PROJ_PATH || join("Projects", "stable");

/* Handle API requests to create a new student record */
const zBuildRequest = z.object({
  projectId: z.string(),
  fileContents: z.string(),
});
app.post("/verso/api/singlepage", (req, res) => {
  const body = zBuildRequest.safeParse(req.body);
  if (!body.success) {
    res.status(400).send({ error: "Poorly-formed request" });
  } else {
    const theLeanFile = join(PROJ_PATH, "TheLeanFile.lean");
    writeFileSync(theLeanFile, body.data.fileContents);

    const subprocess = spawn("lake", ["exe", "mkdoc"], { cwd: PROJ_PATH });
    const output: string[] = [];
    subprocess.on("data", (data) => {
      output.push(`${data}`);
    });
    subprocess.on("error", (data) => {
      output.push(`<|${data}|>}`);
    });
    subprocess.on("exit", () => {
      res.send({
        success: true,
        output: output.join(""),
        href: "/verso/view",
      });
    });
    subprocess.on("error", () => {
      res.send({
        success: false,
        output: output.join(""),
      });
    });
  }
});

app.use("/verso/view", express.static(join(PROJ_PATH, "_out", "html-single")));
