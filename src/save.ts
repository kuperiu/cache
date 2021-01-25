import * as fs from "fs";
import * as fsextra from "fs-extra";
import * as path from "path";

import * as cache from "@actions/cache";
import * as core from "@actions/core";

import { CacheDir, Events, Inputs, State } from "./constants";
import * as utils from "./utils/actionUtils";

async function run(): Promise<void> {
    try {
        if (! fs.existsSync(CacheDir)) {
            utils.logWarning("Cache folder wasn't found, Check EFS attachment to the runner");
            return;
        }

        const state = utils.getCacheState();

        // // Inputs are re-evaluted before the post action, so we want the original key used for restore
        const primaryKey = core.getState(State.CachePrimaryKey);
        if (!primaryKey) {
            utils.logWarning(`Error retrieving key from state.`);
            return;
        }

        if (utils.isExactKeyMatch(primaryKey, state)) {
            core.info(
                `Cache hit occurred on the primary key ${primaryKey}, not saving cache.`
            );
            return;
        }

        const cachePaths = utils.getInputAsArray(Inputs.Path, {
            required: true
        });


        try {
            for (let cachePath of cachePaths) {
                //create chache dir   
                if (cachePath.charAt(0) == "~") {
                    const home = process.env["HOME"] || "/home/runner"
                    cachePath = cachePath.replace("~", home)
                }
                const dir = CacheDir + "/" + process.env["GITHUB_REPOSITORY"] + "/" + primaryKey + "/" + cachePath
                
                fs.mkdir(dir, { recursive: true }, (err) => {
                    if (err) return err;
                });
                    fsextra.copy(cachePath, dir), err => {
                        if (err) return err;
                    }
            }

        } catch (error) {
            utils.logWarning(error.message);
        }
    } catch (error) {
        utils.logWarning(error.message);
    }
}

run();

export default run;
