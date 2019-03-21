# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.6"></a>
## [2.0.6](https://github.com/alibaba-paimai-frontend/ide-tree/compare/v2.0.5...v2.0.6) (2019-03-21)


### Bug Fixes

* **组件渲染:** 解决 stores 更改 schema 后无法 re-render 组件的问题 ([09be8a5](https://github.com/alibaba-paimai-frontend/ide-tree/commit/09be8a5))


### Features

* **功能完善: 代码风格:** 同步升级到最新的 tpl 代码风格，接入 addModelChangeListener 方法 ([77f9997](https://github.com/alibaba-paimai-frontend/ide-tree/commit/77f9997))



<a name="2.0.5"></a>
## [2.0.5](https://github.com/alibaba-paimai-frontend/ide-tree/compare/v2.0.4...v2.0.5) (2019-03-08)


### Bug Fixes

* **api 插入兄弟节点:** 使用父节点而不是根节点来调用 addChild ([9536443](https://github.com/alibaba-paimai-frontend/ide-tree/commit/9536443))


### Features

* **schema:** 新增 addChild 功能，能够在指定位置新增子节点； ([97698b5](https://github.com/alibaba-paimai-frontend/ide-tree/commit/97698b5))
* **功能增强: 节点api:** 在 addChildNode api 中支持使用缓存区节点的添加为子节点功能，解决诸如 “粘贴” 节点的功能需求； ([f2416b5](https://github.com/alibaba-paimai-frontend/ide-tree/commit/f2416b5))
* **功能完善:** 新增 displayName，方便使用 react 调试 ([7b31f50](https://github.com/alibaba-paimai-frontend/ide-tree/commit/7b31f50))
* **功能新增: api:** 新增 getParendById api，可以根据节点获取父节点信息 ([4e1a4ac](https://github.com/alibaba-paimai-frontend/ide-tree/commit/4e1a4ac))
* **功能新增: api:** 新增 getSelection api；优化 createSchemaModel 方法； ([c2ecb27](https://github.com/alibaba-paimai-frontend/ide-tree/commit/c2ecb27))
* **功能新增: 节点api:** 新增拷贝(clone)节点的功能 api ([f71d85d](https://github.com/alibaba-paimai-frontend/ide-tree/commit/f71d85d))
* **节点操作api:** 新增 addSiblingNode api；接入 ide-lib 工具； ([66bcf73](https://github.com/alibaba-paimai-frontend/ide-tree/commit/66bcf73))



<a name="2.0.4"></a>
## [2.0.4](https://github.com/alibaba-paimai-frontend/ide-tree/compare/v2.0.3...v2.0.4) (2019-02-11)


### Features

* **功能调整:** 新增 store id；调整 umd 的 library name；调整成 otherProps； ([1ee2af8](https://github.com/alibaba-paimai-frontend/ide-tree/commit/1ee2af8))



<a name="2.0.3"></a>
## [2.0.3](https://github.com/alibaba-paimai-frontend/ide-tree/compare/v2.0.2...v2.0.3) (2018-12-26)



<a name="2.0.2"></a>
## [2.0.2](https://github.com/alibaba-paimai-frontend/ide-tree/compare/v2.0.1...v2.0.2) (2018-12-26)



<a name="1.0.5"></a>
## [1.0.5](https://github.com/alibaba-paimai-frontend/ide-tree/compare/v2.0.0...v1.0.5) (2018-12-26)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/alibaba-paimai-frontend/ide-tree/compare/v1.0.4...v2.0.0) (2018-12-26)


### Code Refactoring

* **重构:** 组件重命名，webpack build 配置更改 ([7afee15](https://github.com/alibaba-paimai-frontend/ide-tree/commit/7afee15))


### BREAKING CHANGES

* **重构:** 重命名组件名，将 ComponentTree 更改成 SchemaTree； 重新更改 webpack 打包



<a name="1.0.4"></a>
## [1.0.4](https://github.com/alibaba-paimai-frontend/ide-tree/compare/v1.0.3...v1.0.4) (2018-12-25)


### Bug Fixes

* **bugfix:** 修复 webpack 打包输出缺少 dist/index.js 的问题 ([fbacf2e](https://github.com/alibaba-paimai-frontend/ide-tree/commit/fbacf2e))



<a name="1.0.3"></a>
## [1.0.3](https://github.com/alibaba-paimai-frontend/ide-tree/compare/v1.0.2...v1.0.3) (2018-12-25)



<a name="1.0.2"></a>
## [1.0.2](https://github.com/alibaba-paimai-frontend/ide-tree/compare/v1.0.1...v1.0.2) (2018-12-25)


### Features

* **功能改进:** 更新 webpack 打包机制，新增 demo 文件的打包； ([3ad639d](https://github.com/alibaba-paimai-frontend/ide-tree/commit/3ad639d))



<a name="1.0.1"></a>
## 1.0.1 (2018-12-25)


### Features

* **功能完善:** 从 ide-component-tree 中剥离出 ide-tree 功能，更为纯粹普适 ([448fce8](https://github.com/alibaba-paimai-frontend/ide-tree/commit/448fce8))
