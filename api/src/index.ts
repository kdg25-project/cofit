import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/*", cors());

const routes = app.get("/hello", (c) => {
  return c.json({ message: "Hello from Hono on Workers!" });
});

export default app;
export type AppType = typeof routes;
