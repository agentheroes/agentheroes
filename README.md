<p align="center">
  <a href="https://agentheroes.ai" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
    <img alt="AgentHeroes Logo" src="assets/logo-light.svg" width="280"/>
  </picture>
  </a>
</p>

<div align="center">
  <strong>
  <h2>Generate, animate and schedule your AI characters</h2>
  </strong>
</div>

<p align="center">
  <br />
  <a href="https://docs.agentheroes.ai" rel="dofollow"><strong>Explore the docs »</strong></a>
  <br />

  <br/>
    <a href="https://agentheroes.ai">Website</a>
  </p>
<br />

<p align="center">
  <video src="https://github.com/user-attachments/assets/727f21ff-4516-4c6b-b76f-b3bf0041158b" width="100%" />
</p>


# Intro

- Train LoRA models on images using known services like: Fal.ai and Replicate
- Generate pictures either on trained models or different models
- Convert the pictures into videos
- Schedule your videos to social media (currently supporting X)
- Build agentic flow to automate the entire process and trigger is by schedule or with an API.

## Web research in agent flows

Add **Third Party → Web Search** after an API or schedule trigger, enter a
search query, then connect an image generation node. Web Search uses
[Parallel Search MCP](https://docs.parallel.ai/integrations/mcp/search-mcp)
over HTTP. Search runs in Fast mode without an account or API key. It appends
source excerpts and URLs to the prompt passed to following nodes, alongside any
existing prompt. No search runs unless you add a Web Search node; existing RSS
feeds, models and saved workflows keep their settings.

Queries are sent to Parallel. External source material can be inaccurate or
contain instructions; review generated content before publishing. Anonymous usage
has limits. Search errors stop that workflow branch rather than generating with
missing research. Each MCP request has a 30-second timeout and follows the
workflow's existing retry behavior.

## Tech Stack

- PNPM (Monorepo)
- NextJS
- NestJS
- Prisma
- Redis

## Quick Start
To have the project up and running, please follow the [Quick Start Guide](https://docs.agentheroes.ai)

# License

This repository's source code is available under the [AGPL-3.0 license](LICENSE).
