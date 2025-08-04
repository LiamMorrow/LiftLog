# Contributing to LiftLog

Thank you for your interest in contributing to LiftLog! We welcome all contributions, whether you're fixing bugs, adding features, improving documentation, or suggesting ideas.

## Code Style & Guidelines

- Use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) for formatting and linting TypeScript.
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

If you find a bug or have a feature request, please [open an issue](https://github.com/LiamMorrow/LiftLog/issues) and provide as much detail as possible.

## Code of Conduct

Please be respectful and considerate in all interactions. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for helping make LiftLog better!
