# piconvert

Convert pictures to other formats. GitHub Actions & CLI Tool supported.

## Features

-   Import (input) formats: `ai`, `cdr`, `vsd`, `pdf`, `jpg`, `png`, `gif`, and `bmp`
-   Export (output) formats: `svg`, `png`, `ps`, `eps`, `pdf`, `emf`, `wmf`, and `xaml`.

## Usage

### GitHub Actions

```yaml
- name: Piconvert
  uses: JacobLinCool/piconvert@0.2.0
    with:
      src: ./pictures
      dist: ./piconvert
      inputs: ai
      outputs: svg,png
```

See [action.yml](./action.yml) for more details.

### CLI Tool

```bash
npm install -g piconvert
```

```
Usage: piconvert [options] [path]

Arguments:
  path                     Source path. If it's a directory, all files matched selected import types in it and its subdirectories will be converted. (default: "pictures")

Options:
  -V, --version            output the version number
  -d, --dir <directory>    Output directory (default: "piconvert")
  -i, --inputs <formats>   Import (input) formats. Supports: ai,cdr,vsd,pdf,jpg,jpeg,png,gif,bmp (default: "ai")
  -o, --outputs <formats>  Export (output) formats. Supports: svg,png,ps,eps,pdf,emf,wmf,xaml (default: "svg,png")
  -f, --force              Overwrite existing files (default: false)
  -s, --silent             Silent mode, no output (default: false)
  -v, --verbose            Verbose mode, print all Inkscape output (default: false)
  -h, --help               display help for command
```

## Requirement

If you are using GitHub Actions, then you don't need to install any dependencies.

But if you are using the cli tool on your computer, make sure you have installed `inkscape` first.

## Links

-   [GitHub Actions](https://github.com/marketplace/actions/piconvert)
-   [Repository](https://github.com/JacobLinCool/piconvert)
