## Student Bay 项目总览

本仓库区分 `front-end` 与 `back-end` 两个部分，以区分前后端。

```
.
├── front-end/        # HTML/CSS/JS 及静态资源
├── back-end/         # Node.js + Express + SQLite 服务端
├── Assessment Brief - Group Project 2025-26.pdf
└── README.md         # 当前文件
```

### Front-end
- 首页：`front-end/index.html`
- 页面模版：位于 `front-end/pages/`
- 样式与脚本：分别位于 `front-end/css/` 与 `front-end/js/`
- 静态资源由 `back-end/index.js` 通过 `express.static('../front-end')` 提供

### Back-end
详见 [`back-end/README.md`](back-end/README.md)：
- `package.json`/`package-lock.json`、服务器入口 `index.js`
- API 路由位于 `back-end/routes/`
- 中间件、工具库、数据库脚本与 SQLite 文件集中在 `back-end/middleware|utils|db/`
- 运行方式：`cd back-end && npm install && npm start`

### 测试须知
1. **开发/演示**：需要在 `back-end` 目录下安装依赖并启动。
2. **环境变量**：在 `back-end/.env` 中设置 `PORT`、`JWT_SECRET`、`DB_PATH`，可以保持默认。
3. **数据库和图片案例**：在项目中添加了后缀为`.example`的图片文件夹和数据库文件，作为快速检验功能的路径，里面存有已经创建好的账号和商品，可以在更名后快速进行功能检验。
4. **测试用户**：本项目提供了一键填写的测试用户，但是需要测试者自己注册登录。
