/*********************************************************************************** *
 * MIT License
 *
 * Copyright (c) 2017 Raphael "rGunti" Guntersweiler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ********************************************************************************* */

import * as fs from 'fs';

export interface ConfigObject {
    title:string;
}

export class PackageInfo implements ConfigObject {
    public title:string;

    public name:string;
    public version:string;
    public description:string;
    public license:string;
    public author:string;
    public keywords:string[];

    public scripts:object;

    public dependencies:object;
    public devDependencies:object;
}

export class ConfigReader {
    public static DEFAULT_FILE:string = "config.json";
    private static currentConfig:ConfigObject;
    private static packageInfo:PackageInfo;

    public static readDefaultConfig<T extends ConfigObject>():void {
        ConfigReader.setConfig(ConfigReader.readConfig(process.env.CONFIG_PATH || ConfigReader.DEFAULT_FILE));
        ConfigReader.packageInfo = ConfigReader.readConfig('package.json');
    }

    public static readConfig<T extends ConfigObject>(path:string):T {
        let fileReader = fs.readFileSync(path);
        let fileContent:string = fileReader.toString();
        return JSON.parse(fileContent) as T;
    }

    public static getConfig<T extends ConfigObject>():T {
        return ConfigReader.currentConfig as T;
    }

    public static setConfig(config:ConfigObject):void {
        ConfigReader.currentConfig = config;
    }

    public static getPackageConfig():PackageInfo {
        return ConfigReader.packageInfo;
    }
}
