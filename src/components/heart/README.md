# Heart Component

This web component is part of the `alt-text-bluesky-game` project. The Heart component is responsible for rendering a heart icon. It can be dynamically filled with a selected color and change in size.

## Usage

You can use it with the unpkg CDN: 

```html
<script type="module" src="https://www.unpkg.com/@yonatan-kra/heart-component@1.2.0/heart.es.js" defer></script>
<div>
  <love-meter></love-meter>
</div>
```

To use the Heart component in your project, install it and import it in your scripts:

```bash
npm install @yonatan-kra/heart-component
```

```html
<div>
  <love-meter></love-meter>
</div>
<script type="module">
  import "@yonatan-kra/heart-component";

</script>
```

## Props

The Heart component accepts the following props:

| Prop      | Type     | Description                              |
| --------- | -------- | ---------------------------------------- |
| `color`   | string  | Sets the hearts fill color  (defaults to red)     |
| `percentage` | number | Sets the fill percentage (bottom to top) |
| `size` | number | Sets the width and height of the heart (defaults to 24) |

## Example
```html
<love-meter percetange="90" color="purple" size="50"></love-meter>
```

Also see this [CodePen example](https://codepen.io/yonatankra/pen/WbejPbm?editors=1111)

## Contributing

1. Fork
2. Clone
3. `npm install`
4. `npm start` to run the demo app with the heart inside
5. Run the tests: `npm test`

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for more details.
