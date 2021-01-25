"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cache = __importStar(require("@actions/cache"));
const core = __importStar(require("@actions/core"));
const fsextra = __importStar(require("fs-extra"));
const constants_1 = require("./constants");
const utils = __importStar(require("./utils/actionUtils"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (utils.isGhes()) {
                utils.logWarning("Cache action is not supported on GHES");
                utils.setCacheHitOutput(false);
                return;
            }
            // Validate inputs, this can cause task failure
            if (!utils.isValidEvent()) {
                utils.logWarning(`Event Validation Error: The event type ${process.env[constants_1.Events.Key]} is not supported because it's not tied to a branch or tag ref.`);
                return;
            }
            const primaryKey = core.getInput(constants_1.Inputs.Key, { required: true });
            core.saveState(constants_1.State.CachePrimaryKey, primaryKey);
            const restoreKeys = utils.getInputAsArray(constants_1.Inputs.RestoreKeys);
            const cachePaths = utils.getInputAsArray(constants_1.Inputs.Path, {
                required: true
            });
            try {
                for (let cachePath of cachePaths) {
                    //create chache dir   
                    if (cachePath.charAt(0) == "~") {
                        const home = process.env["HOME"] || "/home/runner";
                        cachePath = cachePath.replace("~", home);
                    }
                    const dir = constants_1.CacheDir + "/" + process.env["GITHUB_REPOSITORY"] + "/" + primaryKey + "/" + cachePath;
                    fsextra.copy(cachePath, dir), err => {
                        if (err)
                            return err;
                    };
                }
                // const cacheKey = await cache.restoreCache(
                //     cachePaths,
                //     primaryKey,
                //     restoreKeys
                // );
                // if (!cacheKey) {
                //     core.info(
                //         `Cache not found for input keys: ${[
                //             primaryKey,
                //             ...restoreKeys
                //         ].join(", ")}`
                //     );
                //     return;
                // }
                // // Store the matched cache key
                // utils.setCacheState(cacheKey);
                // const isExactKeyMatch = utils.isExactKeyMatch(primaryKey, cacheKey);
                // utils.setCacheHitOutput(isExactKeyMatch);
                // core.info(`Cache restored from key: ${cacheKey}`);
            }
            catch (error) {
                if (error.name === cache.ValidationError.name) {
                    throw error;
                }
                else {
                    utils.logWarning(error.message);
                    utils.setCacheHitOutput(false);
                }
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
exports.default = run;
