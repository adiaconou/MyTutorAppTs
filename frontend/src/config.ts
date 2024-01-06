
import ENFlag from './assets/flags/flag_en.svg';
import ESFlag from './assets/flags/flag_es.svg';
import ELFlag from './assets/flags/flag_el.svg';
import FRFlag from './assets/flags/flag_fr.svg';
import DEFlag from './assets/flags/de.svg';
import ITFlag from './assets/flags/it.svg';
import PTFlag from './assets/flags/pt.svg';
import NLFlag from './assets/flags/nl.svg';
import RUFlag from './assets/flags/ru.svg';
import ZHFlag from './assets/flags/cn.svg';
import JAFlag from './assets/flags/jp.svg';
import LVFlag from './assets/flags/lv.svg';

interface Config {
    languages: Record<string, string>;
    languageToFlagIcon: Record<string, string>;
}

const getConfig = (): Config => {
    
    const languages: Record<string, string> = {
        English: 'en',
        Spanish: 'es',
        French: 'fr',
        German: 'de',
        Italian: 'it',
        Portuguese: 'pt',
        Dutch: 'nl',
        Russian: 'ru',
        Chinese: 'zh',
        Japanese: 'ja',
        Greek: 'el',
        Latvian: 'lv',
    };
    
    // Flag library: https://flagicons.lipis.dev/#:~:text=Free%20Country%20Flags%20in%20SVG,2%20Flags
    const languageToFlagIcon: Record<string, string> = {
        en: ENFlag,
        es: ESFlag,
        el: ELFlag,
        fr: FRFlag,
        de: DEFlag,
        it: ITFlag,
        pt: PTFlag,
        nl: NLFlag,
        ru: RUFlag,
        zh: ZHFlag,
        ja: JAFlag,
        lv: LVFlag,
    };

    return {
        languages,
        languageToFlagIcon,
    };
};

const config = getConfig();

export default config;
