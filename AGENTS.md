<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the public index separate from the studio shell; shared workspace tools live in providers so navigation does not restart them.
- Scope local workspace caches, preferences and IndexedDB audio by account ID or guest; cloud account data remains in user_data under existing RLS.
- Execute ordinary code in real runtimes; robot programs export for their official toolchains, never silently substitute mock APIs.
