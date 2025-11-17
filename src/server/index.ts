import { Hono } from "hono";

import { rpcApp } from "./routes/rpc";
import { clientEntry } from "./routes/client-entry";
import { startReminderScheduler } from "./lib/reminder-scheduler";

const app = new Hono();

app.route("/rpc", rpcApp);
app.get("/*", clientEntry);

startReminderScheduler();

export default app;
