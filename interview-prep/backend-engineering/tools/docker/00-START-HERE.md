# 🐳 Docker Interview Prep: Start Here

**Goal:** by the end you can *explain* Docker simply, *build* production-grade setups, and *debug* the stuff that breaks in real life.

## Your 4-day plan

| Day | Read | Do |
|-----|------|----|
| 1 | `01-core-concepts.md` | Lab 1 (Node + Postgres + Redis) |
| 2 | `02-production-practices.md` | Lab 2 (Spring Boot) + Lab 3 (Next.js) |
| 3 | `03-monolith-vs-microservices.md` | Lab 4 (microservices + gateway) |
| 4 | `04-30-bugs-and-fixes.md` | Break things on purpose, fix them, rehearse `05-interview-qa.md` out loud |

Labs live in `labs/`. Steps are in `labs/LABS.md`.

## The one-minute pitch (memorize this)

> "Docker packages an app and everything it needs (runtime, libs, config) into an **image**. Running an image gives a **container**: an isolated process that shares the host kernel, so it's light and starts in seconds. That kills 'works on my machine'. In my projects I use multi-stage builds to keep images small, non-root users, healthchecks, and Compose to run app + DB + cache locally. For microservices each service has its own image, they talk over a Docker network by service name, and config comes from environment variables, never baked into the image."

## What interviewers actually test

1. **Mental model**: image vs container, layers, why containers aren't VMs.
2. **Dockerfile skill**: caching, multi-stage, small images, security.
3. **Networking and data**: ports, networks, volumes (the #1 source of bugs).
4. **Compose**: multi-container local environments.
5. **Debugging**: "container exits immediately, what do you do?"
6. **Production thinking**: secrets, healthchecks, logs, resource limits, CI/CD.
