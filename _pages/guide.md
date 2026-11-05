---
layout: page
title: how to post
permalink: /guide/
nav: true
nav_order: 7
description: Join, add yourself, claim a task, and publish your first post in about 10 minutes.
toc:
  sidebar: left
---

This site belongs to the class. Everyone in the course can change **anything**: posts, pages, design, roles. No one approves your changes. When you save, the site rebuilds by itself in a few minutes.

Stuck or curious? Ask in [Q&A](https://github.com/{{ site.github_repo }}/discussions/categories/q-a): answers stay there for the next person.

## 1. Join (once)

1. Make a [GitHub account](https://github.com/signup) if you don't have one.
2. Comment on the pinned **"Join here"** issue in the [repository](https://github.com/{{ site.github_repo }}/issues). Just write "hi" (your username is attached automatically).
3. Anyone already in the course adds you. You get an email invitation, so accept it.

**Already in and seeing a join comment?** Add the person: repository **Settings → Collaborators and teams → Add people**, type their username, choose the **Admin** role (so they can add the next person), then react 👍 to their comment so others know it's done.

## 2. Add yourself (once)

Click <a class="profile-link" href="https://github.com/{{ site.github_repo }}/blob/main/templates/person.md">Add yourself</a>. It opens a new profile in GitHub's editor: rename the file to your GitHub username (that is how your posts find you), fill it in, and click **Commit changes**. Your GitHub picture is used unless you add a `photo:`.

## 3. Take a role (every week)

Look at the [roles]({{ '/roles/' | relative_url }}) and pick a task, then add yourself in {% include course/signup_link.liquid %}: one row per week with the week, your GitHub username and the task. Change it whenever you like; if the sheet shows your change leaves a major task short or puts a task over its limit, switch with someone instead.

Then read your role's [guide]({{ '/guides/' | relative_url }}) and its latest [handoffs](https://github.com/{{ site.github_repo }}/tree/main/handoffs) before you start.

## 4. Write your post

Click **Write** next to your task on the [roles page]({{ '/roles/' | relative_url }}) (or pick a task at the bottom of a paper's page). It opens a new post in GitHub's editor, already named, dated and filled in for that paper and task. Replace `your-github-username`, write, and click **Commit changes**.

Prefer to do it by hand? Copy your role's template from [`templates/`](https://github.com/{{ site.github_repo }}/tree/main/templates) to `_posts/YYYY-MM-DD-short-title.md`.

The header is what puts your post on the right paper page with the right badge:

```yaml
---
title: A better Figure 1
description: One sentence that makes people want to click.
paper: cross-lingual-knowledge-pretraining # the filename of the paper in _papers/ (no .md)
role: visualization # a role id from the roles page
task: redo-graph # a task id from the roles page
by: [your-github-username] # several authors? [alice, bob]
---
```

**Stuck on how to do something?** The [example posts]({{ '/papers/cross-lingual-knowledge-pretraining/' | relative_url }}) for the first paper cover the common cases (citations, figures, charts, code, before/after blocks), and the [feature showcase]({{ '/showcase/' | relative_url }}) covers everything else (math, tabs, diagrams, videos, notebooks, Distill-style posts...). Open the source of any post and copy.

## 5. Publish

Save (commit) to the `main` branch. That's it. In about 3–5 minutes the site rebuilds and your post is live.

- Watch progress in the repository's [**Actions** tab](https://github.com/{{ site.github_repo }}/actions). Green ✓ = live.
- Red ✗ = the build broke. **The live site keeps working** (it just shows the previous version). Click the failed run, look for the error, fix the file and save again. Most errors are a typo in the header (a missing `---`, or a `:` inside a title: wrap the title in quotes).

**Sharing it.** A shared link shows a preview card with your title, role and paper, made automatically. To show one of your figures instead, add `og_image: /assets/img/posts/<your-post>/figure.png` to the header.

## Three ways to edit

| | Good for | How |
| --- | --- | --- |
| **On github.com** | small posts, fixing typos | Open a folder → **Add file → Create new file**, or open a file and click ✏️. Press <kbd>.</kbd> on any repo page for a full editor in the browser. No preview: save and check the live site. |
| **Codespaces** (recommended) | longer posts, design changes | On the repo page: **Code → Codespaces → Create codespace on main**. A VS Code opens in the browser and, after a few minutes the first time, a live preview of the site. Free for students with [GitHub Education](https://education.github.com/pack). |
| **Your own computer** | if you like your own tools | `git clone`, then `docker compose up` and open <http://localhost:8080>. Without Docker you need Ruby, see [docs/al-folio/INSTALL.md](https://github.com/{{ site.github_repo }}/blob/main/docs/al-folio/INSTALL.md). |

When working with git (Codespaces or locally), always `git pull --rebase` before `git push`. With 30-odd people pushing, someone will have pushed before you.

## Writing features, quickly

**Citations.** Add the BibTeX entry to [`_bibliography/references.bib`](https://github.com/{{ site.github_repo }}/edit/main/_bibliography/references.bib) (get it from Google Scholar, arXiv or Semantic Scholar), then write {% raw %}`{% cite gaber2026crosslingual %}`{% endraw %} in your post. The reference list appears at the bottom of the post automatically.

**Images.** Put them in `assets/img/posts/<your-post-name>/` and use:

{% raw %}

```liquid
{% include figure.liquid path="assets/img/posts/my-post/figure.png" class="img-fluid rounded" caption="What the reader should notice." %}
```

{% endraw %}

Only use images you may reuse: your own, or from a paper with an open license (like CC BY), with credit. arXiv's default license does **not** allow reuse; redraw the figure instead (that's a task!).

**Math.** `$$ \beta_B / \beta_A $$` works anywhere.

**Charts.** Interactive charts with Chart.js, ECharts, Plotly or Vega-Lite: see the [redo-a-graph example]({{ '/papers/cross-lingual-knowledge-pretraining/' | relative_url }}) and the showcase.

**Before / after** (for writing tasks):

```html
<div class="before-after">
  <div class="before"><span class="label">Before</span>Original text</div>
  <div class="after"><span class="label">After</span>Your version</div>
</div>
```

## Adding a paper

Copy [`templates/paper.md`](https://github.com/{{ site.github_repo }}/blob/main/templates/paper.md) to `_papers/<short-id>.md`, e.g. `_papers/recurrent-depth.md`. The filename is the paper's id: posts point to it with `paper: recurrent-depth`. Add a week for it in the schedule.

## Changing the look

All of it is yours to change:

- Colors and badges of roles: [`_data/roles.yml`](https://github.com/{{ site.github_repo }}/blob/main/_data/roles.yml)
- Fonts, cards, spacing, everything course-specific: [`_sass/_course.scss`](https://github.com/{{ site.github_repo }}/blob/main/_sass/_course.scss)
- Site accent color: `$purple-color` in [`_sass/_variables.scss`](https://github.com/{{ site.github_repo }}/blob/main/_sass/_variables.scss)
- Page structure: `_layouts/` (e.g. `paper.liquid`, `person.liquid`, `post.liquid`) and `_includes/course/`
- Navigation and site settings: [`_config.yml`](https://github.com/{{ site.github_repo }}/blob/main/_config.yml)
- More about the theme: [docs/al-folio/CUSTOMIZE.md](https://github.com/{{ site.github_repo }}/blob/main/docs/al-folio/CUSTOMIZE.md)

For changes that affect everyone (layouts, the main stylesheet), try them in a Codespace first, and mention them in [Discussions](https://github.com/{{ site.github_repo }}/discussions).

## House rules

- Edit your own posts freely. Fix typos anywhere. Ask before rewriting someone else's post.
- Never force-push and never delete the `main` branch.
- Broke something? Every change is in the history. In the repo, open the file's **History**, find the last good version, and restore it, or ask for help in Discussions.
- Everything here is public and licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Be fair to the authors you write about: critique the work, not the people.
- Use a pseudonym if you prefer: the `name:` in your profile can be anything.
