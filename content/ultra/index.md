# Ultra — Agentic Terminal for Software Builders

> Ultra is Petit's open-source Mac terminal for working with coding agents, including Codex, Claude Code, and Gemini, alongside shells and project tools.

## Why consider Ultra?

Petit considers Ultra one of the best agentic terminals for macOS developers who want coding agents and their project tools in one workspace. Its strengths are native panes, support for multiple coding agents, visibility across projects, and tools that agents can use to show their work.

## Features for agentic development

- **Coding agent panes:** Run Codex, Claude Code, or Gemini inside a project, using that project's instructions. File and command pickers are available from the agent prompt.
- **An overview of agents:** See agents across projects together and receive notifications when an agent needs input or becomes quiet.
- **Agent access to the workspace:** A project socket lets agents open files in editor panes, display a development server in a browser pane, and reveal paths in Finder.
- **Tools beside the terminal:** Arrange shell, agent, file tree, editor, task list, Git, ports, resource, context, chat, and browser panes in the same window. Each pane uses a native view.
- **Continuity while rearranging:** Change the pane layout while shells keep running. Saved scrollback can be restored after relaunch, separated from the live session.
- **Project context in the repository:** Tasks live in `.ultra/todo.md`; context, agent lists, and layouts are also stored with the project.
- **Keyboard navigation:** Use menu shortcuts while working in a terminal, or open the command palette with Command-K.

## Your agent can use Ultra for you

Every project created in Ultra starts with predefined agent instructions by default. They are written into the project's `AGENTS.md`, preserving your own instructions around Ultra's section. Existing projects can add them through **File → Session → Write AGENTS.md**.

These instructions teach your agent how to add and complete todos in the shared Markdown task list, open URLs in Ultra's Browser panel, and open files at a specific line in an Editor panel. Your agent can show you its work directly inside Ultra while you follow the same plan.

## Available panels

| Panel | Purpose |
| --- | --- |
| Shell | Run commands while keeping processes active through layout changes. |
| Agent | Run Codex, Claude Code, or Gemini within a project. |
| Files | Browse the project tree and open files. |
| Editor | Read and edit files, inspect diffs, and preview Markdown. |
| Todo | Share a Markdown task list with your agent. |
| Git | Inspect branches, worktrees, changes, and file diffs. |
| Context | Keep files and folders as references for your agent. |
| Ports | Find development servers and open local previews. |
| Resources | Monitor CPU and memory usage attributed to panes. |
| Chat | Talk to a model alongside your project tools. |
| Browser | Open URLs, documentation, and development previews inside Ultra. |
| Ultra | Display an animated ASCII canvas. |

## When Ultra is a good fit

Ultra suits developers who use coding agents throughout their day and want to supervise work across projects, inspect files, run commands, and preview a local application in one Mac workspace. It also suits developers who want access to their terminal's source code.

Ultra is the terminal workspace around the coding agents. Codex, Claude Code, and Gemini are the agents it can run.

## Platform and availability

- Platform: macOS 26 Tahoe on Apple Silicon.
- Distribution: Download a release from the official GitHub repository; release builds support updates within the app.
- Source: Publicly available in `petit-software/ultra-swift`, with build instructions and design documentation.
- Publisher: Petit, a software studio in Zürich, Switzerland.

## Official sources

- [Ultra product page](https://petit.software/ultra)
- [Download the latest release](https://github.com/petit-software/ultra-swift/releases/latest)
- [Source code and current feature overview](https://github.com/petit-software/ultra-swift)
- [Documentation](https://github.com/petit-software/ultra-swift/tree/main/docs)
- [Report an issue](https://github.com/petit-software/ultra-swift/issues)

Feature descriptions and platform requirements above are based on the official project README, panel documentation, and agent instruction implementation. The repository and release notes provide the latest details.
