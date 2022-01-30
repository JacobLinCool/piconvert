# piconvert

Convert AI (Adobe Illustrator) pictures to other formats.

## Features

-   Converts `ai` to `svg`, `png`, `ps`, `eps`, `pdf`, `emf`, `wmf`, or `xaml`.

## Usage

### GitHub Actions

```yaml
- name: Piconvert
  uses: JacobLinCool/piconvert@0.1.3
    with:
      source: ./pictures
      dist: ./piconvert
      formats: svg,png
```

See [action.yml](./action.yml) for more details.

### CLI Tool

```bash
npm install -g piconvert
```

```
Usage: piconvert [options] [path]

Arguments:
  path                     Input Path. If it's a directory, all AI files in it and its subdirectories will be converted. (default: "pictures")

Options:
  -V, --version            output the version number
  -o, --output <folder>    Output Folder (default: "piconvert")
  -f, --formats <formats>  Output Formats. svg,png,ps,eps,pdf,emf,wmf,xaml (default: "svg,png")
  -F, --force              Force Overwrite (default: false)
  -s, --silent             Silent Mode (default: false)
  -v, --verbose            Verbose Mode (default: false)
  -h, --help               display help for command
```

## Requirement

If you are using GitHub Actions, then you don't need to install any dependencies.

But if you are using the cli tool on your computer, make sure you have installed `inkscape` first.
