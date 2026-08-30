# Design Templates

This folder contains pre-made design templates that users can choose from.

## Adding New Designs

1. Add your PNG/JPEG image files to this folder
2. Update `designs.json` with the new design information
3. Recommended image size: 1000x1000px or larger
4. Use transparent backgrounds (PNG) for best results

## Current Designs

The `designs.json` file contains metadata for all available designs. Each design should have:
- `id`: Unique identifier
- `name`: Display name
- `thumbnail`: Path to the image file (relative to public folder)
- `category`: Category for filtering (optional)

## Example Entry

```json
{
  "id": "my-design",
  "name": "My Awesome Design",
  "thumbnail": "/designs/my-design.png",
  "category": "Custom"
}
```
