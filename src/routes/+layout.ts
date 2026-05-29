import { waitLocale } from 'svelte-i18n';

export const ssr = false; // Because i18n relies on window.localStorage initially in this setup

export async function load() {
    await waitLocale();
    return {};
}
