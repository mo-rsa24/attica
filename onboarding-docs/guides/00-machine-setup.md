# Machine Setup Guide (Windows + WSL2)

Get a bare Windows machine ready to run Attica. This is step zero: it produces a
machine with Python 3.12, Node, npm, Redis, and Git available, so that
[backend-setup.md](backend-setup.md) and [frontend-setup.md](frontend-setup.md)
can run unmodified as written.

**Target state:** an Ubuntu WSL2 shell where `python3.12 --version`, `node --version`,
`npm --version`, `git --version`, and `redis-cli ping` all succeed.

Everything below runs **inside WSL2's Ubuntu shell**, not in PowerShell or Command
Prompt. Attica's tooling (venv activation, Redis, the seed script) is written for a
Linux shell. Running it from native Windows Python/Node is a separate, unsupported
path and is the source of most "works for me" mismatches: don't mix the two.

---

## 1. Install WSL2

Open PowerShell **as Administrator** and run:

```powershell
wsl --install -d Ubuntu
```

This enables the WSL2 feature and installs the latest Ubuntu LTS. Restart Windows
when prompted.

After restart, Ubuntu launches automatically once and asks you to create a UNIX
username and password. These are separate from your Windows login, and you'll use
them for `sudo` commands below.

**Verify:**
```powershell
wsl --list --verbose
```
Expected: `Ubuntu` listed with `VERSION` = `2`.

If you already have WSL1 or an older Ubuntu install, see
[Troubleshooting](#troubleshooting) below before continuing.

From here on, open the **Ubuntu** app (or run `wsl` from PowerShell, or open a WSL
terminal in VS Code) and run every command in that shell.

---

## 2. Update the Ubuntu package index

```bash
sudo apt update && sudo apt upgrade -y
```

Do this before installing anything else: a stale package index is a common cause
of "package not found" errors below.

---

## 3. Install Git

```bash
sudo apt install -y git
git --version
```

Expected: `git version 2.x` or newer.

Configure your identity if you haven't already:
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

## 4. Install Python 3.12

Ubuntu's default `apt` repository may not carry 3.12 depending on your Ubuntu
version. Check first:

```bash
apt-cache policy python3.12
```

**If a version is listed**, install directly:
```bash
sudo apt install -y python3.12 python3.12-venv python3.12-dev
```

**If nothing is listed** (common on Ubuntu 22.04 and earlier), add the
`deadsnakes` PPA, which packages current and past Python versions for Ubuntu:
```bash
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev
```

**Verify:**
```bash
python3.12 --version
```
Expected: `Python 3.12.x`.

**Do not `pip install` a different Python version to "fix" a version mismatch.**
Attica's virtual environment is created from whatever binary `python3.12` resolves
to (see backend-setup.md step 1). As long as this command exists and prints
`3.12.x`, the venv step will pick it up correctly.

### If a conflicting Python is already on the PATH

`python3.12 --version` failing with "command not found" is normal on a fresh
machine, it just means step 4 hasn't been done yet, not a conflict. A real
conflict looks like `python --version` or `python3 --version` printing a
*different* major/minor version (e.g. 3.10) than the `python3.12` binary you just
installed.

That's expected and fine: Attica's guide always calls the versioned binary
(`python3.12 -m venv venv`), never the bare `python`/`python3` alias, specifically
so a system Python of a different version doesn't interfere. You do not need to
uninstall or override the system Python.

---

## 5. Install Node.js and npm

Ubuntu's `apt` Node package is often old. Use NodeSource's setup script to get a
current LTS release (satisfies the project's Node 16+ / npm 8+ minimums with
headroom):

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

**Verify:**
```bash
node --version   # expect v18.x or newer
npm --version    # expect 9.x or newer
```

---

## 6. Install and start Redis

```bash
sudo apt install -y redis-server
sudo service redis-server start
```

WSL2 doesn't run systemd by default on older Windows/WSL builds, so use
`sudo service` (not `systemctl`) to control Redis unless you've confirmed
`systemctl` works in your shell.

**Verify:**
```bash
redis-cli ping
```
Expected: `PONG`.

Redis does not persist across a Windows reboot or WSL restart. You'll need to
re-run `sudo service redis-server start` each time you start a new session. If you
want it to start automatically, see [Troubleshooting](#troubleshooting).

---

## 7. Clone the repository

The Attica GitHub repo is public, so no account or login is needed to download it,
only to push changes back later (see [Pushing changes](#pushing-changes-optional)
below).

Get the clone URL from the repo's GitHub page: click the green **Code** button,
make sure **HTTPS** is selected, and copy the URL shown (it looks like
`https://github.com/<org>/<repo>.git`).

Clone **inside the WSL2 filesystem** (e.g. `~/projects/`), not into `/mnt/c/...`.
Files under `/mnt/c/` are shared with Windows through a translation layer that is
dramatically slower for the file-watching `npm run dev` and `pip install` do:
this is the single biggest performance mistake on a fresh setup.

```bash
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/<org>/<repo>.git attica
cd attica
```

Replace `https://github.com/<org>/<repo>.git` with the URL you copied. The
trailing `attica` names the local folder `attica` regardless of the repo's name
on GitHub; every other guide in this series assumes that folder name.

**Verify:**
```bash
ls
```
**Expected result:** `backend/`, `frontend/`, `onboarding-docs/`, and `CLAUDE.md`
among the listed files. If the clone fails with `Repository not found` or a 404,
double check the URL was copied exactly, with no trailing spaces.

### Pushing changes (optional)

Cloning over HTTPS is enough to read the code and run it locally. If you'll also
be pushing commits, GitHub no longer accepts your account password for this:
you need either an SSH key or a Personal Access Token:

- **SSH** (recommended if you'll push often): generate a key with
  `ssh-keygen -t ed25519 -C "you@example.com"`, then add the printed public key
  (`cat ~/.ssh/id_ed25519.pub`) under GitHub → Settings → SSH and GPG keys. After
  that, change the repo's remote to the SSH form:
  `git remote set-url origin git@github.com:<org>/<repo>.git`
- **Personal Access Token (PAT)**: GitHub → Settings → Developer settings →
  Personal access tokens → generate one with `repo` scope. When `git push` prompts
  for a password over HTTPS, paste the token instead of your account password.

Skip this section entirely if you're only running the app locally.

---

## 8. Editor: VS Code with the WSL extension

Install VS Code on Windows normally (not inside WSL), then install the
**WSL** extension (`ms-vscode-remote.remote-wsl`) from the Extensions panel.

Open the project with:
```bash
cd ~/projects/attica
code .
```

This opens a VS Code window connected to the WSL filesystem. The integrated
terminal, debugger, and any Python/ESLint extensions will all run against the
Linux environment you just set up, not Windows. Running `code .` from inside
WSL is what makes this happen; opening the folder from the Windows-side VS Code
File menu instead connects to the wrong filesystem.

---

## 9. Database tooling (optional)

Attica uses **SQLite** in development, not MySQL or Postgres. The database is a
single file at `backend/main/db.sqlite3`, created automatically by
`python manage.py migrate` in backend-setup.md. No database server install is
needed to run the project locally.

If you want a GUI to inspect the SQLite file (optional, not required for setup):
- **DBeaver** (cross-platform, install on the Windows side; it can open a SQLite
  file through the WSL path `\\wsl$\Ubuntu\home\<you>\projects\attica\backend\main\db.sqlite3`)
- or the lighter **DB Browser for SQLite** (`sudo apt install -y sqlitebrowser`,
  run from inside WSL with an X server, or just install the Windows build)

Neither is a prerequisite for `guides/backend-setup.md`. Skip this section
entirely if you don't need to browse the database by hand.

---

## Verify: ready for backend-setup.md

Run all five from inside the WSL Ubuntu shell, in the cloned repo directory:

```bash
git --version
python3.12 --version
node --version
npm --version
redis-cli ping
```

All five should succeed (Redis returns `PONG`). If they do, continue to
[backend-setup.md](backend-setup.md).

---

## Troubleshooting

**`wsl --install` fails or WSL2 is unavailable**
Usually means virtualization isn't enabled in the BIOS/UEFI, or Windows is out of
date. Run `wsl --update` from an Administrator PowerShell, then retry. Virtualization
must be enabled in firmware. Check Task Manager > Performance > CPU >
"Virtualization: Enabled".

**Already have an old WSL1 or Ubuntu install**
Convert in place with `wsl --set-version Ubuntu 2`, or remove it
(`wsl --unregister Ubuntu`) and reinstall fresh with `wsl --install -d Ubuntu`.
Unregistering deletes that distro's files, so back up anything inside it first.

**Redis won't survive a reboot**
WSL2 doesn't keep background services running after you close the last WSL
terminal, by default. Two options: re-run `sudo service redis-server start` each
session (simplest), or enable systemd in `/etc/wsl.conf`:
```ini
[boot]
systemd=true
```
then `wsl --shutdown` from PowerShell and reopen Ubuntu. After that,
`sudo systemctl enable redis-server` makes it start automatically.

**`pip install -r requirements.txt` fails with a build error**
Almost always a missing system header. Install the common build toolchain:
```bash
sudo apt install -y build-essential libssl-dev libffi-dev
```

**Port already in use (`:8000` or `:5173`)**
Something is already bound to the port, often a leftover process from a previous
session. Find and stop it:
```bash
lsof -i :8000    # or :5173
kill <PID>
```
