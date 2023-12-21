import {spawn} from "child_process";
import fs from "fs";
import path from "path";

export async function runCommand(command, args=[], options={}) {
	const child=spawn(command, args, options);
	let out="";

	await new Promise((resolve,reject)=>{
		child.stdout.on('data', (data) => {
			if (options.passthrough)
				process.stdout.write(data);

			out+=data;
		});

		child.stderr.on('data', (data) => {
			if (options.passthrough)
				process.stderr.write(data);

			else
				console.log(`stderr: ${data}`);
		});

		child.on('close', (code) => {
			if (code) {
				console.log(out);
				return reject(new Error(command+" exit code: "+code))
			}

			resolve();
		});
	});

	return out;
}

export function findParentDirContainingFile(cwd, fn) {
	if (fs.existsSync(path.join(cwd,fn)))
		return cwd;

	if (cwd==path.dirname(cwd))
		return;

	cwd=path.dirname(cwd);

	return findParentDirContainingFile(cwd,fn);
}