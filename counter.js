/**
 * Minified by jsDelivr using Terser v5.39.0.
 * Original file: /npm/counterapi@2.1.2/dist/counter.esm.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import axios from "axios";

const API_CONFIG = {
    v1: {
        baseUrl: "https://api.counterapi.dev/v1",
        endpoints: {
            up: "/{namespace}/{name}/up",
            down: "/{namespace}/{name}/down",
            get: "/{namespace}/{name}",
            set: "/{namespace}/{name}/?count={value}"
        }
    },
    v2: {
        baseUrl: "https://api.counterapi.dev/v2",
        endpoints: {
            up: "/{workspace}/{name}/up",
            down: "/{workspace}/{name}/down",
            get: "/{workspace}/{name}",
            reset: "/{workspace}/{name}/reset",
            stats: "/{workspace}/{name}/stats"
        }
    }
};

class AxiosHttpClient {
    constructor(e) {
        this.version = e.version, this.accessToken = e.accessToken, this.client = axios.create({
            baseURL: API_CONFIG[this.version].baseUrl,
            timeout: e.timeout || 1e4,
            headers: {"Content-Type": "application/json", ...e.accessToken && {Authorization: `Bearer ${e.accessToken}`}}
        }), e.debug && this.client.interceptors.request.use((e => (console.log("[CounterAPI] Request:", {
            method: e.method?.toUpperCase(),
            url: e.url,
            headers: e.headers,
            data: e.data
        }), e))), this.client.interceptors.response.use((t => (e.debug && console.log("[CounterAPI] Response:", {
            status: t.status,
            data: t.data
        }), t)), (t => {
            e.debug && console.log("[CounterAPI] Error:", {
                status: t.response?.status,
                data: t.response?.data,
                message: t.message
            });
            throw {
                message: t.response?.data?.message || t.message || "Request failed",
                status: t.response?.status,
                code: t.response?.data?.code || t.code,
                details: t.response?.data
            }
        }))
    }

    createUrl(e, t) {
        let s = e;
        for (const [e, r] of Object.entries(t)) s = s.replace(`{${e}}`, String(r));
        return s
    }

    async get(e, t) {
        return (await this.client.get(e, t)).data
    }

    async post(e, t, s) {
        return (await this.client.post(e, t, s)).data
    }
}

class Counter {
    constructor(e) {
        if (this.version = e.version || "v2", "v2" === this.version ? this.namespace = e.workspace || e.namespace || "" : this.namespace = e.namespace || "", !this.namespace) throw "v2" === this.version ? new Error("Workspace is required for v2 API") : new Error("Namespace is required for v1 API");
        this.http = new AxiosHttpClient({
            version: this.version,
            timeout: e.timeout,
            debug: e.debug,
            accessToken: e.accessToken
        })
    }

    async get(e) {
        if (!e) throw new Error("Counter name is required");
        const t = this.createEndpointUrl("get", {name: e});
        return await this.http.get(t)
    }

    async up(e) {
        if (!e) throw new Error("Counter name is required");
        const t = this.createEndpointUrl("up", {name: e});
        return await this.http.get(t)
    }

    async down(e) {
        if (!e) throw new Error("Counter name is required");
        const t = this.createEndpointUrl("down", {name: e});
        return await this.http.get(t)
    }

    async set(e, t) {
        if ("v1" !== this.version) throw new Error("set method is only available in v1");
        if (!e) throw new Error("Counter name is required");
        const s = this.createEndpointUrl("set", {name: e, value: t});
        return await this.http.get(s)
    }

    async reset(e) {
        if ("v2" !== this.version) throw new Error("reset method is only available in v2");
        if (!e) throw new Error("Counter name is required");
        const t = this.createEndpointUrl("reset", {name: e});
        return await this.http.get(t)
    }

    async stats(e) {
        if ("v2" !== this.version) throw new Error("stats method is only available in v2");
        if (!e) throw new Error("Counter name is required");
        const t = this.createEndpointUrl("stats", {name: e});
        return await this.http.get(t)
    }

    createEndpointUrl(e, t) {
        const s = API_CONFIG[this.version].endpoints;
        let r;
        if ("v1" === this.version) {
            r = s[e]
        } else {
            r = s[e]
        }
        if (!r) throw new Error(`Invalid method: ${e}`);
        const n = "v1" === this.version ? "namespace" : "workspace", a = {[n]: this.namespace, ...t};
        return this.http.createUrl(r, a)
    }
}

const CounterClient = Counter;
export {Counter, CounterClient};
//# sourceMappingURL=/sm/2cd30c03f6aded4c8036290391f2b07942fb4071e93e8bffd8b241e3d168cc3c.map
