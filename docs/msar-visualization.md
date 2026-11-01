# MSAR visualization

The contribution is `_posts/2026-10-31-msar-tokens-and-depth.md`, linked to
`_papers/multi-stream-attention-residuals.md` and Roey's existing profile. Its URL is
`/posts/2026/msar-tokens-and-depth/`.

The post includes `_includes/msar-explorer.liquid`. That component loads the
scoped `assets/css/msar.css`, the pure numerical model `assets/js/msar-model.js`,
and the SVG/controls in `assets/js/msar-explorer.js`. It inherits the site's theme
variables and Bootstrap form styling, including light/dark appearance. Asset
links use Jekyll's `relative_url`, so deployments under a base path work too.
There are no additional browser dependencies or network requests for data.

## Preview

Use the repository's standard Docker workflow:

```sh
docker compose up
```

Then open <http://localhost:8080/posts/2026/msar-tokens-and-depth/>.

If `_site/` has already been built, preview it directly from PowerShell without
starting Ruby again:

```powershell
python -m http.server 8080 --bind 127.0.0.1 --directory _site
```

Use the same URL above. This serves the last build; rebuild with Jekyll after
changing the source. Press Ctrl+C to stop the preview server.

Alternatively, in an environment with Ruby, Bundler, Node.js, ImageMagick, and Jupyter
nbconvert installed, from the repository root:

```sh
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll build
bundle exec jekyll serve --host 127.0.0.1 --port 8080
```

On Windows, run these Ruby commands inside WSL Ubuntu from the mounted checkout
(`/mnt/c/Users/Roey Magen/Projects/active-ai-reading.github.io`). The bundle and
build artifacts are ignored by git. None of these commands publishes the site.

On Ubuntu, the `jupyter-core` and `jupyter-nbconvert` packages provide the command-line
tools separately from the Python modules. Verify `jupyter nbconvert --version`
before building; `python3 -m nbconvert --version` alone does not verify the command
used by the site's notebook plugin.

## Validate

Node's built-in runner needs no npm installation:

```sh
node --test bin/tests/msar-model.test.cjs
node --check assets/js/msar-explorer.js
git diff --check
```

The numerical tests cover every stream/layer/token combination, causal windows,
left padding, softmax over depth, Identity, key-only RMS normalization, retrieval
reconstruction, non-additivity of norms, independent queries, and the fixed
contribution scale. Tests live under `bin/`, already excluded from Jekyll output.

For browser checks, use the built post at desktop and 320–390px mobile widths:

- Change all four controls; the plot, labels, mask, and inspection text update.
- In attention mode, color only encodes attention in the right-hand column;
  the token grid displays convolution support. In contribution mode, each
  active token cell displays its weighted vector norm.
- At layer 1, there is one available source with attention 1. At token 0,
  all negative token positions are zero-padded. Identity has one active column.
- Inspect with both a pointer and keyboard-accessible selectors. Reduce the
  target layer while inspecting a later source: selection must remain valid.
- Check both themes, readable axes, wrapping controls, and no page overflow.

The demo is a layer-level retrieval from arbitrary synthetic vectors, not a
trained Transformer or a simulation of Block MSAR's evolving source bank.
The post explains the distinction and cites the paper's equations. Contribution
norms are not probabilities or causal attribution scores. Stream fusion is
deliberately outside the scope of the visualization.
