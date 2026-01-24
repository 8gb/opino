# Opino – Plug-and-Play Comment Widget for Static Sites

A lightweight, React-based comment system component designed to be embedded in static websites.

## Features

- **Easy Integration:** Embed with a single script tag and a container `div`.
- **React-based:** Built with React 17 for a modern, responsive UI.
- **CSS Modules:** Styles are encapsulated using CSS modules to prevent conflicts with your site's styles.
- **Real-time-ish:** Fetches comments from a backend API.

## Usage

### 1. via CDN

You can include the built JavaScript file directly from the CDN:

```html
<!-- Container for the comments -->
<div id="cmt" data-opino-site="YOUR_SITE_NAME"></div>

<!-- Include the script -->
<script src="https://cdn.opino.ongclement.com/main.js"></script>
```

Replace `YOUR_SITE_NAME` with your registered site identifier on the Opino platform.

### 2. Build from Source

If you want to host the file yourself or customize the code:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/8gb/opino.git
    cd opino
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the project:**
    ```bash
    npm run build
    ```
    This will run Webpack using `prod.config.js`. Note that the configuration is currently set to `watch: true`, so it will continue running and watching for changes. The output file will be generated at `dist/main.js`.

4.  **Embed:**
    Copy `dist/main.js` to your project and include it in your HTML as shown in the CDN method, pointing the `src` to your local file.

## Development

If you are developing this component and want to test it within another local project:

1.  **Configure Output:** Open `prod.config.js` and modify the `output` path to point to your local project's static assets folder.
    ```javascript
    output: {
      path: path.resolve(__dirname, "../your-project/assets/js"), // Example path
      filename: 'main.js',
    }
    ```

2.  **Embed in Local Project:** In your local project's HTML file (e.g., `index.html`), embed the script pointing to the file you just configured.
    ```html
    <div id="cmt" data-opino-site="dev-test"></div>
    <script src="./assets/js/main.js"></script>
    ```

3.  **Run & Watch:** Run the build command.
    ```bash
    npm run build
    ```
    Webpack is configured with `watch: true`, so any changes you make to the Opino source code will automatically rebuild `main.js` in your target project folder.

## Configuration

The component requires a specific DOM element to mount:

- **ID:** `cmt` (Required)
- **Attribute:** `data-opino-site` (Required) - The unique identifier for your site.

## Customization

This project uses CSS Modules. If you are building from source and want to change the appearance, you should modify `index.css`. The styles are scoped locally by default.

## Self-Hosting

The frontend component connects to a backend service. By default, it connects to `https://api.opino.ongclement.com`.

If you wish to self-host the backend, you will need to:
1.  Build a REST API service that handles comments (GET `/thread`, POST `/add`).
2.  Update the `LINK` constant in `index.js` to point to your API URL.
3.  Rebuild the frontend component.
