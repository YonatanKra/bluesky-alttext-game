# Heart Component

This component is part of the `alt-text-bluesky-game` project. The Heart component is responsible for rendering a heart icon and which can be dynamically filled with a selected color

## Installation

```bash
npm install @yonatan-kra/heart-component
```

## Usage

To use the Heart component in your project, import it and include it in your JSX:

```html
<div>
  <filling-heart></filling-heart>
</div>
<script type="module">
  import "@yonatan-kra//heart-component";

</script>
```

## Props

The Heart component accepts the following props:

| Prop      | Type     | Description                              |
| --------- | -------- | ---------------------------------------- |
| `color`   | string  | Sets the hearts fill color  (defaults to red)     |
| `percentage` | number | Sets the fill percentage (bottom to top) |

## Example
```html
<filling-heart percetange="90" color="purple"/>
```

## Contributing

We welcome contributions to the Heart component. Please follow the [contribution guidelines](../../CONTRIBUTING.md) and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for more details.
