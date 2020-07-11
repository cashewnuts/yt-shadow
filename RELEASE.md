# Release procesure

1. Prepare develop branch
2. Count up version numbers [package.json, package-lock.json, addon/manifest.json]
3. Write changelog
4. Merge into master branch
5. Create tag for release.
6. Build an extension artifact with `npm run build`.
7. Package with `npm run package` for sources (on master branch).
8. Upload artifacts to Addon site.
