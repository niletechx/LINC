# 🤝 Contributing to LINC (Life Infrastructure Network)

Thank you for contributing to the LINC platform! This document outlines our collaborative workflow, branch strategies, commit standards, and pull request processes for the Nile Tech team.

---

## 🌿 Branching Strategy

To keep the repository stable and prevent merge conflicts across team members:

1. **`main` Branch is Protected**
   - Never commit directly to `main`.
   - All production deployments and releases are built from `main`.

2. **Branch Naming Conventions**
   Always branch off the latest `main` branch (`git checkout -b <branch-type>/<name>`):
   - `feat/<feature-name>` or `feature/<feature-name>`: New functionality or UI additions.
   - `fix/<bug-description>`: Bug fixes and issue resolutions.
   - `test/<component>`: Test suite additions and unit/integration coverage.
   - `docs/<topic>`: Documentation updates, architecture notes, and guides.
   - `perf/<optimization>`: Performance enhancements and memory optimizations.
   - `chore/<task>`: Dependency updates, CI/CD, or build tooling.

---

## 📝 Conventional Commits Standard

Every commit must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification to keep our git history clean, readable, and machine-parsable.

### Commit Structure
```text
<type>(<scope>): <lowercase description>
```

### Allowed Types
- **`feat`**: A new feature for users or clients.
- **`fix`**: A bug fix.
- **`test`**: Adding new tests or correcting existing tests.
- **`docs`**: Documentation only changes.
- **`refactor`**: Code changes that neither fix bugs nor add features.
- **`perf`**: Code changes that improve performance or reduce memory footprint.
- **`build`**: Changes that affect the build system or external dependencies (e.g., Gradle, npm).
- **`ci`**: Changes to CI/CD workflows and configuration files.
- **`chore`**: Maintenance, repository setup, or routine updates.

### Common Scopes
- `mobile`: Flutter client application.
- `web`: React dashboard / web application.
- `server`: Express backend API and repositories.
- `api`: API contracts, routing, and schemas.
- `db`: Database migrations, RLS policies, Supabase seeds.
- `auth`: Authentication, JWT, and authorization flows.
- `bookings`: Booking engine, scheduling, and escrow.
- `security`: Security patches, headers, rate limiting.
- `repo`: Root repository configs, templates, meta-documentation.

### Examples
- `feat(mobile): add offline connectivity banner`
- `fix(auth): enforce server-side validation on registration input`
- `test(server): add unit tests for booking state transitions`
- `docs(api): document escrow payment flow and webhook contracts`
- `perf(mobile): optimize image caching on provider cards`

---

## 🔄 Development & Pull Request Workflow

1. **Pull Latest Main:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a Dedicated Branch:**
   ```bash
   git checkout -b feat/my-new-feature
   ```

3. **Make Atomic Commits:**
   - One logical change per commit.
   - Avoid bundling unrelated refactors or formatting changes.
   - Verify changes build and pass linting before committing.

4. **Push Branch & Open a Pull Request:**
   ```bash
   git push origin feat/my-new-feature
   ```
   - Fill out the PR template completely (description, type of change, testing performed).
   - Link related issue IDs if applicable.
   - Request review from at least one team member.
