import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key);
const { data: list, error: le } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
if (le) { console.error(le); process.exit(1); }
const u = list.users.find(x => x.email === "lucas.mesas.10@gmail.com");
if (!u) { console.error("not found"); process.exit(1); }
const { error } = await sb.auth.admin.updateUserById(u.id, { password: "Laka10721072" });
if (error) { console.error(error); process.exit(1); }
console.log("ok", u.id);
