name: Release Product

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Generate Changelog
        run: |
          echo "## Release $GITHUB_REF_NAME" >> product/release/changelog.md
          git log -1 --pretty=format:"- %s" >> product/release/changelog.md

      - name: Build Certificate
        run: |
          echo "Building Product Certificate..."

      - name: Publish Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            product/release/changelog.md
            CERTIFICATE_OF_COMPLETION.md