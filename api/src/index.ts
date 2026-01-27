import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./db";
import { createAuth } from "./lib/auth";
import { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:3000", "https://cofit.kdgn.tech"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

const routes = app
  .get("/hello", (c) => {
    return c.json({ message: "Hello from Hono on Workers!" });
  })
  .get("/users", async (c) => {
    const db = createDb(c.env.DB);

    const result = await db.query.user.findMany();
    return c.json(result);
  });

export default app;
export type AppType = typeof routes;
