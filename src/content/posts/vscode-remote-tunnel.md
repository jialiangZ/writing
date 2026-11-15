---
title: "VS Code Tunnel 食用指南：不买公网 IP，也不配 SSH"
description: "从一台只能出网的机器开始，把 VS Code Tunnel 的安装、登录、systemd 常驻、桌面与浏览器连接、排错讲清楚，并顺手修掉几篇老教程里已经过时的坑。"
pubDatetime: 2026-11-15
lang: zh
kind: longform
tags: ["vscode", "remote-development", "tunnel"]
---

家里一台性能不错的台式机，手上是一台轻薄本；或者实验室的服务器在校园网 NAT 后面，只允许出站；又或者云上的 GPU 机器根本没有公网 IP。这些场景下，VS Code 的 Remote Tunnel 基本是最省事的一条路：**远程机器主动连出去，本地像连本地一样写代码**，不需要公网 IP，不需要开入站端口，也不需要先配好 SSH。

这篇把三件事讲清楚：它到底怎么工作、怎么装成长期可用的服务、坏了从哪里查。文中的命令以 Linux 为主，Windows 和 macOS 的差异单独标出。

> [!note]
> 本文在 2026 年 11 月用 VS Code CLI **1.146.0** 验证，并对照了当前的 Remote Tunnels 官方文档。老教程里最容易过期的两个地方——CLI 下载地址和 systemd 服务细节——已经按现在的版本改正。

## 它解决的是“连接”，不是“端口”

先把它和几种常见方案摆在一起看：

| 方案 | 需要公网 IP / 入站端口 | 需要自己维护中转 | 认证方式 | 适合 |
| --- | --- | --- | --- | --- |
| Remote - SSH | 通常需要，或者至少要有可达路由 | 否 | SSH 密钥 / 密码 | 有公网 IP、网络稳定的服务器 |
| frp / 内网穿透 | 需要一台有公网 IP 的 VPS | 是 | 自己配 | 需要暴露任意 TCP 服务 |
| VS Code Tunnel | **不需要** | 否，走微软中继 | GitHub / Microsoft 账号 | NAT、校园网、移动网络、临时机器 |

Tunnel 的连接方向是这样的：

```text
本地 VS Code Desktop / 浏览器
        │  HTTPS 443（出站）
        ▼
Microsoft Dev Tunnels 中继
        ▲  HTTPS 443（出站）
        │
远程机器：code tunnel → VS Code Server
```

远程机器上跑的是 **VS Code Server**，编辑器界面、终端、语言服务、调试器和大部分扩展都跑在远程；本地只是负责显示和输入。所以代码不需要同步到笔记本上，轻薄本也能用上远程的大内存和 GPU。

但这也意味着它不是 VPN，不是远程桌面，也不是文件同步工具：它只服务于 VS Code 这条链路。官方还有几条边界值得先知道：

- **一个 Server 实例按设计同一时间只给一个客户端使用**，不是多人协作环境。
- 每个账号目前最多 **10 个 tunnel**，超出时 CLI 可能删掉一个未使用的；带宽也有滥用保护限制，具体数字会变。
- 它依赖微软的中继服务和你的账号。**不要把生产环境的唯一入口押在它上面**，SSH 或 Tailscale 留一个备用入口。

## 开始之前

服务端只需要满足这些条件：

- Linux x86_64 / ARM64、Windows 或 macOS；
- Linux 建议内核 ≥ 4.18、glibc ≥ 2.28（VS Code 1.99 之后的要求），Ubuntu 20.04+、Debian 10+、RHEL 8+ 这一类都没问题；
- 能访问外网 443，**不需要公网 IP，不需要开放入站端口，也不需要 root**；
- 用一个普通用户跑，不要用 root。

客户端二选一：

- 桌面版 VS Code（1.74+）加 **Remote - Tunnels** 扩展；
- 或者直接开浏览器访问 `vscode.dev`。

两端必须登录**同一个** GitHub 或 Microsoft 账号。建议顺手把二次验证打开——在这个模型里，账号就是钥匙。

如果机器在受限网络里，至少要放行这些域名：

```text
update.code.visualstudio.com
vscode.download.prss.microsoft.com
marketplace.visualstudio.com
*.gallerycdn.vsassets.io
global.rel.tunnels.api.visualstudio.com
```

前四个用于下载 CLI/Server 和扩展，最后一个用于隧道本身。公司代理环境记得在服务端设好 `HTTPS_PROXY`，否则表现通常是“登录成功但 server 下载不下来”。

## 服务端：安装 CLI

不需要装整个桌面版 VS Code，下载独立的 `code` CLI 就够了。官方下载页的 **Command Line Interface** 一栏也提供各平台的 CLI 包：[code.visualstudio.com/#alt-downloads](https://code.visualstudio.com/#alt-downloads)。

### Linux

先建目录，再把 CLI 解压进去：

```bash file="install-cli.sh"
mkdir -p ~/apps/vscode-cli ~/.local/bin
cd ~/apps/vscode-cli

# x86_64；ARM64 把 cli-alpine-x64 换成 cli-alpine-arm64
curl -fL 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' \
  -o vscode_cli.tar.gz

tar -xzf vscode_cli.tar.gz
ln -sf "$PWD/code" ~/.local/bin/code

echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
export PATH="$HOME/.local/bin:$PATH"

code --version
```

能打印出版本号就说明装好了。

> [!warning]
> 2022–2024 年的大量教程写的是 `os=cli-linux-x64`，这个地址现在会直接返回 **404**。官方文档已经改成 `cli-alpine-x64`：它是静态链接的二进制，不需要你真的运行 Alpine，普通 glibc 发行版也能跑。
>
> 如果你复制的是老脚本，先检查下载地址，不然会得到一句莫名其妙的 `gzip: stdin: not in gzip format`。

### Windows / macOS

各平台的包格式不一样，别拿 Linux 的 `tar` 命令硬套：

| 系统 | `os` 参数 | 解压方式 |
| --- | --- | --- |
| Linux x64 | `cli-alpine-x64` | `tar -xzf` |
| Linux ARM64 | `cli-alpine-arm64` | `tar -xzf` |
| Windows x64 | `cli-win32-x64` | `Expand-Archive` |
| macOS Intel | `cli-darwin-x64` | `unzip` |
| macOS Apple Silicon | `cli-darwin-arm64` | `unzip` |

Windows PowerShell（注册服务时需要管理员权限）：

```powershell
Invoke-WebRequest `
  -Uri 'https://code.visualstudio.com/sha/download?build=stable&os=cli-win32-x64' `
  -OutFile vscode_cli.zip
Expand-Archive vscode_cli.zip -DestinationPath $HOME\apps\vscode-cli
& "$HOME\apps\vscode-cli\code.exe" --version
```

macOS：

```bash
mkdir -p ~/apps/vscode-cli
cd ~/apps/vscode-cli
curl -fL 'https://code.visualstudio.com/sha/download?build=stable&os=cli-darwin-arm64' \
  -o vscode_cli.zip
unzip -o vscode_cli.zip
./code --version
```

> [!tip]
> 桌面版 VS Code 自带的 `code` 命令也能执行 `code tunnel`，官方是支持的。但如果你在 Windows 上遇到登录交互异常，或者 PATH 里同时有桌面版和独立 CLI，建议统一用独立 CLI 的绝对路径，别让两个 `code` 打架。

## 第一次启动：设备码登录

在远程机器上执行：

```bash
code tunnel --accept-server-license-terms --name lab-server
```

`--name` 是这台机器在客户端列表里显示的名字；不写的话会用主机名。名字建议只用**小写字母、数字和连字符**，别带空格、下划线或中文，省得在服务端校验时才发现不合法。

第一次运行会打印类似这样的内容：

```text
To grant access to the server, please log into
https://github.com/login/device and use code XXXX-XXXX
```

拿另一台设备打开链接，登录 GitHub 或 Microsoft 账号，输入这个码并授权。授权完成后，终端会给出：

```text
https://vscode.dev/tunnel/lab-server
```

这说明隧道已经建立。按 `Ctrl+C` 可以停掉前台进程。

CLI 默认优先使用 GitHub。想改用微软账号，先显式登录一次，凭据会被记住：

```bash
code tunnel user login --provider microsoft
# 或者
code tunnel user login --provider github
```

> [!tip]
> 设备码是**区分大小写**的。Windows 上不要开 `CapsLock`，需要大写时按住 `Shift` 输入——这是好几篇老博客都踩过的坑。
>
> 设备码本质上是一次账号登录授权。**不要截图发群，也不要发给任何自称“管理员”的人**；微软和 GitHub 不会向你索要这个码。

在完全无头的集群上，`user login` 还支持 `--access-token` / `--refresh-token` 做非交互登录，适合批处理任务。但 token 等同于账号凭据，别写进脚本仓库或 shell history。

## 常驻：别再拿终端挂着

前台运行只适合临时测试。SSH 一断、终端一关、机器一重启，隧道就没了。长期使用应该装成服务。

### Linux：systemd 用户服务

先登录，再安装服务：

```bash
code tunnel user login --provider github

code tunnel service install \
  --accept-server-license-terms \
  --name lab-server
```

安装命令会做三件事：写 unit 文件、`enable`、`start`。然后关键的一步是开启 linger：

```bash
sudo loginctl enable-linger "$USER"
loginctl show-user "$USER" | grep Linger
```

期望输出 `Linger=yes`。不开 linger 的话，systemd 的用户实例会在你退出 SSH 后被杀掉，服务看起来“装好了”，但人一走就断。

检查状态：

```bash
systemctl --user status code-tunnel --no-pager
code tunnel service log
```

`service log` 是查看服务日志的快捷方式，等价于跟着 `journalctl` 看；按 `Ctrl+C` 退出。

> [!note]
> 新版 CLI 生成的 unit 已经是 `WantedBy=default.target`，**不需要**像早期教程那样手动把 `multi-user.target` 改成 `default.target`。如果你看到的还是 `multi-user.target`，那多半是旧版本或手工改过的文件；改完执行：
>
> ```bash
> systemctl --user daemon-reload
> systemctl --user restart code-tunnel
> ```

服务名通常是 `code-tunnel.service`。如果 `systemctl --user status code-tunnel` 说 unit 不存在，先找一下实际名字：

```bash
systemctl --user list-units --type=service | grep -i tunnel
```

在容器里没有 systemd 的话，`service install` 会失败。这种环境只能用 `tmux`、`supervisor` 或容器自己的进程管理，或者把 tunnel 跑在宿主机上。

### Windows：注册为服务

用**管理员** PowerShell，在 CLI 所在目录执行：

```powershell
.\code.exe tunnel service install --accept-server-license-terms --name win-box
```

Windows 上最常见的报错是服务启动失败、事件日志里出现 **1069：由于登录失败而无法启动服务**。解决方法是把当前用户加入“作为服务登录”的白名单：

1. `Win+R` 输入 `secpol.msc`；
2. 本地策略 → 用户权限分配 → **作为服务登录**；
3. 把当前用户加进去；
4. 重新启动服务，或重跑一次 `service install`。

也可以在桌面版 VS Code 里走 UI：点左下角账号头像 → **Turn on Remote Tunnel Access**，或者命令面板执行 **Remote Tunnels: Turn on Remote Tunnel Access...**。但注意：**如果只是从 UI 开启，VS Code 退出后隧道就没了**；要长期在线，还是装成服务。

### WSL：先让 systemd 起来

在 WSL 里跑 tunnel 很舒服：Linux 工具链、GPU 透传、Windows 的文件系统都能兼顾。但 `service install` 依赖 systemd，而 WSL 默认不一定开。

在 WSL 里创建 `/etc/wsl.conf`：

```ini file="/etc/wsl.conf"
[boot]
systemd=true
```

然后在 Windows 侧执行 `wsl --shutdown`，重新进入 WSL，确认：

```bash
systemctl --user status
```

有了 systemd，再按 Linux 的步骤装服务，给每个发行版起不同的名字：

```bash
code tunnel service install --accept-server-license-terms --name ubuntu-22.04
```

如果你有多个 WSL 发行版，就在每个里面各装一次，名字别重复。没有 systemd 的话，老实说 `service install` 不是一条可行的路；可以用 Windows 任务计划程序在登录时拉起：

```powershell
wsl -d Ubuntu -u <user> -- /home/<user>/.local/bin/code tunnel --accept-server-license-terms --name ubuntu-22.04
```

或者接受“每次手动开一个终端”。

## 客户端连接

### 桌面版 VS Code（推荐）

1. 在扩展市场安装 **Remote - Tunnels**（`ms-vscode.remote-server`）；
2. 打开命令面板（`Ctrl/Cmd + Shift + P`），执行 **Remote Tunnels: Connect to Tunnel**；
3. 用和服务端**相同**的账号登录；
4. 在列表里选择 `lab-server`，然后打开远程目录。

连接成功后，左下角会出现绿色的远程指示器；也可以在 **Remote Explorer** 里管理已注册的机器。第一次打开项目时，VS Code 会提示在远程安装推荐扩展——语言服务、调试器这类扩展应该装在远程，UI 主题之类的留在本地。

一个很实用的组合是 **Tunnel + Dev Containers**：先连到远程主机，再执行 **Dev Containers: Reopen in Container**，本地甚至不需要装 Docker 客户端。WSL 也可以这样套：tunnel 跑在 Windows 上，客户端在 Remote Explorer 里选择 WSL 发行版。

### 浏览器：vscode.dev

不想装客户端时，直接打开：

```text
https://vscode.dev/tunnel/lab-server
```

登录同一个账号即可。它的好处是零安装，iPad、Chromebook、临时借来的电脑都能用；适合改几行代码、看日志、跑个命令。

但它终究是 Web 版：**扩展只能用 Web 兼容的那一部分**，部分调试器、终端集成和本地能力会受限。重度开发还是回桌面端。

### 2026 年的新入口

最近的版本把“远程环境”收拢到了一个新的面板里：

- 1.144 引入 **Remote Environments** 对话框，把 GitHub Environments、Dev Tunnels、WSL、SSH 放在同一个地方管理；
- 1.146 在 Agents 窗口里增加了实验性的 **Share this computer through Dev Tunnels**（设置项 `sessions.chat.experimental.remoteEnvironmentsThisComputer`），可以把本机的 agent 会话共享给其他设备，也能改客户端看到的机器名。

如果你只是用 VS Code 写代码，这些新入口不是必须的；如果你在用 Agents 窗口跑远程 agent 会话，它会让“在 A 电脑发起、在 B 电脑继续看”这件事顺很多。

## 命令速查

具体参数以 `code tunnel --help` 为准，下面是最常用的一组。

| 目的 | 命令 |
| --- | --- |
| 前台启动 | `code tunnel --accept-server-license-terms --name lab-server` |
| 登录 / 登出 | `code tunnel user login --provider github` / `code tunnel user logout` |
| 当前账号 | `code tunnel user show` |
| 查看状态 | `code tunnel status` |
| 改名 | `code tunnel rename new-name` |
| 停止当前隧道 | `code tunnel kill` |
| 重启当前隧道 | `code tunnel restart` |
| 清理未运行的 server | `code tunnel prune` |
| 注销这台机器 | `code tunnel unregister` |
| 安装 / 卸载服务 | `code tunnel service install ...` / `code tunnel service uninstall` |
| 查看服务日志 | `code tunnel service log` |
| 更新 CLI | `code update`（先检查：`code update --check`） |
| 前台防休眠 | `code tunnel --no-sleep` |
| 预装扩展 | `code tunnel --install-extension ms-python.python` |
| 调整断线保留时间 | `code tunnel --reconnection-grace-time 10800`（默认 10800 秒，即 3 小时） |
| 随机机器名 | `code tunnel --random-name` |

新版 `status` 输出的是 JSON，方便脚本处理。未运行时会看到类似：

```json
{"tunnel":null,"service_installed":false}
```

运行时字段会变，具体结构可能随版本调整，别把它当成稳定 API；拿 `jq` 取字段前先看一眼原始输出。

## 常见问题

**1. 服务装好了，重启后不自动恢复。**
先查 linger：`loginctl show-user "$USER" | grep Linger`。不是 `yes` 就执行 `sudo loginctl enable-linger "$USER"`。其次确认服务是 `enabled` 而不是只 `start` 过。

**2. 出现 `The unit file ... changed on disk`。**
说明 unit 文件被改过或升级过：

```bash
systemctl --user daemon-reload
systemctl --user restart code-tunnel
```

**3. 本地 VS Code 列表里看不到机器。**
按这个顺序查：

```bash
systemctl --user status code-tunnel --no-pager
code tunnel status
code tunnel user show
```

确认服务在跑、账号是同一个、机器名没记错。仍然不行就重注册一次：

```bash
code tunnel service uninstall
code tunnel unregister
code tunnel service install --accept-server-license-terms --name lab-server
```

**4. Windows 报 1069。**
按上一节的 `secpol.msc` 步骤，把用户加入“作为服务登录”。改完重启服务。

**5. CentOS 7 上 `systemctl --user` 报错。**
老教程会教你写全局 service、改 `WantedBy`。但在 2026 年这条路的性价比很低：VS Code 1.99+ 的 Server 要求 **glibc ≥ 2.28**，CentOS 7 自带 2.17，服务端根本跑不起来。换 Ubuntu 22.04+/Debian 12+ 更实际；官方 FAQ 里确实有一个用 sysroot 打补丁的办法，但那是非正式支持的 workaround，不值得为它留在 CentOS 7。

**6. 下载 CLI 时报 404，或者解压报 `not in gzip format`。**
九成是用了旧的 `cli-linux-x64`。换成 `cli-alpine-x64`；ARM64 用 `cli-alpine-arm64`。如果公司网络拦截，先手动下载再传到服务器。

**7. `code: command not found`。**
`~/.local/bin` 不在 PATH 里。重新登录 shell，或者在命令里用绝对路径 `~/apps/vscode-cli/code`。systemd 服务不读你的 `.bashrc` 也没关系，它记录的是安装时 CLI 的绝对路径。

**8. `service install` 卡在设备码。**
它可能在安装过程中重新走了一次登录。把终端里给出的链接和码完成授权即可。想避免这种交互，先单独执行 `code tunnel user login --provider github`，再装服务。

**9. 设备码一直提示无效。**
检查系统时间是否准确、是否在代理后面、有没有把 `0` 和 `O` 看混；Windows 上确认没有开 `CapsLock`。换一个浏览器或换 GitHub/Microsoft 账号再试。

**10. 超过 10 个 tunnel。**
先 `code tunnel prune` 清理未运行的 server，再把不用的机器 `code tunnel unregister` 掉。一个账号下的机器数量是有限的。

**11. 长任务跑到一半断了。**
Tunnel 断线不等于远程进程立刻死，但 VS Code 更新、Server 重启、终端关闭都可能带走前台进程。把长任务放进 `tmux`：

```bash
tmux new -s work
# 断线后重新连接
tmux attach -t work
```

**12. 机器休眠，隧道跟着断。**
`--no-sleep` 只对前台运行的 `code tunnel` 生效，`service install` 没有这个参数。装成服务后，要在系统电源策略里禁止休眠，或者用 `systemd-inhibit` 包一层。服务器上的“睡眠”通常不是省电，而是灾难。

**13. 服务反复重启。**
先看 `code tunnel service log` 或 `journalctl --user -u code-tunnel -n 100 --no-pager`。常见原因是 glibc 太老、HOME 没设对、代理不通、Server 下载失败。加 `--verbose` 或 `--log trace` 前台跑一次，通常比盯着 systemd 猜更快。

## 安全边界

Tunnel 的信任模型很朴素：**两端登录同一个账号，就能连**。所以：

- 给账号开二次验证，别把账号共享给同事；
- 设备码只输入到 `github.com/login/device` 或 `microsoft.com/devicelogin`；
- 远程机器用普通用户跑，不要 `sudo code tunnel`；
- 隧道是远程机器主动出站，不对外监听入站端口，一般不需要改防火墙；真正建立连接后，VS Code 会在隧道里再套一层 SSH，官方说当前首选加密是 AES-256-CTR；
- 流量经微软中继转发，内容有端到端加密，但中继方仍能看到连接元数据；对合规敏感的项目先确认公司政策；
- 组织可以通过允许/拒绝 `global.rel.tunnels.api.visualstudio.com` 来统一管控；
- 不要把它包装成对外的多人 IDE 服务：许可证允许个人和内部使用，不允许把它作为公共服务转售或托管。

## 一页脚本

下面是一套从零开始的 Linux 安装脚本，适合 Ubuntu 22.04+/Debian 12+ 这类 systemd 正常的机器。第一次运行需要按提示完成一次设备码登录。

```bash file="setup-tunnel.sh"
#!/usr/bin/env bash
set -euo pipefail

NAME="${1:-lab-server}"
CODE_DIR="$HOME/apps/vscode-cli"
CODE_BIN="$CODE_DIR/code"

mkdir -p "$CODE_DIR" "$HOME/.local/bin"
cd "$CODE_DIR"

# x86_64；ARM64 改成 cli-alpine-arm64
curl -fL 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' \
  -o vscode_cli.tar.gz

tar -xzf vscode_cli.tar.gz
ln -sf "$CODE_BIN" "$HOME/.local/bin/code"
export PATH="$HOME/.local/bin:$PATH"

# 持久化 PATH
case "$(basename "${SHELL:-bash}")" in
  zsh) RC="$HOME/.zshrc" ;;
  bash) RC="$HOME/.bashrc" ;;
  *) RC="$HOME/.profile" ;;
esac
PATH_LINE='export PATH="$HOME/.local/bin:$PATH"'
grep -qxF "$PATH_LINE" "$RC" 2>/dev/null || echo "$PATH_LINE" >> "$RC"

"$CODE_BIN" --version

# 第一次需要设备码；按提示在浏览器完成授权
"$CODE_BIN" tunnel user login --provider github

# 安装并启动 systemd 用户服务
"$CODE_BIN" tunnel service install \
  --accept-server-license-terms \
  --name "$NAME"

# 用户服务在登出/重启后继续运行
sudo loginctl enable-linger "$USER"

systemctl --user status code-tunnel --no-pager || true
"$CODE_BIN" tunnel status
```

用完检查三件事：`loginctl show-user "$USER" | grep Linger` 是 `yes`、`systemctl --user status code-tunnel` 是 `active (running)`、`code tunnel status` 里能看到这台机器。然后去客户端用同一个账号连接即可。

## 该不该用它

如果符合下面任意一条，Tunnel 很值得：

- 机器在 NAT、校园网、公司内网后面，没有公网 IP；
- 你经常换网络，SSH 长连接老断；
- 想用浏览器/iPad 临时写代码；
- 本地机器弱，想把编译、调试、模型推理都放到远程；
- 不想为了远程开发再维护一台 frp 服务器。

如果机器本来就有稳定的公网 SSH，或者你需要 `scp`、`rsync`、任意端口转发，Remote - SSH 仍然更直接。两者并不冲突：日常用 Tunnel，关键时刻留一条 SSH 或 Tailscale 作为后路，是更稳的配置。

最后记住一句话：**Tunnel 是“把 VS Code 送过去”，不是“把机器暴露出来”。** 方向搞对了，很多安全和使用上的疑问就自然有了答案。

参考：

- [Developing with Remote Tunnels](https://code.visualstudio.com/docs/remote/tunnels)
- [VS Code Server](https://code.visualstudio.com/docs/remote/vscode-server)
- [Remote Development FAQ](https://code.visualstudio.com/docs/remote/faq)
- [VSCode Tunnel - VSCode 隧道安装篇](https://www.cnblogs.com/minskiter/p/16986874.html)
- [vscode 的隧道功能太好用了，你值得拥有](https://blog.csdn.net/zhilinxiangtian/article/details/152258535)
- [使用 VS Code Remote Tunnel 进行远程开发](https://jinggqu.github.io/posts/remote-tunnel/)