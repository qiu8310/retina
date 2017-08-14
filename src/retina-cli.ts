#!/usr/bin/env node

import * as cli from 'mora-scripts/libs/tty/cli'
import File from './File'
import * as fs from 'fs-extra'
import * as sharp from 'sharp'

cli({
  usage: 'retina [options] <command>'
})
.options('size', {
  'f | format': '<str> 指定添加在文件末尾的图片的尺寸的格式，默认是 -w-h'
})
.commands({
  size: {
    desc: '在文件末尾加上图片的尺寸',
    cmd: sizeCmd
  },
  ratio: {
    desc: '自动根据大的 ratio 图片，生成小的 ratio 图片，如：根据 @3x 可以生成 @2x 和 @1x 的图片',
    cmd: ratioCmd
  },
  sr: {
    desc: 'size & ratio',
    cmd: srCmd
  }
})
.parse(function(res) {
  this.error('没有指定要执行的命令')
})

function sizeCmd(res) {
  return res._.map(filepath => {
    let newFilepath = new File(filepath).getFilepathWithViewSize(res.format)
    fs.moveSync(filepath, newFilepath)
    return newFilepath
  })
}

function ratioCmd(res) {
  let filepathMap = {}
  let transforms = []
  res._.forEach(rawFilepath => {
    new File(rawFilepath).getRatioFilesInfo().forEach(({filepath, width, height}) => {
      if (!filepathMap[filepath] && !fs.existsSync(filepath)) {
        filepathMap[filepath] = true
        transforms.push({from: rawFilepath, to: filepath, width, height})
      }
    })
  })

  transforms.forEach(t => {
    sharp(t.from)
      .resize(t.width, t.height)
      .toFile(t.to)
  })
}

function srCmd(res) {
  let filepaths = sizeCmd(res)
  res._ = filepaths
  ratioCmd(res)
}
