## How to safe yourself?
-> We can install package with ignore scripts `npm config set ignore-scripts true` globally, if we need so we can manually set it to `false` for a specific package.

-> For verify signature of all current dependencies, we can use `npm audit signatures`.
-> Never install the latest version of a package, that is published 10 minutes ago or newer. Mostly 24 - 48 hours (2 days), Hackers usually caught.
-> `npm ci` It ensures only build specified dependencies using the lockfile (package-lock.json), and no additional packages are installed, no dependency conflicts.
-> Verify npm packages see on   `https://socket.dev/` .
-> We can also verify the npm packages just side `blue tick` at the next to version.
