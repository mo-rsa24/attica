# Git Strategy & Workflow: Sole Developer (Windows & Ubuntu)

## 1. Core Strategy: The Unified Feature Branch
Instead of maintaining separate `windows` and `ubuntu` branches for the same feature, use a **single feature branch**. 

* **Why?** Splitting branches by OS doubles your administrative work and increases merge conflicts. 
* **How?** Rely on Git to sync code between machines. Rely on environment configuration (like `.gitignore`, `.env`, or conditional imports) to handle OS differences (e.g., the `cloud-init` vs `pywin32` dependencies).

## 2. Setup & Configuration (One Time)
Before starting this workflow, ensure both machines handle line endings correctly to prevent "phantom" file changes.

**On Windows:**
```bash
git config --global core.autocrlf true/