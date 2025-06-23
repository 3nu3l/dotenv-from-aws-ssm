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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const client_ssm_1 = require("@aws-sdk/client-ssm");
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
function getParameter(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const region = process.env.AWS_DEFAULT_REGION || 'us-east-1';
        const ssm = new client_ssm_1.SSMClient({ region });
        const input = {
            Name: name,
            WithDecryption: true
        };
        const command = new client_ssm_1.GetParameterCommand(input);
        const response = yield ssm.send(command);
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
                try {
                    const value = yield getParameter(awsPath.trim());
                    fileData += `${key}=${value}\n`;
                }
                catch (error) {
                    if (error instanceof Error) {
                        console.error(`Error al obtener el parámetro para el path ${awsPath}: ${error.message}`);
                    }
                    else {
                        console.error(`Error al obtener el parámetro para el path ${awsPath}`);
                    }
                }
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
