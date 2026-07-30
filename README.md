# UltraText
## Ultracharge your HTML.

UltraText is a runtime HTML templating system. Think Sass but for HTML. You write modular .utml files with components and imports, drop one script into your page, and it all stitches together in the browser, no compiling!

## How it works

Include the script in your `<head>`:

```html
<script src="ultratext.min.js"></script>
```

Create a .utml file with the UTML doctype:

```html
<!DOCTYPE UTML>
<html>
<head>
  <title>My Epikly Cool Site</title>
</head>
<body>
  <h1>Hello, UltraText!</h1>
</body>
</html>
```

Link to it like any other page. When clicked, UltraText swaps in the content instantly.

## Imports

Reuse pieces across pages with `<import>` tags. Create a component file wrapped in `<component>`:

```html
<component>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</component>
```

Pull it into any UTML page:

```html
<!DOCTYPE UTML>
<html>
<head>
  <title>My Epik Site</title>
</head>
<body>
  <import src="components/nav.utml">
  <main>
    <p>Welcome to my site.</p>
  </main>
</body>
</html>
```

Imports resolve relative to the file that contains them. They work recursively! a component can import other components. They can't be circular though.

## Why not just use a framework?

UltraText is for people who want to write plain HTML without committing to a framework, and want some spicy features.

## File extension

Use `.utml` for your template files and serve them with any static server. The only requirement is that the file starts with `<!DOCTYPE UTML>` so the script knows to handle it, and so browsers don't break trying to render it.

## Browser support

Works in any modern browser that supports `fetch`, `history.pushState`, and `Promise` (Chrome, Firefox, Safari, Edge). For the non super nerds, this means it will probably work for you.

## License

MIT.
