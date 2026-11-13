# Security

> **This repository is public.**

The following must never appear in this repository, including in history, issues, and pull requests:

- IP addresses
- hostnames
- MAC addresses
- internal paths
- usernames
- email addresses
- vault IDs
- credentials
- pane IDs

The published names of these sites are already the subject of `README.md` and `docs/`. Do not add any other hostname. Do not add a machine name, a LAN address, a home-directory path, a vault path, or a pane ID.

Dates are Europe/Berlin, `YYYY-MM-DD`.

## Threat model

| Threat | What can happen | What we do |
| --- | --- | --- |
| A secret is added to a commit | The value is public as soon as it is pushed | `pre-commit` runs `scripts/check-secrets.sh --staged`. GitHub Actions runs gitleaks on push and pull_request. |
| A workflow action moves, or a deploy key is written in the job shell | The published site or the key can change without a reviewed diff | Actions are pinned to a commit SHA. Gallery, ventures, and the garden pass the existing deploy key to a pinned publish action. Workflow tokens default to contents read. |
| A dependency advisory is missed | A vulnerable package or action stays in use | Dependabot alerts and Dependabot security updates are enabled as of 2026-11-13. `.github/dependabot.yml` groups weekly minor and patch updates for GitHub Actions. |
| A private detail is written into a public file | Addresses, names, or paths become public | This file's never-appear list is the rule. Longer private notes go in gitignored `CHANGELOG.private.md`, or in the agent-platform handoff, not here. |
| A local secret file is committed by name | `.env`, a key, or a credential file is published | The secret check rejects those names. `.env.example` is the one env file that may be committed, and it holds names only. |
| The garden plaintext build is published | Note bodies would be readable | Publish only the encrypted garden artifact. See `garden/SECURITY.md`. |
| A leak stays valid | The old value still works | Rotate the secret first. Then tell Axel. |
| History is rewritten in a hurry | A force-push drops other people's commits | A history rewrite needs Axel's force-push approval. |

## Dependabot

Dependabot alerts and Dependabot security updates are enabled on this repository as of 2026-11-13. `.github/dependabot.yml` asks Dependabot to open a weekly pull request that groups minor and patch updates for GitHub Actions. The npm ecosystem is not in that file.

## Never commit

| Item | Where it lives |
| --- | --- |
| Passwords, API tokens, Tailscale auth keys, and other vault items | Proton Pass |
| Grok and local tool credentials | The local Grok env file, outside this repository |
| Host bootstrap secrets | Axel's secure secret cards |
| Garden site password and the garden deploy key | GitHub Actions secrets. Names only in `.env.example` and `garden/SECURITY.md`. |
| Gallery and ventures deploy keys | GitHub Actions secrets |

Use a placeholder such as `<SECRET>` in drafts. `.env.example` lists setting names and leaves the values empty.

## Run the secret check

From the repository root:

```
scripts/check-secrets.sh
scripts/check-secrets.sh --staged
scripts/check-secrets.sh --history
```

The default mode scans the working tree (tracked files and untracked files that are not ignored). `--staged` is what the pre-commit hook runs. `--history` scans commits. Before a push, run `just pre-push`: it runs the staged check, then shows `git diff @{u}..HEAD`.

The check uses `.gitleaks.toml` when that file is present. If `gitleaks` is missing, the script exits 127 and names the missing tool.

## Leak response

1. Rotate the secret first. Treat the value as already copied.
2. Tell Axel what leaked and which repository it was in.
3. A history rewrite needs Axel's force-push approval. Do not force-push on your own.

## Reporting a vulnerability

Report a vulnerability in private. Enable Private vulnerability reporting in the repository settings, then use GitHub's private report:

https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability

Do not open a public issue for a vulnerability or a leaked secret.
