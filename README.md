# zstd-size

> Get the [zstd](https://facebook.github.io/zstd/) compressed size of a string or buffer

Uses Node.js built-in `node:zlib` zstd support (Requires Node.js >= 22.15.0 (LTS) or >= 23.8.0), zero dependencies.


## Install

```sh
npm install zstd-size
yarn add zstd-size
pnpm add zstd-size
```

## Usage

```js
import { size, sync } from 'zstd-size';

const text = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.';

console.log(text.length);
//=> 191

console.log(sync(text));
//=> 133
```

## API

### `size(input, options?)`

Returns a `Promise<number>` with the compressed size.

### `sync(input, options?)`

Returns the compressed size.

- **input**: `string | Buffer`
- **options**:
  - **level**: `number`, default to `3` (`ZSTD_CLEVEL_DEFAULT`). Compression level (1-22).
  - **strategy**: `number`. [Zstd compression strategy](https://facebook.github.io/zstd/zstd_manual.html).

### `file(path, options?)`

Returns a `Promise<number>` with the compressed size of the file.

- **path**: `string`

### `fileSync(path, options?)`

Returns the compressed size of the file.

- **path**: `string`

### `stream(options?)`

Returns a [`stream.Transform`](https://nodejs.org/api/stream.html#class-streamtransform). The stream emits a `zstd-size` event and has a `zstdSize` property.

## License

[MIT](LICENSE)

----

**zstd-size** © [Sukka](https://github.com/SukkaW), Released under the [MIT](./LICENSE) License.
Authored and maintained by Sukka with help from contributors ([list](https://github.com/SukkaW/zstd-size/graphs/contributors)).

> [Personal Website](https://skk.moe) · [Blog](https://blog.skk.moe) · GitHub [@SukkaW](https://github.com/SukkaW) · Telegram Channel [@SukkaChannel](https://t.me/SukkaChannel) · Mastodon [@sukka@acg.mn](https://acg.mn/@sukka) · Twitter [@isukkaw](https://twitter.com/isukkaw) · BlueSky [@skk.moe](https://bsky.app/profile/skk.moe)

<p align="center">
  <a href="https://github.com/sponsors/SukkaW/">
    <img src="https://sponsor.cdn.skk.moe/sponsors.svg"/>
  </a>
</p>
