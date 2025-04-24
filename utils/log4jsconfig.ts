import { configure, getLogger, Logger } from "log4js";

export class logger{

    static log(): Logger {
        configure('./utils/log4js.json');
        return getLogger("default");
    }
}
