---
title: "Web 工具链换源"
date: 2022-11-30T22:42:23+08:00
draft: true
---

[[toc]]



## 配置的烦恼

每次用个新的工具链都要先看一下怎么换到国内源，要不然那个下载速度实在是太感人了。虽然我用的 macOS 但除了 Homebrew 的配置，其他配置在 Windows 都可以生效。

在这也感谢各机构备份镜像源，如果没有镜像源都不敢想在安装依赖的的时候要多花多少时间。

## 系统设置

### Homebrew

Homebrew 是 macOS 下的一个包管理工具，可以很方便的去安装、管理各种开发环境和软件，如果你用的也是 macOS 作为开发平台 homebrew一定不可错过的一个好工具。

查看当前源：

```zsh
cd "$(brew --repo)" && git remote -v
```
替换为清华源：
```zsh
git -C "$(brew --repo)" remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git 
git -C "$(brew --repo homebrew/core)" remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git
git -C "$(brew --repo homebrew/cask)" remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-cask.git

echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles' >> ~/.zshrc
source .zshrc
```
## Node
正式因为 Node 的出现前端才越来越组件化、工程化，Node.js 的发展也证明它不仅可以在前端发光发热，在后端领域也是有着不少合适的领域。

npm、yarn、pnpm 都是前端的包管理工具，个人更偏爱 pnpm 一点但是 yarn 在键盘上的位置更好按哈哈哈哈

### pnpm
```zsh
# 查看当前源
pnpm get registry
# 设置 pnpm 镜像源为淘宝镜像
pnpm config set registry https://registry.npmmirror.com/
```

### yarn
```zsh
# 查看当前源
yarn get registry
# 设置 yarn 镜像源为淘宝镜像
yarn config set registry https://registry.npmmirror.com/
```

### npm

```zsh 
# 查看当前源
npm get registry
# 设置 npm 镜像源为淘宝镜像
npm config set registry https://registry.npmmirror.com/  
```

## Python

说到编程语言怎么能少的了 Python 呢，虽然纯 Python 的岗位不多但是 Python 上手真的是非常友好了。Python 也有着超多的第三方库，我完成的第一个小游戏飞机大涨就是用 Python 和 PyGame 写出来的。

### pip

查看当前源：

```zsh
pip config list
```

替换为清华源：

```zsh
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### Anaconda

```zsh
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/pytorch/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/pytorch/linux-64/
conda config --set show_channel_urls yes
```

## Java

### Maven

配置 Maven 的镜像源要先找到 Maven 的配置文件 setting.xml 然后在 `<settings>...</settings>` 标签内添加：

```xml
  <mirrors>
    <mirror>
      <id>alimaven</id>
      <name>aliyun maven</name>
      <mirrorOf>central</mirrorOf>
      <url>https://maven.aliyun.com/repository/central</url>
    </mirror>
  </mirrors>
```




