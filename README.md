What is DBGuard?

DBGuard is an application that periodically checks the state of your databases and sends notifications when specific conditions are met. It is useful for catching bad or unexpected data that can cause applications to crash, or for alerting a team when data meets any criteria that warrants attention.

DBGuard supports multiple database engines including SQL Server, PostgreSQL, SQLite, and MySQL.

Monitoring is performed through Guards — each Guard runs a user-defined SQL query on a periodic schedule and compares the result to a user-defined expression. Since the core logic and business rules are written in SQL, the application remains decoupled and simple to configure.

When a Guard's expression evaluates to true, it can trigger zero or more notifications via SMTP (email) or HTTP (webhooks to other applications or APIs). DBGuard also includes a built-in SPA web application for configuring, testing, and auditing Guards and their execution history.

The source code is available as well as a docker image at: https://hub.docker.com/repository/docker/leonardocodes/dbguard
