const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const semver = require("semver");
const { version: currentVersion } = require("../package.json");
const { prompt } = require("enquirer");
const execa = require("execa");

// 版本类型
const versionIncrements = [
  "patch",
  "minor",
  "major",
  "prepatch",
  "preminor",
  "premajor",
  "prerelease",
];

// 步骤打印
const step = (msg) => console.log(chalk.green(msg));

// 增加版本号
const inc = (i) => semver.inc(currentVersion, i);

// 运行脚本
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: "inherit", ...opts });

/**
 * 更新版本号
 * @param {string} version
 */
function updatePackage(version) {
  const pkgPath = path.resolve(__dirname, "../package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  step(`updated package.json version to ${version}\n`);
}

/**
 * 提交 打标签 推送到远程仓库 并发布
 * @param {string} version
 */
async function publish(version) {
  try {
    await run("npm", ["run", "build"]);
    await run("git", ["add", "-A"]);
    await run("git", ["commit", "-m", `build: release: ${version}`]);
    await run("git", ["tag", "-a", version, "-m", `${version}`]);
    await run("npm", ["publish"]);
    step(`push version to ${version}\n`);
  } catch (error) {
    throw new Error(error);
  }
}

// 主函数
async function main() {
  let version;

  const { release } = await prompt({
    type: "select",
    name: "release",
    message: "Select release type",
    choices: versionIncrements
      .map((i) => `${i} (${inc(i)})`)
      .concat(["custom"]),
  });

  if (release === "custom") {
    version = (
      await prompt({
        type: "input",
        name: "version",
        message: "Input custom version",
        initial: version,
      })
    ).version;
  } else {
    version = release.match(/\((.*)\)/)[1];
  }

  if (!semver.valid(version)) {
    throw new Error(`invalid target version: ${version}`);
  }
  updatePackage(version);
  await publish(version);
}

main().catch((err) => {
  console.error(err);
});
