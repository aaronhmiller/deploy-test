import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

// Use Deno.openKv()
const kv = await Deno.openKv();

// Function to get the next ID
async function getNextId(): Promise<string> {
  const key = ["counter"];
  const result = await kv.get<number>(key);
  const nextId = (result.value ?? 0) + 1;
  await kv.set(key, nextId);
  return nextId.toString();
}

const app = new Application();
const router = new Router();

// Create
router.post("/items", async (ctx) => {
  const { data } = await ctx.request.body().value;
  const id = await getNextId();
  await kv.set(["items", id], data);
  ctx.response.body = { id, data };
});

// Read
router.get("/items/:id", async (ctx) => {
  const id = ctx.params.id;
  const data = await kv.get(["items", id]);
  if (data.value) {
    ctx.response.body = { id, data: data.value };
  } else {
    ctx.response.status = 404;
  }
});

console.log("Server running...");
console.log("This is very very unique to see if ISOLATE is it...");

