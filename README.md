## Student Bay 项目总览

本仓库遵循《Assessment Brief - Group Project 2025-26》对交付物的结构要求，区分 `front-end` 与 `back-end` 两个顶层目录，便于分别提交静态资源与服务器代码，同时由后端统一托管完整站点。

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
详见 [back-end/README.md](back-end/README.md)：
- `package.json`/`package-lock.json`、服务器入口 `index.js`
- API 路由位于 `back-end/routes/`
- 中间件、工具库、数据库脚本与 SQLite 文件集中在 `back-end/middleware|utils|db/`
- 运行方式：`cd back-end && npm install && npm start`

### 提交与运行建议
1. **开发/演示**：始终在 `back-end` 目录下安装依赖并启动，服务器会自动挂载 `front-end` 静态页面与 `/api/*`。
2. **提交打包**：保持 `front-end`、`back-end` 双目录结构，与 PDF 要求一致后再统一压缩。
3. **环境变量**：在 `back-end/.env` 中设置 `PORT`、`JWT_SECRET`、`DB_PATH=./db/student_bay.db` 等键值。

如需更深入的 API、数据库及运行说明，请参考 [`back-end/README.md`](back-end/README.md)。该结构可直接映射到 Assessment Brief 中列出的“Front-end Folder / Back-end Folder / README File”要求，便于导师审核与归档。  


