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

console.log("Server running...");
console.log("This is very very unique to see if ISOLATE is it...");

