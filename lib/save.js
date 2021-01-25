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
const fs = __importStar(require("fs"));
const shell = __importStar(require("shelljs"));
const core = __importStar(require("@actions/core"));
const constants_1 = require("./constants");
const utils = __importStar(require("./utils/actionUtils"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!fs.existsSync(constants_1.CacheDir)) {
                utils.logWarning("Cache folder wasn't found, Check EFS attachment to the runner");
                return;
            }
            const state = utils.getCacheState();
            // // Inputs are re-evaluted before the post action, so we want the original key used for restore
            const primaryKey = core.getState(constants_1.State.CachePrimaryKey);
            if (!primaryKey) {
                utils.logWarning(`Error retrieving key from state.`);
                return;
            }
            if (utils.isExactKeyMatch(primaryKey, state)) {
                core.info(`Cache hit occurred on the primary key ${primaryKey}, not saving cache.`);
                return;
            }
            const cachePaths = utils.getInputAsArray(constants_1.Inputs.Path, {
                required: true
            });
            try {
                const dir = constants_1.CacheDir + "/" + process.env["GITHUB_REPOSITORY"];
                fs.mkdir(dir, { recursive: true }, (err) => {
                    if (err)
                        return err;
                });
                const cachePathsStr = cachePaths.join(" ");
                const archiveFile = '/tmp/' + primaryKey + '.tar.gz';
                if (shell.exec('tar czvf ' + archiveFile + ' ' + cachePathsStr).code !== 0) {
                    throw new Error(`unable to archive`);
                }
                fs.copyFileSync(archiveFile, dir);
            }
            catch (error) {
                utils.logWarning(error.message);
            }
        }
        catch (error) {
            utils.logWarning(error.message);
        }
    });
}
run();
exports.default = run;
