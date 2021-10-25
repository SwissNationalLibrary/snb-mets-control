module.exports = {
  transpileDependencies: [
  ],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      preload: 'src/preload.js',

    }
  }
}
