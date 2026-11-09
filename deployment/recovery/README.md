# Recovery deployment

This branch adds deployment configuration to production commit
`d3af241898ff871b430960851eeda7b8fd0fafde`. It doesn't change application source.
Use `/docker-compose.recovery.yml` in a separate Coolify application. Keep
automatic deployments and public domain generation off.

Before deploying:

1. Create a private Coolify MariaDB database using the recorded image digest.
   Disable its event scheduler and restore the selected backup into `production`.
2. Set `RECOVERY_DB_HOST`, `RECOVERY_DB_PASSWORD`, and `RECOVERY_JWT_SECRET` in
   Coolify. Use the `recovery` database user and a fresh base64 signing secret.
3. Create the external volume `tcl-recovery-images` and restore uploaded files.
4. Use custom build command `sh deployment/recovery/build.sh` to build services
   one at a time. The Compose parallelism variable alone didn't prevent
   concurrent builds in the first rehearsal.
5. Check the generated Compose file before starting containers. Only localhost
   ports 8090, 8091, and 8092 should be published. Don't assign public domains.

Forward those ports over SSH. The website uses `http://localhost:8090`, the mobile
web application uses `http://localhost:8091`, and captured mail uses
`http://localhost:8092`.

The API uses `ENV=testing`, which skips background jobs, and
`SERVER_NO_MIGRATE=true`, which preserves the restored schema. The test config
contains no credentials. Runtime credentials come from Coolify.

Mail goes to Mailpit. Payment, push, error reporting, and chat credentials are
empty. The web server's content security policy blocks external browser requests,
including the production analytics script. Fonts, maps, external images, and
other external content can therefore appear incomplete during this rehearsal.
This is a functional recovery check, not a visual comparison with production.

Deploy the recovery image service from `the-clothing-loop/images` first. Enable
the shared managed-resource network on both applications. The web servers proxy
`/images/` to `recovery-image-source:80`. During image builds,
`prepare-images.mjs` rewrites static production image addresses to `/images/` and
adapts the image helper to recognize restored database addresses. These changes
apply only to the recovery build, not the production source files.

The mobile web build uses `VITE_APP_VERSION=development` to select the `_dev`
cookie names used by the testing API. The original production build command
would overwrite that variable, so the recovery Dockerfile runs the underlying
build steps directly.

Keep restored personal data, dumps, captured mail, logs, passwords, and tokens
outside Git. These settings don't restrict outbound traffic from API containers.
Review any additional endpoint before testing an external integration.
