# Foodiary 🍽️

**Foodiary** is a serverless food tracking service designed to help users log and monitor their daily meals. Built with modern cloud-native tools, it leverages the scalability and flexibility of serverless architecture combined with a type-safe development experience.

---

## 🧰 Tech Stack

- **TypeScript** – Strongly typed JavaScript for scalable, maintainable code.
- **Serverless Framework** – Infrastructure as code to deploy and manage AWS Lambda functions with ease.
- **AWS Lambda** – Run backend logic without managing servers.
- **Drizzle ORM** – Type-safe SQL ORM for clean and safe database access.
- **Neon Database** – Serverless Postgres with modern features like branching and bottomless storage.

- **Push the Drizzle schema to the database**

```bash
npx drizzle-kit push
```

- **Start the local development server with hot reload**

```bash
sls offline start --reloadHandler
```

- **Deploy the latest changes to AWS**

```bash
sls deploy
```

