export default {
  input: "src/main.js", // 指定模块入口
  output: {
      file: "dist/bundle.js", // 指定模块输出文件路径
      name: "res", // 用于接收模块的输出的变量
      format: "cjs", // 指定模块输出格式
      sourcemap: true // 开启sourcemap
  }
}