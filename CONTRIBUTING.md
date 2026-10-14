# Contributing to LiftLog

Thank you for your interest in contributing to LiftLog! We welcome all contributions, whether you're fixing bugs, adding features, improving documentation, or suggesting ideas.

## Code Style & Guidelines

- Use [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) and [oxlint](https://oxc.rs/docs/guide/usage/linter.html) for formatting and linting TypeScript.
- For C# code, use [CSharpier](https://csharpier.com/) for automatic code formatting. Run `dotnet csharpier .` in backend folders before committing.
- Write clear, descriptive commit messages.
- Follow the existing code structure and naming conventions.
- Add comments where necessary, especially for complex logic.

## Making Changes

1. **Create a new branch** for your work:
   ```sh
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** and ensure all tests pass.
3. **Run tests**:
   - Frontend:
     ```sh
     npm test
     ```
   - Backend:
     ```sh
     dotnet test
     ```
4. **Push your branch** and open a Pull Request (PR) against `main`.

## Pull Request Checklist

- [ ] The code compiles and passes all tests.
- [ ] Linting and formatting checks pass.
- [ ] The PR description clearly explains the changes.
- [ ] Related documentation is updated.
- [ ] No sensitive information is included.

## Reporting Issues

If you find a bug, please [open an issue](https://github.com/LiamMorrow/LiftLog/issues) and provide as much detail as possible.
If you have a feature request, please search through [discussions](https://github.com/LiamMorrow/LiftLog/discussions) to see if it has been suggested, and if not submit a new discussion.
Feature requests will go through a vetting/planning phase in discussions before being turned into issues to signal it is planned or ready to be picked up.

Write issues and discussions in your own words. See [AI Usage Policy](#ai-usage-policy) below for details.

## AI Usage Policy

Using AI/LLM tools to help write code is acceptable when used with restraint. Follow the same rules you'd follow for a human written PR:

- PRs over a certain threshold (~100 lines) will likely not be reviewed in any reasonably timeframe
- PRs should be submitted AFTER raising issues or feature requests which have been accepted as wanted for the project

If you raise a PR out of the blue, it is unlikely to get any traction.

When it comes to issues, bug reports, and feature requests, please keep the following in mind:

- Do not post AI-written feature requests or bug reports. AI summaries tend to be verbose, which wastes the reader's time. Write your own problem statement in your own words.
- Submit bug reports and feature requests in your original language. If you're not comfortable writing in English, write in your own language and I'll translate it if needed.

## License

By contributing, you agree that your contributions will be licensed under the [AGPL v3 license](LICENSE).

---

Thank you for helping make LiftLog better!
