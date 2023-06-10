"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
function getParameter(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const region = process.env.AWS_DEFAULT_REGION || 'sa-east-1';
        const ssm = new aws_sdk_1.default.SSM({ region });
        const response = yield ssm
            .getParameter({
            Name: name,
            WithDecryption: true
        })
            .promise();
        if (response.Parameter && response.Parameter.Value) {
            return response.Parameter.Value;
        }
        else {
            throw new Error(`Failed to retrieve parameter: ${name}`);
        }
    });
}
function parseEnvMap(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield readFileAsync(filename, 'utf8');
            return data.split('\n');
        }
        catch (err) {
            console.log(`${filename} file not found`);
            return null;
        }
    });
}
function writeEnv(envMap, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileData = '';
        for (let line of envMap) {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, awsPath] = line.split('=');
                const value = yield getParameter(awsPath.trim());
                const filteredKey = key.replace(/[^A-Z]/g, ''); // Filter out non-uppercase letters
                fileData += `${filteredKey}=${value}\n`;
            }
        }
        yield writeFileAsync(filename, fileData);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const filename = core.getInput('inputFilename') || '.env.map';
        const envMap = yield parseEnvMap(filename);
        if (envMap !== null) {
            const outputFilename = core.getInput('outputFilename') || '.env';
            yield writeEnv(envMap, outputFilename);
            console.log(`${outputFilename} file created successfully`);
        }
        else {
            console.log(`Could not create ${filename} file`);
        }
    });
}
main().catch(error => {
    console.error(error);
    core.setFailed(error.message);
});
