import * as fs from "fs";
import * as shell from 'shelljs';

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
            const dir = CacheDir + "/" + process.env["GITHUB_REPOSITORY"]
            fs.mkdir(dir, { recursive: true }, (err) => {
                if (err) return err;
            });
            const cachePathsStr = cachePaths.join(" ")
            const archiveFile = '/tmp/' + primaryKey + '.tar.gz'
            if (shell.exec('tar czvf ' + archiveFile + ' ' + cachePathsStr).code !== 0) {
                throw new Error(`unable to archive`)
            }
            fs.copyFileSync(archiveFile, dir)
            
        } catch (error) {
            utils.logWarning(error.message);
        }
    } catch (error) {
        utils.logWarning(error.message);
    }
}

run();

export default run;
