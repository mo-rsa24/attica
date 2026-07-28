# ✅ Todoist Task Bridge

## Description

Bridge all plan files from the onboarding-docs scope into a Todoist project structure. Translate each Task line into a Todoist task with its Engagement Instructions as the task description.

## Purpose

Enable the project team to track onboarding work in Todoist (their task management system of record). The bridge ensures: (1) no task is lost, (2) Engagement Instructions are preserved as task descriptions, (3) task hierarchy matches the plan structure (Plan → Section → Task → Subtask).

## Goal

Produce:
1. A Todoist-compatible markdown export listing all onboarding tasks, organized by plan
2. Verify the export with `/todoist-bridge` skill
3. Optionally publish to Todoist using `/todoist-publish`

## Tasks

- [ ] ⚠️ Review all plan files (01–05)
  - [ ] Read: 01-source-analysis.md, 02-backend-setup-docs.md, 03-frontend-setup-docs.md, 04-architecture-diagrams.md, 05-slides.md
  - [ ] Extract: all Task lines (including subtasks), Engagement Instructions, Recommended Skills
  - [ ] Document: task names, descriptions, relationships

- [ ] ⚠️ Generate Todoist-compatible markdown
  - [ ] Use `/todoist-bridge` skill to translate plan tree
  - [ ] Output format: nested markdown with task hierarchy
  - [ ] Each task includes: title (Task line), description (Engagement Instructions + Recommended Skill), checkbox
  - [ ] Example format:
    ```
    # 📚 onboarding-docs (Project)
    
    ## 01-source-analysis (Section)
    
    - [ ] Review replicate output
      Description: [Engagement Instructions text]
      
    - [ ] Review unpack output
      Description: [Engagement Instructions text]
      
    ...
    ```

- [ ] ⚠️ Verify task hierarchy
  - [ ] Each plan is a section
  - [ ] Each task within a plan is a task item
  - [ ] Subtasks are indented under parent tasks
  - [ ] No tasks or engagement instructions are missing
  - [ ] Checkboxes are clean (all `- [ ]`)

- [ ] ⚠️ (Optional) Publish to Todoist
  - [ ] Use `/todoist-publish` to upload the markdown to actual Todoist project
  - [ ] Verify: tasks appear in Todoist app
  - [ ] Check: descriptions are readable, hierarchy is preserved

## Engagement Instructions

**Task: Review all plan files**
```
Read all 5 plan files in onboarding-docs/plans/:
1. 01-source-analysis.md — extract all Task lines with their Engagement Instructions
2. 02-backend-setup-docs.md — same
3. 03-frontend-setup-docs.md — same
4. 04-architecture-diagrams.md — same
5. 05-slides.md — same

Create a spreadsheet or note with columns: [Plan] [Task Title] [Engagement Instructions] [Recommended Skill]

Count total tasks: should be ~25–35 tasks across all plans.
```

**Task: Generate Todoist markdown**
```
Run the /todoist-bridge skill:

"Translate the onboarding-docs plan tree into Todoist markdown.

Scope: /home/molef/Work/attica/onboarding-docs/
Plans: 01-source-analysis.md, 02-backend-setup-docs.md, 03-frontend-setup-docs.md, 04-architecture-diagrams.md, 05-slides.md

Output format:
# onboarding-docs (Main Project heading)

## 01-source-analysis (Plan = Section heading)
- [ ] Task 1 from plan 01
  Description: [Engagement Instructions for Task 1]
  
- [ ] Task 2 from plan 01
  Description: [Engagement Instructions for Task 2]
  
  - [ ] Subtask 2a (if plan specifies)
  
...

## 02-backend-setup-docs (Plan = Section heading)
- [ ] Task 1 from plan 02
  Description: [Engagement Instructions for Task 1]
  
...

Use plan Task lines as task titles. Use Engagement Instructions as descriptions (preserve command text, not prose).
Include Recommended Skills in the description if present.

Output file: onboarding-docs/tasks/todoist-export.md

Verify: every plan's tasks are present, no duplicates, descriptions are complete."
```

**Task: Verify task hierarchy**
```
Open the generated todoist-export.md and check:
1. Is there one project heading (# onboarding-docs)?
2. Are there 5 section headings (## 01-source-analysis, ## 02-backend-setup-docs, etc.)?
3. Does each section contain all its tasks (- [ ] Task)?
4. Are subtasks indented (  - [ ] Subtask)?
5. Does every task have a Description?
6. Are all Engagement Instructions preserved (command blocks, prompts, exact text)?
7. Are checkbox formats clean (no variations like [x], [*], etc.)?

If any issues, fix the markdown manually or re-run /todoist-bridge with corrections.
```

**Task: (Optional) Publish to Todoist**
```
If you use Todoist and want tasks synced there:

Run the /todoist-publish skill:

"Publish onboarding-docs tasks to Todoist.

Input markdown: onboarding-docs/tasks/todoist-export.md
Todoist project: Create a new project called 'Attica Onboarding' or use an existing one.

Behavior:
- Create a main project: 'Attica Onboarding'
- For each section (## 01-source-analysis, etc.), create a section in the project
- For each task (- [ ] Task Title), create a task in that section
- Use the Description field for Engagement Instructions
- Set priority to reflect urgency (optional; default all to normal)

Verify after upload:
- Log into Todoist app
- Check 'Attica Onboarding' project
- Verify all 5 sections are present
- Verify all ~25–35 tasks are present
- Test: open a task, check description has Engagement Instructions
- Optional: assign to team members, set due dates"
```

## Recommended skill
▶ `/todoist-bridge` ✅ — translates plan-tree markdown to Todoist format.
   ▶ `/todoist-publish` ✅ (optional) — publishes to live Todoist project.
