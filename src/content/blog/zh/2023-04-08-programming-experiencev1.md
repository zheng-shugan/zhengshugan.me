---
title: "编程经验 v1.0"
date: 2023-04-08T10:30:35+08:00
draft: true
---

## toc



很难忘记在学第一门编程语言配置环境时候狼狈的样子：又是下载 GCC 又是配置环境变量的，等到终于学完语法基础了，工程化的时候依赖/包管理又是一件很烦的事情。

大学三年了，对学习编程语言也有一些经验了。大概就是

- 用系统包管理器安装环境
- 配置环境变量
- 掌握依赖/包管理


在这也说说学编程语言以来的几个经验

## 代码规范

不知道为什么很多网课和教程都不讲各种语言的代码规范，但这是写代码中很重要的一部分，在学完一门编程语言的顺序结构、分支结构、循环结构和函数之后就可以开始把代码规范引入了。

如果是学第二门编程语言建议一开始就去了解一下某个语言的代码规范是怎么样的，这样保证了在自己的项目里写的代码不至于一下就忘记是拿去干什么用的。

## JavaSctipt

学习 JavaScript 只推荐两本书和一个网站：《DOM 编程艺术》和《你不知道的 JavaScript》，和 MDN 的 JavaScript 文档。

学习 JavaScript 一定不能离开 DOM，现代所有前端框架都是以 DOM 为基础来构建的，很多人说自己的 JS 基础不好很大一部分原因就是因为没有好好了解 DOM。
									
《你不知道的 JavaScript》里很好的描述了如何避免 JS 的垃圾设计带来额外的心智负担，也是这本书让我看见了 JS 是多么的丑陋。

可以吧 MDN 理解成一本《JavaScript 高级程序设计》和《JavaScript 权威指南》的网页版。虽然在内容的顺序上有些不太一样，但三者的特点都是 JavaScript 的百科指南，可以当作工具书来用是非常好用的。

代码规范这个的东西一定要从开始学代码就开始养成，特别是对于 JavaScript 这样动态弱类型的语言，没有一个严格的代码规范很容易写完代码过一周就不知道自己写的是什么了。

## TypeScript

TypeScript 的类型系统真是是强大但复杂，想要写出好的 TypeScript 类型还是比较麻烦的，很考验类型体操的能力。

比如
```ts
const foo = <T extends any>(n: T) => {

console.log(n);

}

foo('Hello TypeScript')
```
和
```ts
const bar = (n: any) => {

console.log(n);

}

bar('Hello TypeScript')
```

这两个函数乍一看感觉是一模一样的，但第一个的 IDE 提示要远比第二个要好的多。

作为全栈开发这你可以用 `nestjs` 来做后端，支持 TypeScript 的前端框架那更是数不胜数，如果你的精力有限又想做自己的产品，TypeScript 会是一个很好的选择。

但不要指望用了 TypeScript 就可以不要写代码文档了，代码好不好维护很多时候和语言没有什么关系，更多的是在于写代码的人的规范是怎么样的。

## Git

git 可以说是最劝退新人的一个工具了：不熟悉的命令行操作、网络环境、环境配置。这些问题很容易就能把一个小白给直接劝退了。

在个人项目里用 git 最大的好处就是备份文件了，只要多多 `commit` 基本不用担心不小心把文件删了该怎么办、多写了几行代码项目突然不能运行了不会回滚的惨剧。

## 包管理工具

不管你是想做前端还是后端开发，等到学习项目工程化的时候包管理工具是不可避免要接触的。包管理工具就是让我们更加方便的去使用别人已经写好的代码，只要敲几行命令、配置一下文件就能下载到别人发布的代码。

比如 Java 的 `maven` 和 `gradle`，JavaScript 的 `npm` 还有 Python 的 `pip` 等等。

但更方便的是用系统的包管理工具，大部分编程环境的依赖下载好的同时就能帮我们把环境变量给配置好，简直是一举两得啊，我忘不了在第一次学 C 去配置 GCC 环境在各种配置里跳来跳去的惨剧啊......

在这也推荐几个常用的包管理工具
macOS：homebrew
Windows：chocolatey

各个 Linux 的发行版都有自己的包管理工具，用官方自带的就可以了。

想要方便的使用记得一定要换一个国内的镜像源，或者是配置一下系统终端的科学上网代理。
