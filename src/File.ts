/* tslint:disable:variable-name */
import * as fs from 'fs-extra'
import * as path from 'path'
import * as sizeOf from 'image-size'

interface IRatioFileInfo {
  ratio: number
  width: number
  height: number
  filepath: string
}

export default class File {
  width: number
  viewWidth: number
  height: number
  viewHeight: number

  filepath: string
  dirname: string
  extname: string
  name: string
  ratio: number
  private _buffer: Buffer

  constructor(filepath) {
    filepath = path.resolve(filepath)

    let {width, height} = sizeOf(filepath)
    this.width = width
    this.height = height
    let extname = path.extname(filepath)
    let name = path.basename(filepath, extname)
    let ratio = 1

    let reg = /@(\d)x$/
    if (reg.test(name)) {
      ratio = parseInt(RegExp.$1, 10)
      name = name.replace(reg, '')
    }

    this.viewWidth = Math.round(width / ratio)
    this.viewHeight = Math.round(height / ratio)

    this.dirname = path.dirname(filepath)
    this.extname = extname
    this.name = name
    this.ratio = ratio
  }

  get buffer(): Buffer {
    if (!this._buffer) this._buffer = fs.readFileSync(this.filepath)
    return this._buffer
  }

  getFilepathWithViewSize(format = '-w-h'): string {
    let suffix = format
      .replace('w', this.viewWidth + '')
      .replace('h', this.viewHeight + '')
    let name = this.name
    if (name.indexOf(suffix) !== name.length - suffix.length) {
      name += suffix
    }
    return path.join(this.dirname, name + `@${this.ratio}x` + this.extname)
  }

  getRatioFilesInfo(): IRatioFileInfo[] {
    let result = []
    for (let i = 1; i < this.ratio; i++) {
      result.push({
        ratio: i,
        width: Math.round(this.width * i / this.ratio),
        height: Math.round(this.height * i / this.ratio),
        filepath: path.join(this.dirname, this.name + `@${i}x` + this.extname)
      })
    }
    return result
  }
}
