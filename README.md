# hyper-deliveries

A small, real service that exists so that [Hyper](https://hyper.asiflow.ai) can open **public pull requests** for the
Solutions pages (`/for/engineers`, `/for/it`, `/solutions/apps`). Every delivery there links to a PR in this repository,
with the verification check and the evidence it produced — so the pages show work you can inspect, not a GIF.

The service is a ledger API on Node's built-in HTTP server: entries with an amount in cents and a memo, and a derived
balance. Strict TypeScript, tests with Vitest, CI on every pull request.

```
npm ci
npm test
npm run dev        # http://localhost:3000/health
```

Routes: `GET /health` · `GET /entries` · `POST /entries` · `GET /entries/:id` · `GET /balance`.

Pull requests opened by Hyper are left open or merged on purpose, as the public record behind each delivery card.
Human contributions are welcome but the repository's job is to stay small enough that any PR is readable in a minute.

© ASI Flow, Inc. · MIT
