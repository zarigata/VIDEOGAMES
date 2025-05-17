# Honest Games Portal

A browser-based game portal designed to be hosted on GitHub Pages. This portal features games that are exactly what their names suggest - no misleading ads or false advertising.

## Features

- Modern, responsive design
- Simple game selection interface
- Easily extensible game library
- Ready for GitHub Pages deployment

## Project Structure

```
VIDEOGAMES/
│
├── index.html          # Main entry point
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   ├── game-data.js    # Game configuration and API
│   └── game-loader.js  # Game loading functionality
├── assets/             # Images and other static assets
└── games/              # Individual game directories
    ├── match-3/
    ├── runner/
    ├── snake/
    └── memory/
```

## Hosting on GitHub Pages

1. Create a new GitHub repository
2. Push this project to the repository
3. Enable GitHub Pages from the repository settings
   - Go to Settings > Pages
   - Select the branch to deploy (usually `main` or `master`)
   - Save the settings
4. Your game portal will be available at `https://[your-username].github.io/[repo-name]/`

## Adding New Games

To add a new game to the portal:

1. Create a new directory in the `games/` folder
2. Implement your game using HTML, CSS, and JavaScript
3. Add game metadata to `js/game-data.js`
4. Add a thumbnail image to the `assets/` directory

## License

This project is open source and available for personal and educational use.
