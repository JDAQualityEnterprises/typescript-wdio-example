
import log4js from 'log4js';

let log = function(){
    log4js.configure('./utils/log4js.json');
    return log4js.getLogger("default");
}

module.exports={
    log
}
