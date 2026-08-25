import type { Env } from "./types.js";
import { JSON_HEADERS } from "./lib/http.js";
import { handleCreateOrder, handleVerifyCheckout } from "./routes/checkout.js";
import { handleCheckLicense, handleVerifyLicense } from "./routes/license.js";
import { handleCreateShare, handleGetShare } from "./routes/share.js";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
      return new Response(null, { headers: JSON_HEADERS });
    }

    if (pathname === "/api/checkout/create-order" && request.method === "POST") {
      return handleCreateOrder(env);
    }

    if (pathname === "/api/checkout/verify" && request.method === "POST") {
      return handleVerifyCheckout(request, env);
    }

    if (pathname === "/api/license/verify" && request.method === "POST") {
      return handleVerifyLicense(request, env);
    }

    if (pathname === "/api/license/check" && request.method === "POST") {
      return handleCheckLicense(request, env);
    }

    if (pathname === "/api/share/create" && request.method === "POST") {
      return handleCreateShare(request, env);
    }

    const shareMatch = pathname.match(/^\/api\/share\/([a-z0-9-]+)$/);
    if (shareMatch && request.method === "GET") {
      return handleGetShare(shareMatch[1], env);
    }

    return env.ASSETS.fetch(request);
  },
};
