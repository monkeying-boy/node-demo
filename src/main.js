import fs from "fs";
import path from 'path'
import { inspect } from 'util'
// import http from 'http'
import MarkdownIt from 'markdown-it'

const MD = new MarkdownIt()

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



const readDir = (entry) => {
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
      log(item, '是文件夹')

      let child = readDir(location, result)
      const params = {
        dir: item, // md 文件名称
        children: child,
        type: 2
      }
      result.push(params)

    } else {
      log(item, '不是文件夹')

      // 判断是否是 md 文件
      if (/\.md$/.test(item)) {
        // 同步读取 md 文件内容
        const content = fs.readFileSync(location, 'utf-8');
        const params = {
          dir: item.replace(/\.md$/, ''), // md 文件名称
          content: content.toString(),
          type: 1
        }
        result.push(params)
      }
    }
  })

  return result
}


const data = readDir(path.resolve('doc'))

info(data)

// fs.writeFileSync(path.resolve('data.js'),JSON.stringify(data),'utf-8')

// 转换成 html 文件
const transformationHtml = (filepath,item) => {
  let template = MD.render(item.content)
  let fileName = `${item.dir}.html`
  fs.writeFile(`${filepath}/${fileName}`, template, 'utf8', (err) => {
    if (err) throw err;
    log(`${item}-->${fileName}-文件已被保存`);
  });
}

const build = (data) => {

  let filepath = path.resolve('dist')
  // 判断是否有 dist 文件夹 没有就新建
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath)
  }
  data.forEach(item => {
    const dir = path.join(filepath, item.dir)
    /** 
     * type
     * 1 文件
     * 2 文件夹
     */
    if (item.type === 2) {
      // 没有该文件夹就创建
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
      }
      // let { children } = item
      // info(children,'children')
      // children.forEach( item =>{
      //   let template = MD.render(item.content)
      //   let fileName = item.replace(/\.md$/, '.html')
      //   fs.writeFile(`${filepath}/${fileName}`, template, 'utf8', (err) => {
      //     if (err) throw err;
      //     log(`${item}-->${fileName}-文件已被保存`);
      //   });
      // })
      // transformationHtml(filepath, item)
      build(item.children)
    } else {
      transformationHtml(filepath, item)
    }
  })
}


// build(data)