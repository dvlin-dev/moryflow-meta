# Editor

The center area is where you write—feels a bit like Notion.

<!-- Screenshot placeholder: editor interface -->
![Editor](/images/editor/editor-interface.png)

## Supported Formats

### Headings

```markdown
# Big heading
## Medium heading
### Small heading
```

Type `#` plus a space and it becomes a heading.

### Text Styles

| Effect | How to type | Shortcut |
|--------|-------------|----------|
| **Bold** | `**text**` | `⌘/Ctrl + B` |
| *Italic* | `*text*` | `⌘/Ctrl + I` |
| ~~Strikethrough~~ | `~~text~~` | - |
| `Code` | `` `code` `` | `⌘/Ctrl + E` |

### Lists

```markdown
- This is a bullet list
- Second item

1. Numbered list
2. Second item

- [ ] To-do item
- [x] Completed
```

### Quotes

```markdown
> Quoted content
```

### Code Blocks

````markdown
```javascript
console.log("Hello!")
```
````

Automatically detects the language and adds syntax highlighting.

### Tables

```markdown
| Name | Price |
|------|-------|
| Apple | $2 |
| Banana | $1 |
```

### Horizontal Rule

```markdown
---
```

### Links and Images

```markdown
[Link text](https://example.com)
![Image description](image-url)
```

You can also drag images directly in.

## Slash Commands

Type `/` to bring up a menu for quickly inserting things:

<!-- Screenshot placeholder: slash menu -->
![Slash Commands](/images/editor/slash-menu.png)

| Type | Inserts |
|------|---------|
| `/h1` `/h2` `/h3` | Headings |
| `/bullet` | Bullet list |
| `/todo` | To-do checklist |
| `/code` | Code block |
| `/table` | Table |
| `/quote` | Quote |
| `/image` | Image |

## When You Select Text

Select some text and a small toolbar appears above:

<!-- Screenshot placeholder: floating toolbar -->
![Toolbar](/images/editor/floating-toolbar.png)

Quickly make it bold, italic, change color, add links.

## Open Multiple Notes

Open several tabs like in a browser:

<!-- Screenshot placeholder: tabs -->
![Tabs](/images/editor/tabs.png)

- Click a file to open in a new tab
- Click tabs to switch
- Click × to close
- Drag to reorder

## Auto-Save

No need to press save while writing—MoryFlow saves automatically.

Top right shows the status:
- ✓ Saved
- ○ Saving
- ✗ Error

## Keyboard Shortcuts

**Editing**

| Function | Mac | Windows |
|----------|-----|---------|
| Undo | `⌘ + Z` | `Ctrl + Z` |
| Redo | `⌘ + Shift + Z` | `Ctrl + Shift + Z` |
| Select all | `⌘ + A` | `Ctrl + A` |

**Formatting**

| Function | Mac | Windows |
|----------|-----|---------|
| Bold | `⌘ + B` | `Ctrl + B` |
| Italic | `⌘ + I` | `Ctrl + I` |
| Code | `⌘ + E` | `Ctrl + E` |

**Navigation**

| Function | Mac | Windows |
|----------|-----|---------|
| Quick find file | `⌘ + P` | `Ctrl + P` |
