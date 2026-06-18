import { constants, zstdCompress, zstdCompressSync, createZstdCompress } from 'node:zlib';
import type { ZstdOptions } from 'node:zlib';
import { PassThrough, Transform } from 'node:stream';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

export interface ZstdEncodeParams {
  level?: number,
  strategy?: number
}

function formatBuffer(incoming: Buffer | string): Buffer {
  return typeof incoming === 'string' ? Buffer.from(incoming, 'utf8') : incoming;
}

function formatOptions(passed?: ZstdEncodeParams): ZstdOptions {
  const params: Record<number, number> = {
    [constants.ZSTD_c_compressionLevel]: passed?.level ?? constants.ZSTD_CLEVEL_DEFAULT
  };

  if (passed?.strategy != null) {
    params[constants.ZSTD_c_strategy] = passed.strategy;
  }

  return { params };
}

/**
 * @param incoming Either a Buffer or string of the value to encode.
 * @param options Subset of Encoding Parameters.
 * @return Promise that resolves with the encoded Buffer length.
 */
export async function size(incoming: Buffer | string, options?: ZstdEncodeParams): Promise<number> {
  const buffer = formatBuffer(incoming);

  return new Promise((resolve, reject) => {
    zstdCompress(buffer, formatOptions(options), (error: Error | null, result: Buffer) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve(result.byteLength);
    });
  });
}

/**
 * @param incoming Either a Buffer or string of the value to encode.
 * @param options Subset of Encoding Parameters.
 * @return Length of encoded Buffer.
 */
export function sync(incoming: Buffer | string, options?: ZstdEncodeParams): number {
  const buffer = formatBuffer(incoming);
  return zstdCompressSync(buffer, formatOptions(options)).byteLength;
}

/**
 * @param options Subset of Encoding Parameters.
 * @return Duplex stream that emits 'zstd-size' event with the compressed size on end.
 */
export interface ZstdSizeStream extends Transform {
  zstdSize: number
}

export function stream(options?: ZstdEncodeParams): ZstdSizeStream {
  const input = new PassThrough();
  const zstd = createZstdCompress(formatOptions(options));
  let compressedSize = 0;

  const wrapper: ZstdSizeStream = Object.assign(new Transform({
    transform(chunk, encoding, callback) {
      input.write(chunk, encoding, () => {
        callback(null, chunk);
      });
    },
    flush(callback) {
      input.end();
      zstd.on('end', () => {
        callback();
      });
    }
  }), { zstdSize: 0 });

  zstd.on('data', (buf: Buffer) => {
    compressedSize += buf.length;
  });
  zstd.on('end', () => {
    wrapper.zstdSize = compressedSize;
    wrapper.emit('zstd-size', compressedSize);
  });
  zstd.on('error', () => {
    wrapper.zstdSize = 0;
  });

  input.pipe(zstd);

  return wrapper;
}

/**
 * @param path File Path for the file to compress.
 * @param options Subset of Encoding Parameters.
 * @return Promise that resolves with size of encoded file.
 */
export async function file(path: string, options?: ZstdEncodeParams): Promise<number> {
  const fileContent = await readFile(path);
  return size(fileContent, options);
}

/**
 * @param path File Path for the file to compress.
 * @param options Subset of Encoding Parameters.
 * @return size of encoded file.
 */
export function fileSync(path: string, options?: ZstdEncodeParams): number {
  const fileContent = readFileSync(path);
  return sync(fileContent, options);
}
