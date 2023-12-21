import fs from "fs";
import path from "path";
import {runCommand, findParentDirContainingFile} from "./node-util.js";
import {DeclaredError} from "./js-util.js";

async function onDeploy(hookEvent) {
	let gitFolder=findParentDirContainingFile(hookEvent.prefix,".git");
	if (!gitFolder)
		throw new Error(hookEvent.prefix+" is not revision controlled (did not find .git in any parent dir)")

	console.log("Checking git status for: "+gitFolder);

	if (!fs.existsSync(path.join(gitFolder,".gitignore")))
		throw new DeclaredError(".gitignore missing");

	let gitIgnore=fs.readFileSync(path.join(gitFolder,".gitignore"),"utf8");
	let gitIgnoreLines=gitIgnore.split("\n").map(s=>s.trim());

	if (!gitIgnoreLines.includes("node_modules"))
		throw new DeclaredError("node_modules is not in .gitignore, see: https://sabe.io/blog/git-ignore-node_modules");

	let gitOutput=await runCommand("git",["--git-dir",path.join(gitFolder,".git"),"status","--porcelain"]);
	if (gitOutput.split("\n").filter(f=>f).length)
		throw new DeclaredError("There are modified files, please commit first");

	console.log("Git repo is clean!");
}

export function registerHooks(runner) {
	runner.on("deploy",onDeploy,{
		description: "Check that git is properly set up, and that the code is committed."
	});
}