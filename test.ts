import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

const kv = await Deno.openKv();

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

// Update
router.put("/items/:id", async (ctx) => {
  const id = ctx.params.id;
  const { data } = await ctx.request.body().value;
  await kv.set(["items", id], data);
  ctx.response.body = { id, data };
});

// Delete
router.delete("/items/:id", async (ctx) => {
  const id = ctx.params.id;
  await kv.delete(["items", id]);
  ctx.response.status = 204;
});

// List all
router.get("/items", async (ctx) => {
  const items = [];
  for await (const entry of kv.list({ prefix: ["items"] })) {
    items.push({ id: entry.key[1], data: entry.value });
  }
  ctx.response.body = items;
});

// Nuke
router.post("/api/clear-all", async (ctx) => {
  const promises = [];
  for await (const entry of kv.list({ prefix: [] })) {
    promises.push(kv.delete(entry.key));
  }
  await Promise.all(promises);
  ctx.response.body = { message: "All entries cleared" };
});

// Add this new route to serve the HTML file
router.get("/clear-all", (ctx) => {
  ctx.response.body = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.
0">
        <title>Clear KV Entries</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            button {
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <button id="clearButton">Clear All Entries</button>

        <script>
            document.getElementById('clearButton').addEventListener('click'
, async () => {
                try {
                    const response = await fetch('/api/clear-all', { method
: 'POST' });
                    const result = await response.json();
                    alert(result.message);
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred while clearing entries');
                }
            });
        </script>
    </body>
    </html>
  `;
});

console.log("Starting server...");
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({port:8000});
console.log("Server running...");
console.log("This is very very unique to see if ISOLATE is it...");

