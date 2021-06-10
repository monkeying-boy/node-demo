import fs from "fs";
import path from 'path'
import { inspect } from 'util'
// import http from 'http'
import MarkdownIt from 'markdown-it'

const MD = new MarkdownIt()
// 文件
const FILE = 1;
// 文件夹
const FOLDER = 2;

// const PORT = '3000'

const log = (...data) => {
  console.log()
  console.log('\x1B[36m%s\x1B[0m', ...data)
  console.log()
}
const info = (...data) => {
  console.log()
  console.log('\x1B[36m%s\x1B[0m', inspect(...data, { depth: null }))
  console.log()
}

// const server = http.createServer((req, res) => {
//   const {url} = req
//   log(url,'req')

//   const data = readDir()
//   log(data,'data2')
//   let template = MD.render(data[0])

//   res.statusCode = 200
//   res.setHeader('Content-Type','text/html;charset="utf-8"');
//   res.end(template);
// })

// server.listen(PORT, () => {
//   console.log()
//   console.log(`服务器运行在 http://localhost:${PORT}/`)
//   console.log()
// })


/**
 * 获取目录下面所有内容并返回数组
 * @param {String} entry 入口目录
 * @param {String} parentDir 父级文件夹名称
 * @returns
 * 返回格式:
 * [
    {
      "dir": "2021-06-05", 目录名称
      "children": [
        {
          "fileName": "test.html",  文件名
          "content": "## test.md",  文件内容
          "type": 1,                1 是文件 2 是文件夹
        }
      ],
      "type": 2
    },
    { "fileName": "c.html", "content": "## c.md", "type": 1 }
  ]
 */
const readDir = (entry, parentDir) => {
  const result = []

  // 获取所有文件
  const dirList = fs.readdirSync(entry);
  if (!dirList.length) {
    return
  }

  dirList.forEach(item => {
    const location = path.join(entry, item)
    const stat = fs.lstatSync(location)
    const isDir = stat.isDirectory()

    if (isDir) {
      let child = readDir(location, item)
      const params = {
        dir: item,
        children: child,
        type: FOLDER
      }
      result.push(params)

    } else {
      // 判断是否是 md 文件
      if (/\.md$/.test(item)) {
        // 同步读取 md 文件内容
        const content = fs.readFileSync(location, 'utf-8');
        const params = {
          fileName: item.replace(/\.md$/, '.html'),
          content: content.toString(),
          type: FILE
        }
        result.push(params)
      }
    }
  })

  return result
}

/**
 * 写入文件
 * @param {String} filepath 文件路径
 * @param {String} fileName 文件名（带后缀）
 * @param {String} content  文件内容
 * @returns 
 */
const transformationHtml = (filepath, fileName, content) => {
  fs.writeFileSync(`${filepath}/${fileName}`, content, 'utf8');
  log(`${filepath}/${fileName}----完成`);
}
/**
 * 
 * @param {String} entry 入口地址
 * @param {Array} data   需要写入的数据
 */
const build = (entry, data) => {

  // 判断是否有文件夹 没有就新建
  if (!fs.existsSync(entry)) {
    fs.mkdirSync(entry)
  }
  
  data.forEach(item => {
    if (item.type === FOLDER) {
      const dir = path.join(entry, item.dir)
      // 判断是否有文件夹 没有就新建
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
      }
      if ('children' in item && Array.isArray(item.children)) {
        build(dir, item.children)
      }
    } else {
      let html = MD.render(item.content)
      transformationHtml(entry, item.fileName, html)
    }
  })
}


const data = readDir(path.resolve('doc'))

build(path.resolve('dist'), data)