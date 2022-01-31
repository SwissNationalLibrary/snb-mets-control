module.exports = {
  transpileDependencies: [
  ],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      preload: 'src/preload.js',
      builderOptions: {
        win: {
          asarUnpack: "**\\*.node"
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          perMachine: true,
        }
      }
    }
  }
}
