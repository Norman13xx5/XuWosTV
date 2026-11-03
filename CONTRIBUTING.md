# Contributing to XuWosTv

Thank you for helping improve XuWosTv.

## Workflow

1. Fork the repository.
2. Create a branch from `main`:

   ```bash
   git checkout -b fix/short-description
   ```

3. Make the smallest focused change possible.
4. Run the Docker UI tests when the change affects the application:

   ```bash
   docker compose --profile test run --build --rm tests
   ```

5. Commit the change with a clear message.
6. Push the branch to your fork.
7. Open a Pull Request against `main`.

Do not push directly to `main`. Pull Requests are reviewed before merge.

## Pull Requests

Include the following information:

- What problem the change fixes.
- Which files were changed.
- How the change was tested.
- TV model and webOS version, when the change affects real-TV behavior.
- Screenshots or a short recording for visual changes.

Keep unrelated changes out of the same Pull Request. Do not include private
network configuration, credentials, historical IPK files or generated build
folders.

## Testing limitations

Docker can test the browser UI, responsive layout, local persistence and basic
JavaScript behavior. Luna Service, the Magic Remote, portal sessions and real
video decoding must be tested on an LG TV.

## License and scope

By contributing, you agree that your contribution can be distributed under the
repository license. XuWosTv is an unofficial project and does not include
audiovisual content or authorize access to services that the user does not
already have permission to use.
