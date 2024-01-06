import React, { createContext, useState, useContext } from 'react';
import { IntlProvider } from 'react-intl';
import messages_en from '../locales/en.json';
import messages_es from '../locales/es.json';
import messages_fr from '../locales/fr.json';
import messages_el from '../locales/el.json';
import message_de from '../locales/de.json';
import message_it from '../locales/it.json';
import message_pt from '../locales/pt.json';
import message_nl from '../locales/nl.json';
import message_ru from '../locales/ru.json';
import message_zh from '../locales/zh.json';
import message_ja from '../locales/ja.json';
import message_lv from '../locales/lv.json';

interface Messages {
    [key: string]: {
        [key: string]: string;
    };
}

const messages: Messages = {
    en: messages_en,
    es: messages_es,
    fr: messages_fr,
    el: messages_el,
    de: message_de,
    it: message_it,
    pt: message_pt,
    nl: message_nl,
    ru: message_ru,
    zh: message_zh,
    ja: message_ja,
    lv: message_lv,
};

const LocaleContext = createContext({
    locale: 'en', // default value
    setLocale: (locale: string) => { }
});

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState('en');

    return (
        <LocaleContext.Provider value={{ locale, setLocale }}>
            <IntlProvider locale={locale} messages={messages[locale]}>
                {children}
            </IntlProvider>
        </LocaleContext.Provider>
    );
};
