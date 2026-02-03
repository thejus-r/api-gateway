import express, { type Request, type Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
  console.log("[API_SERVER]: ", req.method);
  res.send(200);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API SERVER - running on port ${PORT}`));
