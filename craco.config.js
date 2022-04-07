const path = require('path');
const CracoLessPlugin = require('craco-less');

module.exports = {
  webpack: {
    configure:(webpackConfig, { env, paths }) => {
      // 修改build的生成文件名称
      paths.appBuild = 'dist';
      webpackConfig.output ={
        ...webpackConfig.output,
        path: path.resolve(__dirname,'dist'),
        publicPath: '/',
      };
      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          // 应用全局样式与开启css module
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};