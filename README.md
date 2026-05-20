# Seabost Prototype Hosting

这个仓库用于托管产品经理 AI 工作流生成的 HTML 可交互原型。

默认约定：

- 生成原型：只在本地产出 `index.html`
- 分享原型：发布到本仓库的 GitHub Pages
- 同事访问固定 setup 页面后，完成本机授权和环境变量配置

当前固定链接：

- Setup 页面：`/setup/`
- 原型发布根目录：`/prototypes/`

GitHub Pages 默认域名：

```text
https://wanggeng826-bot.github.io/seabost-prototype-hosting/
```

## 给同事开写权限

这是个人账号仓库，不能自助申请写权限，必须由仓库 owner 手动邀请。

操作路径：

1. 打开仓库 `Settings`
2. 打开 `Collaborators`
3. 点击 `Add people`
4. 输入同事 GitHub 用户名
5. 发送邀请
6. 同事接受邀请

同事只要有 `Write` 权限，就可以通过 `分享原型` 发布 HTML 原型。

## 给同事的配置口径

让同事先打开：

```text
https://wanggeng826-bot.github.io/seabost-prototype-hosting/setup/
```

然后按页面里的步骤执行：

1. `gh auth login`
2. 接受仓库邀请
3. 配置环境变量

```bash
export PROTOTYPE_HOSTING_REPO=wanggeng826-bot/seabost-prototype-hosting
export PROTOTYPE_BASE_URL=https://wanggeng826-bot.github.io/seabost-prototype-hosting
```

建议写入 `~/.zshrc`：

```bash
echo 'export PROTOTYPE_HOSTING_REPO=wanggeng826-bot/seabost-prototype-hosting' >> ~/.zshrc
echo 'export PROTOTYPE_BASE_URL=https://wanggeng826-bot.github.io/seabost-prototype-hosting' >> ~/.zshrc
source ~/.zshrc
```
