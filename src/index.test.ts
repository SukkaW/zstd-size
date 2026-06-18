import { readFileSync, createReadStream } from 'node:fs';
import { expect } from 'earl';
import { describe, it } from 'mocha';

import { size, sync, stream, file, fileSync } from './index';
import type { ZstdSizeStream } from './index';

const fixture = readFileSync('src/index.test.ts', 'utf8');

describe('zstd-size', () => {
  describe('async', () => {
    it('should return compressed size smaller than original', async () => {
      const result = await size(fixture);
      expect(result).toBeLessThan(fixture.length);
    });

    it('should return a number', async () => {
      const result = await size(fixture);
      expect(result).toBeA(Number);
    });

    it('should accept Buffer input', async () => {
      const result = await size(Buffer.from(fixture));
      expect(result).toBeLessThan(fixture.length);
    });
  });

  describe('sync', () => {
    it('should return compressed size smaller than original', () => {
      expect(sync(fixture)).toBeLessThan(fixture.length);
    });

    it('should accept string input', () => {
      expect(sync(fixture)).toBeGreaterThan(0);
    });

    it('should accept Buffer input', () => {
      expect(sync(Buffer.from(fixture))).toBeLessThan(fixture.length);
    });
  });

  describe('compression level', () => {
    it('higher level should produce smaller or equal output', async () => {
      const level1 = await size(fixture, { level: 1 });
      const level19 = await size(fixture, { level: 19 });
      expect(level19).toBeLessThanOrEqual(level1);
    });

    it('sync - higher level should produce smaller or equal output', () => {
      const level1 = sync(fixture, { level: 1 });
      const level19 = sync(fixture, { level: 19 });
      expect(level19).toBeLessThanOrEqual(level1);
    });
  });

  describe('strategy option', () => {
    it('should accept strategy parameter', async () => {
      const result = await size(fixture, { strategy: 1 });
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(fixture.length);
    });

    it('sync - should accept strategy parameter', () => {
      const result = sync(fixture, { strategy: 1 });
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(fixture.length);
    });
  });

  describe('error handling', () => {
    it('async - should throw on invalid options', async () => {
      await expect(size(fixture, { strategy: 99999 })).toBeRejectedWith('Setting parameter failed');
    });

    it('sync - should throw on invalid options', () => {
      expect(() => sync(fixture, { strategy: 99999 })).toThrow('Setting parameter failed');
    });
  });

  describe('stream', () => {
    it('should report zstd-size via event', (done) => {
      const s = stream();
      createReadStream('src/index.test.ts')
        .pipe(s)
        .on('zstd-size', (streamSize: number) => {
          expect(streamSize).toBeGreaterThan(0);
          expect(streamSize).toBeLessThan(fixture.length);
          done();
        });
    });

    it('should set zstdSize property on end', (done) => {
      const s: ZstdSizeStream = stream();
      createReadStream('src/index.test.ts')
        .pipe(s)
        // eslint-disable-next-line prefer-arrow-callback -- this
        .on('end', function (this: ZstdSizeStream) {
          expect(s.zstdSize).toBeGreaterThan(0);
          expect(s.zstdSize).toBeLessThan(fixture.length);
          done();
        })
        .resume();
    });

    it('should pass through data unchanged', (done) => {
      let out = '';
      const s = stream();
      createReadStream('src/index.test.ts')
        .pipe(s)
        .on('data', (buf: Buffer) => {
          out += buf.toString();
        })
        .on('end', () => {
          expect(out).toEqual(fixture);
          done();
        });
    });
  });

  describe('file', () => {
    it('should return compressed size smaller than original', async () => {
      const result = await file('src/index.test.ts');
      expect(result).toBeLessThan(fixture.length);
    });

    it('should match async version', async () => {
      expect(await file('src/index.test.ts')).toEqual(await size(fixture));
    });
  });

  describe('fileSync', () => {
    it('should return compressed size smaller than original', () => {
      expect(fileSync('src/index.test.ts')).toBeLessThan(fixture.length);
    });

    it('should match sync version', () => {
      expect(fileSync('src/index.test.ts')).toEqual(sync(fixture));
    });
  });
});
