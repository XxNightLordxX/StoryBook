# Contributing to Story-Unending

Thank you for your interest in contributing to the Story-Unending project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or videos if applicable
- Environment information (browser, OS, etc.)
- Any relevant error messages or logs

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- Use a clear and descriptive title
- Provide a detailed description of the enhancement
- Explain why this enhancement would be useful
- Provide examples of how the enhancement would be used
- Consider including mockups or designs if applicable

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Write tests** for your changes
5. **Ensure all tests pass** (`npm test`)
6. **Commit your changes** with clear, descriptive messages
7. **Push to your branch** (`git push origin feature/amazing-feature`)
8. **Create a Pull Request**

### Pull Request Guidelines

- Keep PRs focused and small
- Write clear commit messages
- Include tests for new features
- Update documentation as needed
- Ensure code follows existing style
- All tests must pass

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/XxNightLordxX/Story-Unending.git
cd Story-Unending
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build for production
npm run build
```

## Coding Standards

### JavaScript

- Use ES6+ features
- Follow existing code style
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Use IIFE pattern for modules
- Export to global namespace with clear names

### CSS

- Use BEM naming convention
- Keep selectors specific but not overly complex
- Use CSS variables for theming
- Ensure responsive design

### Documentation

- Update README.md for user-facing changes
- Update CHANGELOG.md for version changes
- Add JSDoc comments for new functions
- Update relevant design documents

## Project Structure

```
Story-Unending/
├── css/                 # Stylesheets
├── js/                  # JavaScript modules
│   ├── modules/        # Core functionality modules
│   ├── ui/             # UI components
│   └── utils/          # Utility functions
├── docs/               # Documentation
├── tests/              # Test files
├── scripts/            # Development scripts
├── utils/              # Utility files
├── index.html          # Main HTML file
├── story-engine.js     # Story generation engine
├── backstory-engine.js # Backstory generation engine
└── styles.css          # Main stylesheet
```

## Commit Message Format

Follow conventional commits format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
- `feat(analytics): add session tracking`
- `fix(auth): resolve login rate limiting issue`
- `docs(readme): update installation instructions`

## Getting Help

- Check existing documentation in `/docs`
- Review existing issues and pull requests
- Ask questions in issues with the `question` label

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in the project's CONTRIBUTORS file.

Thank you for contributing to Story-Unending!