---
title: "关于新学一门编程语言的痛"
---

## toc



只要掌握编程语言中某一种某种思想，其实对于掌握其他的编程语言就已经打下了十分牢固的基础。但配置编程语言环境不是啊～

幸运的是我学的第一门编程语言是 C 语言，第一次使用的 IDE 是 Xcode，安装完完整的 Xcode 之后会得到：GCC、Git 等各种编程需要用到的环境，让我在写 C 语言的时候十分的舒服。在我学习 Python 的时候，恰好电脑里又有 Python2 的环境，这也让我省去了配置环境的麻烦。

直到我开始学习《算法 4》，书中的使用到的库并不是 Java 的标准库而是作者根据书的需求写的，光是配置那个 Java 的环境变量就折腾了好久；然后又是 Pyhon 之间的版本差异又折腾了老半天。在使用 VSCode 配置 Go 编程环境的时候又搞了一小会，最后是在知乎上找到[解决 VSCode 安装 Go 插件失败的问题](https://zhuanlan.zhihu.com/p/387853200)才解决的。

最近开始学习 Ruby，系统自带的 Ruby 是 2.x.x 版本，而且系统自带的 gem 每次执行 `gem install` 就显示“权限不够”，意思就是要用 `sudo gem install xxx` 才行，而一条要用 `sudo` 就意味着它的不凡，可能是会对电脑造成不可逆的“伤害”（虽然我已经使用 `sudo gem install xxx` 安装了一个包），最后看了 Ruby China 上的[如何快速正确的安装 Ruby, Rails 运行环境](https://ruby-china.org/wiki/install_ruby_guide)就解决了。

虽然不是对每门编程语言都很熟悉，但是电脑里还是需要有其的运行环境万一需要用到了嘛。在安装编程语言环境上 macOS 秒杀 Windows 18 条街，有 homebrew 真的少走了很多坑，如果是 Windows 估计我还在搜索引擎上找资料。



PS. 还是运行 JavaScript 方便，现代浏览器就可以～
