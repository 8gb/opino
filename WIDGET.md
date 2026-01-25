# Opino Widget Documentation

The Opino Widget is a lightweight, React-based client that renders the comment system on your static website. It is designed to be privacy-focused and easy to embed.

## Table of Contents
1.  [Integration](#integration)
2.  [Configuration](#configuration)
3.  [CSS Customization](#css-customization)
4.  [Development](#development)

## Integration

### Quick Embed (CDN)
The easiest way to use Opino is via our CDN. Add this snippet to your HTML where you want the comments to appear:

```html
<!-- Container for comments -->
<div id="cmt" data-opino-site="YOUR_SITE_ID"></div>

<!-- Opino Script -->
<script src="https://cdn.opino.ongclement.com/main.js"></script>
```

Replace `YOUR_SITE_ID` with the ID obtained from the Opino Dashboard.

### Self-Hosted Script
If you are hosting your own backend or want to host the script yourself:
1.  Build the project (see [Development](#development)).
2.  Host the `dist/main.js` file on your server.
3.  Point the `<script src="...">` to your location.

## Configuration

The widget is configured entirely via HTML attributes on the container element.

| Attribute | Required | Description |
| :--- | :--- | :--- |
| `id` | **Yes** | Must be exactly `cmt`. The React app mounts to this ID. |
| `data-opino-site` | **Yes** | The UUID for your site. This links comments to your specific site configuration in the backend. |

## CSS Customization

Opino uses **CSS Modules** for scoping styles to prevent conflicts with your website's existing CSS. However, the structure is simple, and you can customize the appearance by overriding the classes or modifying `index.css` if you are building from source.

### Structure & Classes
The widget renders a simple structure. Here are the key classes defined in `index.css`:

| Class Name | Description |
| :--- | :--- |
| `.main` | The top-level container for the widget. Uses `system-ui` font family by default. |
| `.textarea` | The input area for typing comments. |
| `.name` | The input field for the author's name. |
| `.button` | The "Post" button. Floats right by default. |
| `.msgbox` | Container for a single comment. |
| `.commentorDetails` | Metadata line (Author Name • Time ago). |
| `.error` | Error message banner (e.g., for network issues). |

### Customizing Styles
Since the styles are injected via JavaScript (Webpack style-loader), you can override them in your site's global CSS using `!important` or high-specificity selectors if you are using the CDN version.

**Example: Dark Mode Override**
```css
/* In your site's CSS */
#cmt .textarea, #cmt .name {
    background-color: #333;
    color: #fff;
    border-color: #555;
}
#cmt .button {
    background-color: #0070f3;
    color: white;
    border: none;
    border-radius: 4px;
}
```

If you are building from source, simply edit `index.css` in the root directory and rebuild.

## Development

If you want to contribute to the widget or build a custom version.

### Prerequisites
*   Node.js (v14 or higher recommended)
*   npm

### Build Instructions

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure API Endpoint**:
    Open `index.js` and update the `LINK` constant if you are connecting to a self-hosted backend.
    ```javascript
    const LINK = `https://your-api-domain.com`
    ```

3.  **Build**:
    ```bash
    npm run build
    ```
    This runs Webpack using `prod.config.js`. The output is generated at `dist/main.js`.

4.  **Watch Mode**:
    The default build command runs in watch mode (`watch: true` in config). It will recompile on file changes.

### Local Testing
To test the widget locally:
1.  Run `npm run build`.
2.  Create an `index.html` file that references `dist/main.js`.
3.  Serve it using a simple HTTP server (e.g., `python3 -m http.server`).
